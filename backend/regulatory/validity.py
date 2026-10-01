"""Conservative classification of notices about the target act."""
import re
import unicodedata
from backend.database.models import RegulationStatus

CLASSIFIER_VERSION = "evidence-v2"


def normalize(text):
    return " ".join(unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode().lower().split())


def extract_norm_metadata(title):
    text = normalize(title)
    match = re.search(r"\b(instrucao normativa|decreto(?:-lei)?|portaria|resolucao|lei|medida provisoria|in)[\s-]*(?:(?:mapa|sda|ma|gm|ms|anvisa|rdc)[/\s-]*)*(?:n[ou]?\.?\s*)?(\d[\d.]*)", text)
    if not match:
        return {}
    kind = match[1].replace(" ", "_").upper()
    if kind == "IN":
        kind = "INSTRUCAO_NORMATIVA"
    year = re.search(r"\b(?:19|20)\d{2}\b", text[match.end():])
    return {"regulation_type": kind, "number": match[2].replace(".", ""), "year": int(year[0]) if year else None}


def classify_validity(title, url, doc_type, raw_text_sample=""):
    """The sample must be a scoped notice, NOT the complete legal text.

    Enactment clauses and absence of repeal do not prove current validity.
    """
    text = normalize(title)
    if re.search(r"\b(consulta publica|minuta|proposta de norma)\b", text):
        return RegulationStatus.PUBLIC_CONSULTATION, "consultation", 0.99
    if re.search(r"\b(manual|cartilha|cartilhao|guia|faq|tabela|orientacoes)\b", text):
        return RegulationStatus.UNKNOWN, "informative_document", 1.0
    for candidate in (raw_text_sample, title):
        notice = normalize(candidate)
        if candidate == title:
            match = re.search(r"(?:^|[-(])\s*((?:parcialmente\s+)?(?:revogad[ao]|substituid[ao])\b.*)", notice)
            if not match:
                continue
            notice = match[1]
        notice = notice.lstrip(" (-:")
        if re.search(r'\b(a partir|produzira efeitos|exceto|ressalvad|revogacao futura)\b', notice):
            return RegulationStatus.PENDING_REVIEW, 'repeal_scope_or_date_requires_review', 0.0
        if re.match(r"revogad[ao]\s+(?:parcialmente|em parte)\b", notice) or re.match(r"parcialmente revogad[ao]\b", notice):
            return RegulationStatus.PARTIALLY_ACTIVE, "explicit_partial_repeal_notice", 0.98
        if re.match(r"revogad[ao]\s+(?:pelo|pela|por|integralmente|totalmente)\b", notice) or notice.rstrip(".) ") in ("revogada", "revogado"):
            return RegulationStatus.REVOKED, "explicit_repeal_notice", 0.99
        if re.match(r"substituid[ao]\s+(?:pelo|pela|por)\b", notice):
            return RegulationStatus.SUPERSEDED, "explicit_replacement_notice", 0.98
    kind = re.sub(r"_(PDF|HTML|DOCX|XLSX)$", "", doc_type or "").upper()
    if extract_norm_metadata(title) or kind in {"LEI", "DECRETO", "PORTARIA", "INSTRUCAO_NORMATIVA", "RESOLUCAO"}:
        return RegulationStatus.PENDING_REVIEW, "current_validity_unconfirmed", 0.0
    return RegulationStatus.UNKNOWN, "no_evidence", 0.0
