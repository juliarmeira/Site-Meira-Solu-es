"""Periodic monitoring while the backend process is running (one worker)."""
import logging
import json
import threading
from datetime import datetime, timedelta
from backend.config import MAPA_BEVERAGES_URL, RAW_DATA_DIR
from backend.crawler.mapa import MAPABeveragesCrawler
from backend.database.connection import SessionLocal
from backend.database.models import Source, CrawlLog
from backend.regulatory.detector import ChangeDetector

logger = logging.getLogger(__name__)
crawl_lock = threading.Lock()


def run_crawl():
    if not crawl_lock.acquire(blocking=False):
        return {'status': 'BUSY', 'error': 'Já existe uma varredura em execução.'}
    try:
        with SessionLocal() as db:
            try:
                data = MAPABeveragesCrawler().crawl()
                if data.get('status') != 'SUCCESS':
                    raise RuntimeError(data.get('error', 'Falha na coleta'))
                data['captured_at'] = datetime.utcnow().isoformat() + 'Z'
                snapshot = RAW_DATA_DIR / 'latest-crawl.json'
                temporary = snapshot.with_suffix('.tmp')
                temporary.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
                temporary.replace(snapshot)
                return ChangeDetector(db).process_crawl_results(data)
            except Exception as exc:
                db.rollback()
                source = db.query(Source).filter_by(url=MAPA_BEVERAGES_URL).first()
                if not source:
                    source = Source(name='MAPA — Vinhos e Bebidas', url=MAPA_BEVERAGES_URL)
                    db.add(source)
                    db.flush()
                db.add(CrawlLog(source_id=source.id, status='ERROR', report_summary=str(exc)))
                db.commit()
                logger.exception('Varredura falhou')
                return {'status': 'ERROR', 'error': str(exc)}
    finally:
        crawl_lock.release()


def monitor(stop, interval_seconds):
    while not stop.is_set():
        try:
            with SessionLocal() as db:
                last = db.query(CrawlLog).filter(CrawlLog.status.in_(['SUCCESS', 'PARTIAL'])).order_by(CrawlLog.executed_at.desc()).first()
                due = not last or datetime.utcnow() - last.executed_at >= timedelta(seconds=interval_seconds)
            if due:
                run_crawl()
        except Exception:
            logger.exception('Monitor regulatório falhou')
        stop.wait(min(interval_seconds, 300))
