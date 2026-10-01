import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database.models import Base, Regulation, RegulationVersion, Source
from backend.crawler.base import BaseCrawler
from backend.crawler.mapa import MAPABeveragesCrawler
from backend.regulatory.detector import ChangeDetector

def test_normalize_url():
    base = "https://www.gov.br/agricultura/pt-br/assuntos/inspecao/bebidas"
    link = "manual-bebidas.pdf"
    res = BaseCrawler.normalize_url(base, link)
    assert res == "https://www.gov.br/agricultura/pt-br/assuntos/inspecao/manual-bebidas.pdf"

def test_compute_sha256():
    data = "Legislação Cachaça 2026"
    h1 = BaseCrawler.compute_sha256(data)
    h2 = BaseCrawler.compute_sha256(data)
    assert len(h1) == 64
    assert h1 == h2

def test_classify_document_type():
    crawler = MAPABeveragesCrawler()
    assert crawler._classify_document_type("Portaria MAPA 123", "http://gov.br/p123.pdf") == "PORTARIA_PDF"
    assert crawler._classify_document_type("Decreto nº 12709", "http://planalto.gov.br/dec.html") == "DECRETO_HTML"
    assert crawler._classify_document_type("Tabela de contaminantes", "http://gov.br/tab.xlsx") == "REGULAMENTO_XLSX"

def test_change_detector_flow():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    mock_crawl_data = {
        "status": "SUCCESS",
        "source_url": "https://www.gov.br/agricultura/pt-br/assuntos/bebidas",
        "page_title": "Bebidas MAPA",
        "discovered_documents": [
            {
                "title": "Portaria nº 100/2026",
                "official_url": "https://www.gov.br/agricultura/portaria-100.pdf",
                "document_type": "PORTARIA_PDF",
                "content_hash": "hash_version_1"
            }
        ]
    }

    detector = ChangeDetector(db)

    # 1st Run -> Should create NEW_DOCUMENT version 1
    res1 = detector.process_crawl_results(mock_crawl_data)
    assert res1["new_count"] == 1
    assert res1["updated_count"] == 0

    reg = db.query(Regulation).first()
    assert reg is not None
    assert reg.title == "Portaria nº 100/2026"

    ver = db.query(RegulationVersion).filter(RegulationVersion.regulation_id == reg.id).first()
    assert ver.version_number == 1
    assert ver.content_hash == "hash_version_1"

    # 2nd Run -> Identical data -> Should yield NO_CHANGE
    res2 = detector.process_crawl_results(mock_crawl_data)
    assert res2["new_count"] == 0
    assert res2["updated_count"] == 0
    assert res2["no_change_count"] == 1

    # 3rd Run -> Updated document hash -> Should create Version 2
    mock_crawl_data_updated = {
        "status": "SUCCESS",
        "source_url": "https://www.gov.br/agricultura/pt-br/assuntos/bebidas",
        "page_title": "Bebidas MAPA",
        "discovered_documents": [
            {
                "title": "Portaria nº 100/2026",
                "official_url": "https://www.gov.br/agricultura/portaria-100.pdf",
                "document_type": "PORTARIA_PDF",
                "content_hash": "hash_version_2"
            }
        ]
    }

    res3 = detector.process_crawl_results(mock_crawl_data_updated)
    assert res3["updated_count"] == 1
    versions = db.query(RegulationVersion).filter(RegulationVersion.regulation_id == reg.id).all()
    assert len(versions) == 2
    assert versions[-1].version_number == 2
    assert versions[-1].content_hash == "hash_version_2"
