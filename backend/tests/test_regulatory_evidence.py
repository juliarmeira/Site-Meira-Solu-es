import json
from datetime import datetime, timedelta
import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.crawler.mapa import MAPABeveragesCrawler, official_url
from backend.database.models import Base, Regulation, RegulationStatus, RegulationVersion, Source, StatusAssessment
from backend.regulatory.detector import ChangeDetector, assess_document, latest_assessment
from backend.regulatory.validity import classify_validity, extract_norm_metadata
from backend.main import serialize_regulation, agent_knowledge


@pytest.fixture
def db():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine)() as session:
        yield session
    engine.dispose()


def document(**kwargs):
    return {'title': 'Decreto nº 6.871, de 4 de junho de 2009',
        'official_url': 'https://www.planalto.gov.br/d6871.htm',
        'document_type': 'DECRETO_HTML', 'content_hash': 'one',
        'fetch_ok': True, 'normalized_content': 'Art. 1 Texto da norma', 'notices': [], **kwargs}


def crawl(doc):
    return {'status': 'SUCCESS', 'source_url': 'https://www.gov.br/bebidas', 'discovered_documents': [doc]}


@pytest.mark.parametrize('notice,expected', [
    ('Revogado pelo Decreto nº 12.709, de 2025', 'REVOKED'),
    ('Revogada Parcialmente pela Instrução Normativa 67/2018', 'PARTIALLY_ACTIVE'),
    ('Substituída pela Portaria 100/2026', 'SUPERSEDED'),
    ('Revoga o Decreto nº 6.871, de 2009', 'PENDING_REVIEW'),
    ('Ficam revogados os seguintes decretos', 'PENDING_REVIEW'),
    ('Art. 3º Revogado pelo Decreto 1/2026', 'PENDING_REVIEW'),
    ('Não revogada', 'PENDING_REVIEW'),
    ('Será revogada em 2030', 'PENDING_REVIEW'),
    ('Entra em vigor na data de sua publicação', 'PENDING_REVIEW'),
    ('Não consta revogação expressa', 'PENDING_REVIEW'),
])
def test_scoped_status(notice, expected):
    assert classify_validity('Decreto nº 100/2020', '', 'DECRETO_HTML', notice)[0].value == expected


def test_norm_metadata():
    assert extract_norm_metadata('Instrução Normativa SDA/MAPA Nº 140/2024') == {
        'regulation_type': 'INSTRUCAO_NORMATIVA', 'number': '140', 'year': 2024}
    assert extract_norm_metadata('Decreto nº 12.709, de 31 de outubro de 2025')['number'] == '12709'
    assert classify_validity('IN 13/2005', '', 'INSTRUCAO_NORMATIVA_PDF')[0] == RegulationStatus.PENDING_REVIEW


def test_index_notice_does_not_revoke_successor():
    html = '''<div id="parent-fieldname-text"><table><tr><td>
    <p><a href="https://www.gov.br/old.pdf">Instrução Normativa nº 13/2005</a></p>
    <p>Revogada pela <a href="https://www.gov.br/new.pdf">Portaria MAPA nº 539/2022</a></p>
    </td></tr></table><a href="https://evil.example/gov.br/a.pdf">Portaria 100/2020</a></div>'''
    docs = MAPABeveragesCrawler().discover(html)
    assert len(docs) == 2
    assert assess_document(docs[0])[0] == RegulationStatus.REVOKED
    assert assess_document(docs[1])[0] == RegulationStatus.PENDING_REVIEW
    assert not official_url('https://gov.br.evil.example/a.pdf')


def test_document_header_and_article_notices(monkeypatch):
    crawler = MAPABeveragesCrawler()
    def fetch(url, **kwargs):
        return httpx.Response(200, headers={'content-type': 'text/html'}, request=httpx.Request('GET', url), text='''
          <html><body><p>Revogado pelo Decreto nº 12.709, de 2025</p>
          <p>Art. 1 Texto</p><p>Revogado parcialmente pela Lei 1/2020</p></body></html>''')
    monkeypatch.setattr(crawler, 'fetch_url', fetch)
    doc = crawler.enrich(document())
    assert len(doc['notices']) == 1
    assert assess_document(doc)[0] == RegulationStatus.REVOKED
    assert 'Art. 1' in doc['normalized_content']


def test_reclassifies_unchanged_legacy_active(db):
    doc = document()
    detector = ChangeDetector(db)
    detector.process_crawl_results(crawl(doc))
    reg = db.query(Regulation).one()
    reg.status = RegulationStatus.ACTIVE
    db.commit()
    result = detector.process_crawl_results(crawl(doc))
    assert reg.status == RegulationStatus.PENDING_REVIEW
    assert result['status_changed'] == 1
    assert db.query(RegulationVersion).count() == 1


