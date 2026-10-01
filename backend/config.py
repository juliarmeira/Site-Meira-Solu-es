import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
REPORTS_DIR = DATA_DIR / "reports"

# Ensure data directories exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Database URL configuration (defaults to local SQLite for rapid dev if Postgres is not set)
DEFAULT_SQLITE_PATH = DATA_DIR / "regulatory_mapa.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

CRAWLER_USER_AGENT = os.getenv(
    "CRAWLER_USER_AGENT",
    "AgenteRegulatorioMAPA/1.0 (Inteligencia Regulatoria Bebidas; contato@meirasolucoes.com.br)"
)

# Rate limiting delay in seconds between requests
RATE_LIMIT_DELAY = float(os.getenv("RATE_LIMIT_DELAY", "1.5"))

MAPA_BEVERAGES_URL = os.getenv(
    "MAPA_BEVERAGES_URL",
    "https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-vegetal/legislacao-programas-nacionais-e-seguranca-dos-alimentos-1/legislacao/bebidas"
)
