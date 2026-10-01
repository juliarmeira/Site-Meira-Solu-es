from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum as SQLEnum
)
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

class RegulationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PARTIALLY_ACTIVE = "PARTIALLY_ACTIVE"
    REVOKED = "REVOKED"
    SUPERSEDED = "SUPERSEDED"
    PENDING_REVIEW = "PENDING_REVIEW"
    DRAFT = "DRAFT"
    PUBLIC_CONSULTATION = "PUBLIC_CONSULTATION"
    UNKNOWN = "UNKNOWN"

class DocumentChangeType(str, enum.Enum):
    NO_CHANGE = "NO_CHANGE"
    NEW_DOCUMENT = "NEW_DOCUMENT"
    REMOVED_DOCUMENT = "REMOVED_DOCUMENT"
    UPDATED_DOCUMENT = "UPDATED_DOCUMENT"
    LINK_CHANGED = "LINK_CHANGED"
    METADATA_CHANGED = "METADATA_CHANGED"
    PAGE_STRUCTURE_CHANGED = "PAGE_STRUCTURE_CHANGED"

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    authority = Column(String(100), default="MAPA")
    url = Column(Text, nullable=False, unique=True)
    source_type = Column(String(50), default="regulatory_index")
    crawl_frequency = Column(String(50), default="daily")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_checked_at = Column(DateTime, nullable=True)

    regulations = relationship("Regulation", back_populates="source", cascade="all, delete-orphan")
    crawl_logs = relationship("CrawlLog", back_populates="source", cascade="all, delete-orphan")

class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    title = Column(String(500), nullable=False)
    regulation_type = Column(String(100), nullable=True)  # Portaria, Decreto, Instrução Normativa, Manual, FAQ, etc.
    number = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    issuing_body = Column(String(100), default="MAPA")
    publication_date = Column(DateTime, nullable=True)
    effective_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    status = Column(SQLEnum(RegulationStatus), default=RegulationStatus.PENDING_REVIEW)
    official_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="regulations")
    versions = relationship("RegulationVersion", back_populates="regulation", cascade="all, delete-orphan")
    provisions = relationship("Provision", back_populates="regulation", cascade="all, delete-orphan")

class RegulationVersion(Base):
    __tablename__ = "regulation_versions"

    id = Column(Integer, primary_key=True, index=True)
    regulation_id = Column(Integer, ForeignKey("regulations.id"), nullable=False)
    version_number = Column(Integer, default=1)
    content_hash = Column(String(64), nullable=False, index=True)
    normalized_hash = Column(String(64), nullable=True, index=True)
    raw_content = Column(Text, nullable=True)
    normalized_content = Column(Text, nullable=True)
    download_url = Column(Text, nullable=True)
    local_storage_path = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)

    regulation = relationship("Regulation", back_populates="versions")
    provisions = relationship("Provision", back_populates="version", cascade="all, delete-orphan")

class Provision(Base):
    __tablename__ = "provisions"

    id = Column(Integer, primary_key=True, index=True)
    regulation_id = Column(Integer, ForeignKey("regulations.id"), nullable=False)
    version_id = Column(Integer, ForeignKey("regulation_versions.id"), nullable=False)
    chapter = Column(String(100), nullable=True)
    section = Column(String(100), nullable=True)
    article = Column(String(50), nullable=True)
    paragraph = Column(String(50), nullable=True)
    item = Column(String(50), nullable=True)
    subitem = Column(String(50), nullable=True)
    text = Column(Text, nullable=False)
    normalized_text = Column(Text, nullable=True)

    regulation = relationship("Regulation", back_populates="provisions")
    version = relationship("RegulationVersion", back_populates="provisions")

class CrawlLog(Base):
    __tablename__ = "crawl_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    status = Column(String(50), default="SUCCESS")
    documents_found = Column(Integer, default=0)
    new_count = Column(Integer, default=0)
    updated_count = Column(Integer, default=0)
    removed_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    report_summary = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="crawl_logs")


class StatusAssessment(Base):
    """Append-only evidence history; additive table also upgrades existing SQLite DBs."""
    __tablename__ = "status_assessments"
    id = Column(Integer, primary_key=True)
    regulation_id = Column(Integer, ForeignKey("regulations.id"), nullable=False, index=True)
    status = Column(String(40), nullable=False)
    method = Column(String(100), nullable=False)
    evidence_json = Column(Text, nullable=False, default="[]")
    classifier_version = Column(String(40), nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)
    fetch_ok = Column(Boolean, default=False)
    message = Column(Text, nullable=True)