def test_evidence_changes_and_failure_preservation(db):
    detector = ChangeDetector(db)
    doc = document(notices=[{'text': 'Revogado pelo Decreto nº 12.709/2025', 'url': 'https://www.planalto.gov.br/d6871.htm'}])
    detector.process_crawl_results(crawl(doc))
    reg = db.query(Regulation).one()
    assert reg.status == RegulationStatus.REVOKED
    detector.process_crawl_results(crawl(document(fetch_ok=False, content_hash='failed')))
    assert reg.status == RegulationStatus.REVOKED
    assert db.query(RegulationVersion).count() == 1
    result = serialize_regulation(db, reg, True)
    assert not result['fresh'] and not result['usable_as_current_law']
    assert result['evidence'] and result['text'] is None
    assert db.query(RegulationVersion).one().normalized_content


def test_conflicting_evidence_requires_review():
    doc = document(notices=[{'text': 'Revogado pelo Decreto 2/2026'}, {'text': 'Revogado parcialmente pelo Decreto 3/2026'}])
    assert assess_document(doc)[0] == RegulationStatus.PENDING_REVIEW


def test_removed_is_not_revoked_and_legacy_api_is_safe(db):
    detector = ChangeDetector(db)
    detector.process_crawl_results(crawl(document()))
    reg = db.query(Regulation).one()
    reg.status = RegulationStatus.ACTIVE
    db.query(StatusAssessment).delete()
    db.commit()
    assert serialize_regulation(db, reg)['status'] == 'PENDING_REVIEW'
    data = crawl(document())
    data['discovered_documents'] = []
    detector.process_crawl_results(data)
    assert reg.status == RegulationStatus.PENDING_REVIEW
    assert latest_assessment(db, reg.id).method == 'not_in_current_index'


def test_atomic_rollback(db):
    data = crawl(document())
    data['discovered_documents'].append({'official_url': 'https://www.gov.br/bad'})
    with pytest.raises(KeyError):
        ChangeDetector(db).process_crawl_results(data)
    assert db.query(Regulation).count() == 0
    assert db.query(Source).count() == 0


def test_agent_returns_text_and_literal_search(db):
    ChangeDetector(db).process_crawl_results(crawl(document()))
    result = agent_knowledge('6.871', db)
    assert result['regulations'][0]['text']
    assert not result['regulations'][0]['usable_as_current_law']
    assert agent_knowledge('%', db)['regulations'] == []

def test_senate_direction_identity_and_effect_date():
    from datetime import date
    from backend.crawler.senate import parse_catalog, CATALOGS
    html = '''<h1>Decreto nº 12.709 de 31/10/2025</h1>
      <div id="collapseEdiv">
        <div class="panel-body"><a href="1">Decreto nº 6.871 de 04/06/2009</a><p class="bg-info">Declaração de Revogação Permanente da Norma no Todo</p></div>
        <div class="panel-body"><a href="2">Lei nº 8.918 de 14/07/1994</a><p class="bg-info">Declaração de Regulamentação Permanente de Norma</p></div>
      </div><div id="other"><div class="panel-body"><a href="3">Decreto nº 9.999 de 01/01/2020</a><p class="bg-info">Declaração de Revogação Permanente da Norma no Todo</p></div></div>'''
    relations = parse_catalog(html, CATALOGS[0], date(2026, 9, 21))
    assert list(relations) == [('DECRETO', '6871', 2009)]
    assert parse_catalog(html, CATALOGS[0], date(2025, 11, 2)) == {}
    with pytest.raises(ValueError):
        parse_catalog(html.replace('collapseEdiv', 'changed'), CATALOGS[0])
    with pytest.raises(ValueError):
        parse_catalog(html.replace('12.709', '12.710'), CATALOGS[0])


def test_api_knowledge_and_health(db):
    from fastapi.testclient import TestClient
    from backend.main import app, get_db
    app.dependency_overrides[get_db] = lambda: db
    try:
        ChangeDetector(db).process_crawl_results(crawl(document()))
        client = TestClient(app)
        schema = client.get('/openapi.json').json()
        assert '/api/knowledge' in schema['paths']
        assert '/api/reprocess-status' in schema['paths']
        assert client.get('/api/health').json()['last_run_status'] == 'SUCCESS'
        assert client.get('/api/regulations').json()['total'] == 1
        record = client.get('/api/knowledge?q=6.871').json()['regulations'][0]
        assert record['text'] and record['evidence'] == []
        assert record['status'] == 'PENDING_REVIEW'
        assert not record['usable_as_current_law']
    finally:
        app.dependency_overrides.clear()

