"""Official MAPA index discovery plus linked document snapshots."""
import json
import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from backend.crawler.base import BaseCrawler
from backend.config import MAPA_BEVERAGES_URL
from backend.regulatory.validity import extract_norm_metadata, normalize


def official_url(url):
    p = urlparse(url)
    return p.scheme in ('http', 'https') and (p.hostname == 'gov.br' or (p.hostname or '').endswith('.gov.br'))


def content_area(soup):
    return soup.select_one('#parent-fieldname-text') or soup.select_one('#content-core') or soup.find('main') or soup.body or soup


def passive_notice(text):
    return bool(re.match(r'^[\s(]*(?:(?:parcialmente\s+)?revogad[ao]|substituid[ao])\b', normalize(text)))


class MAPABeveragesCrawler(BaseCrawler):
    def __init__(self, root_url=MAPA_BEVERAGES_URL):
        super().__init__()
        self.root_url = root_url

    def _extract_normalized_text(self, soup):
        area = BeautifulSoup(str(content_area(soup)), 'html.parser')
        for el in area.select('header, footer, nav, script, style, noscript, iframe'):
            el.decompose()
        return '\n'.join(line.strip() for line in area.get_text('\n').splitlines() if line.strip())

    def _classify_document_type(self, title, url):
        path = urlparse(url).path.lower()
        fmt = next((ext.upper() for ext in ('pdf', 'xlsx', 'docx') if '.' + ext in path), 'HTML')
        kind = extract_norm_metadata(title).get('regulation_type', 'REGULAMENTO')
        if re.search(r'\b(manual|cartilha|cartilhao)\b', normalize(title)):
            kind = 'MANUAL'
        return f'{kind}_{fmt}'

    def discover(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        docs = {}
        for a in content_area(soup).find_all('a', href=True):
            title = a.get_text(' ', strip=True)
            url = self.normalize_url(self.root_url, a['href'])
            if not official_url(url):
                continue
            # Old Planalto links are HTTP; canonical HTTPS avoids HTTP-only blocks.
            if urlparse(url).hostname in ('www.planalto.gov.br', 'planalto.gov.br'):
                url = re.sub(r'^http:', 'https:', url)
            meta = extract_norm_metadata(title)
            if not meta and not re.search(r'\b(manual|cartilha|cartilhao|guia|faq|tabela)\b', normalize(title)):
                continue
            doc = docs.setdefault(url, {'title': title, 'official_url': url,
                'document_type': self._classify_document_type(title, url),
                'discovered_at': self.root_url, 'notices': []})
            cell = a.find_parent('td') or a.find_parent('li')
            # Only the primary act in a cell owns the following status annotation.
            if cell and cell.find('a', href=True) is a:
                for p in cell.find_all('p'):
                    text = p.get_text(' ', strip=True)
                    if passive_notice(text):
                        item = {'text': text, 'url': self.root_url, 'kind': 'index_notice'}
                        if item not in doc['notices']:
                            doc['notices'].append(item)
        return list(docs.values())

    def enrich(self, doc):
        response = self.fetch_url(doc['official_url'], max_retries=1)
        doc['fetch_ok'] = False
        doc['normalized_content'] = ''
        if response is not None and official_url(str(response.url)):
            try:
                if str(response.url) != doc['official_url'] and urlparse(str(response.url)).path.rstrip('/') in ('', '/anvisa/pt-br', '/agricultura/pt-br'):
                    raise ValueError('Redirecionamento para página inicial, não para o documento')
                if response.content.startswith(b'%PDF'):
                    import fitz
                    with fitz.open(stream=response.content, filetype='pdf') as pdf:
                        text = '\n'.join(page.get_text() for page in pdf)
                    # PDF body repeal clauses are not notices about the PDF itself.
                    doc['normalized_content'] = text
                elif 'html' in response.headers.get('content-type', ''):
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # The historic DOU viewer contains navigation around a page image,
                    # not the searchable text of the act. Do not feed that UI to RAG.
                    if '/imprensa/jsp/visualiza/' not in str(response.url):
                        doc['normalized_content'] = self._extract_normalized_text(soup)
                    # Planalto places whole-act status before Art. 1; article-level
                    # repeal annotations after this boundary cannot revoke the act.
                    if (urlparse(str(response.url)).hostname or '').endswith('planalto.gov.br'):
                        for p in content_area(soup).find_all('p'):
                            text = p.get_text(' ', strip=True)
                            if re.search(r'\bart(?:igo)?\.?\s*\d', normalize(text)):
                                break
                            if passive_notice(text):
                                doc['notices'].append({'text': text, 'url': str(response.url), 'kind': 'document_notice'})
                doc['fetch_ok'] = bool(doc['normalized_content'].strip())
                doc['document_hash'] = self.compute_sha256(response.content)
            except Exception as exc:
                doc['fetch_error'] = f'{type(exc).__name__}: documento não extraído'
        if not doc['fetch_ok']:
            doc['fetch_error'] = doc.get('fetch_error', 'Documento inacessível ou sem texto extraível')
        payload = {k: doc.get(k) for k in ('title', 'official_url', 'document_type', 'notices', 'normalized_content')}
        doc['content_hash'] = self.compute_sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True))
        return doc

    def crawl(self):
        response = self.fetch_url(self.root_url)
        if response is None:
            return {'status': 'ERROR', 'source_url': self.root_url, 'error': 'Falha ao acessar o índice MAPA'}
        docs = self.discover(response.text)
        if not docs:
            return {'status': 'ERROR', 'source_url': self.root_url, 'error': 'Índice sem normas reconhecidas; verificar estrutura do portal'}
        for doc in docs:
            self.enrich(doc)
        from backend.crawler.senate import supplement
        supplementary_failures = supplement(self, docs)
        for doc in docs:
            doc['content_hash'] = self.compute_sha256(json.dumps({k: doc.get(k) for k in
                ('title', 'official_url', 'document_type', 'notices', 'normalized_content')}, ensure_ascii=False, sort_keys=True))
        failures = sum(not d['fetch_ok'] for d in docs)
        return {'status': 'SUCCESS', 'source_url': self.root_url, 'page_title': 'MAPA — Vinhos e Bebidas',
                'discovered_documents': docs, 'fetch_failures': failures,
                'supplementary_failures': supplementary_failures,
                'raw_html': response.text, 'normalized_text': self._extract_normalized_text(BeautifulSoup(response.text, 'html.parser'))}
