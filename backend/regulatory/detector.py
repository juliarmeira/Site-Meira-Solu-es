"""Transactional snapshots and append-only, source-backed status assessments."""
import json
from datetime import datetime
from backend.database.models import Source, Regulation, RegulationVersion, CrawlLog, RegulationStatus, StatusAssessment
from backend.regulatory.validity import classify_validity, extract_norm_metadata, CLASSIFIER_VERSION


def latest_assessment(db, reg_id):
    return db.query(StatusAssessment).filter_by(regulation_id=reg_id).order_by(StatusAssessment.id.desc()).first()


def assess_document(doc):
    title, url, kind = doc['title'], doc['official_url'], doc['document_type']
    decisions = [(classify_validity(title, url, kind, n['text']), n) for n in doc.get('notices', [])]
    supported = [(d, n) for d, n in decisions if d[0] in (RegulationStatus.REVOKED, RegulationStatus.PARTIALLY_ACTIVE, RegulationStatus.SUPERSEDED)]
    statuses = {d[0] for d, _ in supported}
    if len(statuses) > 1:
        return RegulationStatus.PENDING_REVIEW, 'conflicting_notices', [n for _, n in supported]
    if supported:
        return supported[0][0][0], supported[0][0][1], [n for _, n in supported]
    status, method, _ = classify_validity(title, url, kind)
    return status, method, []


class ChangeDetector:
    def __init__(self, db):
        self.db = db

    def process_crawl_results(self, crawl_data):
        if crawl_data.get('status') != 'SUCCESS' or not crawl_data.get('source_url'):
            return {'status': 'ERROR', 'message': 'Invalid crawl data'}
        try:
            result = self._process(crawl_data)
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise

    def _process(self, data):
        now = datetime.utcnow()
        source = self.db.query(Source).filter_by(url=data['source_url']).first()
        if not source:
            source = Source(name=data.get('page_title', 'MAPA'), url=data['source_url'], authority='MAPA')
            self.db.add(source)
            self.db.flush()
        source.last_checked_at = now
        counts = {'new_count': 0, 'updated_count': 0, 'no_change_count': 0, 'status_changed': 0, 'removed_count': 0}
        changes, seen = [], set()
        for doc in data.get('discovered_documents', []):
            url = doc['official_url']
            seen.add(url)
            reg = self.db.query(Regulation).filter_by(source_id=source.id, official_url=url).first()
            is_new = reg is None
            if is_new:
                reg = Regulation(source_id=source.id, title=doc['title'], official_url=url)
                self.db.add(reg)
                self.db.flush()
            old_status = reg.status
            previous = latest_assessment(self.db, reg.id)
            status, method, evidence = assess_document(doc)
            # A failed download cannot erase a previously sourced repeal.
            if not evidence and previous and previous.status in ('REVOKED', 'SUPERSEDED', 'PARTIALLY_ACTIVE'):
                status, method = RegulationStatus(previous.status), 'previous_evidence_retained'
                evidence = json.loads(previous.evidence_json)
            reg.title = doc['title']
            meta = extract_norm_metadata(reg.title)
            reg.regulation_type = meta.get('regulation_type') or doc['document_type'].rsplit('_', 1)[0]
            reg.number, reg.year = meta.get('number'), meta.get('year')
            reg.status = status
            for item in evidence:
                item.setdefault('observed_at', now.isoformat() + 'Z')
            if doc.get('fetch_ok') or (evidence and method != 'previous_evidence_retained'):
                reg.last_verified_at = now
            elif is_new:
                reg.last_verified_at = None
            self.db.add(StatusAssessment(regulation_id=reg.id, status=status.value, method=method,
                evidence_json=json.dumps(evidence, ensure_ascii=False), classifier_version=CLASSIFIER_VERSION,
                fetch_ok=doc.get('fetch_ok', False), checked_at=now, message=doc.get('fetch_error')))
            latest = self.db.query(RegulationVersion).filter_by(regulation_id=reg.id).order_by(RegulationVersion.version_number.desc()).first()
            # Missing content is an access failure, not a new version of the legal act.
            failed_refresh = latest and doc.get('fetch_ok') is False
            changed = not latest or (latest.content_hash != doc['content_hash'] and not failed_refresh)
            if changed:
                version = latest.version_number + 1 if latest else 1
                if latest:
                    latest.valid_until = now
                self.db.add(RegulationVersion(regulation_id=reg.id, version_number=version,
                    content_hash=doc['content_hash'], normalized_content=doc.get('normalized_content'),
                    raw_content=json.dumps({'notices': doc.get('notices', [])}, ensure_ascii=False),
                    download_url=url, detected_at=now))
                counts['new_count' if is_new else 'updated_count'] += 1
            else:
                counts['no_change_count'] += 1
            if old_status != status:
                counts['status_changed'] += 1
                changes.append({'title': reg.title, 'url': url, 'old_status': old_status, 'status_assigned': status, 'classification_method': method})
        for reg in self.db.query(Regulation).filter_by(source_id=source.id).all():
            if reg.official_url not in seen:
                canonical = reg.official_url.replace('http://', 'https://', 1)
                equivalent = next((d for d in data.get('discovered_documents', [])
                    if d['official_url'].replace('http://', 'https://', 1) == canonical), None)
                if equivalent:
                    status, method, evidence = assess_document(equivalent)
                    reg.status = status
                    self.db.add(StatusAssessment(regulation_id=reg.id, status=status.value,
                        method=method, evidence_json=json.dumps(evidence, ensure_ascii=False),
                        classifier_version=CLASSIFIER_VERSION, checked_at=now,
                        fetch_ok=equivalent.get('fetch_ok', False), message=equivalent.get('fetch_error')))
                    continue
                counts['removed_count'] += 1
                previous = latest_assessment(self.db, reg.id)
                # Disappearance is never evidence of repeal or continued validity.
                if not previous or previous.status not in ('REVOKED', 'SUPERSEDED', 'PARTIALLY_ACTIVE'):
                    if reg.status != RegulationStatus.PENDING_REVIEW:
                        counts['status_changed'] += 1
                    reg.status = RegulationStatus.PENDING_REVIEW
                self.db.add(StatusAssessment(regulation_id=reg.id, status=reg.status.value,
                    method='not_in_current_index', evidence_json=previous.evidence_json if previous else '[]',
                    classifier_version=CLASSIFIER_VERSION, checked_at=now, fetch_ok=False,
                    message='Não encontrado no índice atual; não implica revogação.'))
        failures = data.get('fetch_failures', 0)
        supplementary_failures = data.get('supplementary_failures', [])
        summary = (f"Varredura: {len(seen)} documentos; {counts['new_count']} novos; "
                   f"{counts['updated_count']} versões atualizadas; {counts['status_changed']} status corrigidos. "
                   f"{failures} documentos sem texto acessível; {counts['removed_count']} ausentes do índice.")
        if supplementary_failures:
            summary += f" {len(supplementary_failures)} fontes complementares indisponíveis."
        partial = bool(failures or supplementary_failures)
        self.db.add(CrawlLog(source_id=source.id, status='PARTIAL' if partial else 'SUCCESS',
            documents_found=len(seen), new_count=counts['new_count'], updated_count=counts['updated_count'],
            removed_count=counts['removed_count'], report_summary=summary, executed_at=now))
        self.db.flush()
        return {'status': 'PARTIAL' if partial else 'SUCCESS', 'source_id': source.id,
                'documents_found': len(seen), 'total_processed': len(seen), 'fetch_failures': failures,
                **counts, 'changes_summary': changes, 'report_summary': summary}