@pytest.mark.parametrize('title', [
    'Portaria nº 100/2026 altera a Portaria nº 1/2020 revogada',
    'Decreto nº 100/2026 revoga o Decreto nº 1/2020',
])
def test_title_reference_is_not_own_repeal(title):
    assert classify_validity(title, '', 'PORTARIA_HTML')[0] == RegulationStatus.PENDING_REVIEW


def test_future_repeal_needs_review():
    assert classify_validity('Portaria 1/2020', '', 'PORTARIA_HTML', 'Revogada pela Portaria 2/2026 a partir de 2030')[0] == RegulationStatus.PENDING_REVIEW


@pytest.mark.parametrize('article', ['Art.1º', 'Art. 1o', 'Artigo 1', 'Art. 2'])
def test_article_boundary_blocks_body_repeal(monkeypatch, article):
    crawler = MAPABeveragesCrawler()
    monkeypatch.setattr(crawler, 'fetch_url', lambda url, **kw: httpx.Response(200,
        headers={'content-type': 'text/html'}, request=httpx.Request('GET', url),
        text=f'<body><p>{article} Texto</p><p>Revogado pelo Decreto 2/2026</p></body>'))
    assert crawler.enrich(document())['notices'] == []


def test_dou_viewer_not_legal_text(monkeypatch):
    crawler = MAPABeveragesCrawler()
    url = 'https://pesquisa.in.gov.br/imprensa/jsp/visualiza/index.jsp?pagina=1'
    monkeypatch.setattr(crawler, 'fetch_url', lambda url, **kw: httpx.Response(200,
        headers={'content-type': 'text/html'}, request=httpx.Request('GET', url), text='<body>Zoom Próxima página</body>'))
    doc = crawler.enrich(document(official_url=url))
    assert not doc['fetch_ok'] and not doc['normalized_content']

@pytest.mark.parametrize('title,number', [
    ('Resolução RDC nº 429, de 8 de outubro de 2020', '429'),
    ('Resolução - RDC nº 326, de 3 de dezembro de 2019', '326'),
    ('Instrução Normativa Anvisa nº 75, de 8 de outubro de 2020', '75'),
])
def test_agency_metadata(title, number):
    assert extract_norm_metadata(title)['number'] == number


def test_write_api_reports_busy_and_failure(monkeypatch):
    from fastapi.testclient import TestClient
    import backend.main as api
    client = TestClient(api.app)
    monkeypatch.setattr(api, 'run_crawl', lambda: {'status': 'BUSY', 'error': 'Em execução'})
    assert client.post('/api/crawl').status_code == 409
    monkeypatch.setattr(api, 'run_crawl', lambda: {'status': 'ERROR', 'error': 'Fonte indisponível'})
    assert client.post('/api/reprocess-status').status_code == 502


def test_homepage_redirect_not_legal_text(monkeypatch):
    crawler = MAPABeveragesCrawler()
    monkeypatch.setattr(crawler, 'fetch_url', lambda url, **kw: httpx.Response(200,
        headers={'content-type': 'text/html'}, request=httpx.Request('GET', 'https://www.gov.br/anvisa/pt-br'),
        text='<body>Notícias da Anvisa</body>'))
    assert not crawler.enrich(document(official_url='https://antigo.anvisa.gov.br/old.pdf'))['fetch_ok']

def test_service_failure_is_logged_and_unlocks(db, monkeypatch):
    import backend.regulatory.service as service
    from backend.database.models import CrawlLog
    monkeypatch.setattr(service, 'SessionLocal', sessionmaker(bind=db.get_bind()))
    monkeypatch.setattr(service.MAPABeveragesCrawler, 'crawl', lambda self: {'status': 'ERROR', 'error': 'Índice indisponível'})
    result = service.run_crawl()
    assert result['status'] == 'ERROR'
    assert db.query(CrawlLog).one().status == 'ERROR'
    assert not service.crawl_lock.locked()


def test_service_rejects_concurrent_crawl():
    import backend.regulatory.service as service
    service.crawl_lock.acquire()
    try:
        assert service.run_crawl()['status'] == 'BUSY'
    finally:
        service.crawl_lock.release()


def test_monitor_runs_when_no_previous_success(db, monkeypatch):
    import threading
    import backend.regulatory.service as service
    monkeypatch.setattr(service, 'SessionLocal', sessionmaker(bind=db.get_bind()))
    stop = threading.Event()
    calls = []
    def execute():
        calls.append(True)
        stop.set()
    monkeypatch.setattr(service, 'run_crawl', execute)
    service.monitor(stop, 86400)
    assert calls == [True]
