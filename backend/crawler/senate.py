"""Supplementary official relationship catalogs, with reviewed effect dates.

The registry contains source locations, never a hard-coded list of repealed acts.
New catalogs require validating the scope and effective date before enrollment.
"""
from datetime import date
from bs4 import BeautifulSoup
from backend.regulatory.validity import extract_norm_metadata, normalize

CATALOGS = [{
    'title': 'Decreto nº 12.709 de 31/10/2025',
    'url': 'https://legis.senado.gov.br/norma/41627940',
    'effects_from': '2025-11-03',
    'effect_basis': 'Art. 240 e art. 241, III: revogações produzem efeitos na publicação (03/11/2025).',
    'effect_basis_url': 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12709.htm',
}]


def identity(title):
    meta = extract_norm_metadata(title)
    return tuple(meta.get(k) for k in ('regulation_type', 'number', 'year'))


def parse_catalog(html, catalog, today=None):
    if (today or date.today()) < date.fromisoformat(catalog['effects_from']):
        return {}
    soup = BeautifulSoup(html, 'html.parser')
    section = soup.select_one('#collapseEdiv')
    if section is None or normalize(catalog['title']) not in normalize(soup.get_text(' ', strip=True)):
        raise ValueError('Estrutura ou identidade do catálogo Senado não reconhecida')
    found = {}
    for panel in section.select('.panel-body'):
        anchor = panel.find('a', href=True)
        relation = panel.select_one('p.bg-info')
        if not anchor or not relation:
            continue
        label = normalize(relation.get_text(' ', strip=True))
        if label != 'declaracao de revogacao permanente da norma no todo':
            continue
        key = identity(anchor.get_text(' ', strip=True))
        # Federal decrees/laws have unique type+number+year. Do not match
        # ministerial portarias by number without issuing-body identity.
        if None in key or key[0] not in ('DECRETO', 'LEI'):
            continue
        found[key] = {'text': 'Revogado pelo ' + catalog['title'], 'url': catalog['url'],
            'kind': 'senate_repeal_relationship', 'target': anchor.get_text(' ', strip=True),
            'effective_from': catalog['effects_from'], 'effect_basis': catalog['effect_basis'],
            'effect_basis_url': catalog['effect_basis_url']}
    if not found:
        raise ValueError('Catálogo sem relações reconhecidas; requer revisão da fonte')
    return found


def supplement(crawler, docs):
    failures = []
    for catalog in CATALOGS:
        response = crawler.fetch_url(catalog['url'], max_retries=1)
        if response is None:
            failures.append(catalog['url'])
            continue
        try:
            relations = parse_catalog(response.text, catalog)
            for doc in docs:
                notice = relations.get(identity(doc['title']))
                if notice and notice not in doc['notices']:
                    doc['notices'].append(notice)
        except ValueError:
            failures.append(catalog['url'])
    return failures
