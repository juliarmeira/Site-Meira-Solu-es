import React, { useEffect } from 'react';
import './CurriculumPage.css';

const experiences = [
  { company: 'Prefeitura Municipal de Andradas — Secretaria de Planejamento Urbano e Meio Ambiente', role: 'Fiscal de Meio Ambiente · Cargo efetivo por concurso público', date: 'Início em 10/2026', items: ['Atribuições do cargo: execução da política ambiental municipal; fiscalização de atividades, sistemas e processos produtivos quanto ao cumprimento da legislação ambiental; acompanhamento de atividades efetiva ou potencialmente poluidoras.'] },
  { company: 'Prefeitura Municipal de Andradas — Secretaria de Planejamento Urbano e Meio Ambiente', role: 'Técnica em Química', date: '10/2025 – 09/2026', items: ['Análises de qualidade da água nos distritos e aglomerados.', 'Acompanhamento presencial e monitoramento das Estações de Tratamento de Esgoto (ETEs).'] },
  { company: 'Meira Soluções', role: 'Consultora Técnica e Projetos', date: '2025 – Atual', items: ['Mapeamento de processos e desenvolvimento de projetos de regularização para produtores de cachaça.', 'Organização de dados e desenvolvimento de controles para acompanhamento da produção e regularização de alambiques.', 'Uso de inteligência artificial e Antigravity para organização de informações, automação de rotinas e desenvolvimento de soluções para gestão de dados.'] },
  { company: 'Prefeitura Municipal — Secretaria Municipal de Administração e Gestão de Pessoas', role: 'Assistente Administrativo', date: '05/2024 – 10/2025', items: ['Administração e elaboração de contratos e convênios decorrentes de processos licitatórios.', 'Formalização e acompanhamento administrativo de programas de estágio.'] },
  { company: 'Gonçalves Engenharia', role: 'Técnica Ambiental', date: '01/2022 – 04/2025', items: ['Projetos de engenharia rural, urbana e industrial.', 'Estudos hidrológicos, licenciamento ambiental, outorgas e intervenções.', 'Elaboração de mapas e análises espaciais no QGIS.'] },
  { company: 'Kahza Experience', role: 'Supervisora de Produção e Analista · Remoto', date: '03/2022 – 04/2023', items: ['Análise de terrenos nos Estados Unidos para compra em leilões, considerando topografia, condições econômicas e hidrologia.'] },
  { company: 'Icasa — Indústria Cerâmica Andradense S/A', role: 'Estagiária', date: '04/2021 – 09/2021', items: ['Acompanhamento das etapas de produção no chão de fábrica.', 'Aplicação de ferramentas de gestão da qualidade para reduzir falhas na produção cerâmica.'] },
];

const Experience = ({ entry }: { entry: typeof experiences[number] }) => (
  <article className="cv-entry">
    <h3>{entry.company}</h3>
    <div className="cv-role"><strong>{entry.role}</strong><span>{entry.date}</span></div>
    {entry.items.length > 0 && <ul>{entry.items.map(item => <li key={item}>{item}</li>)}</ul>}
  </article>
);

const CurriculumPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('curriculum-active');
    return () => document.body.classList.remove('curriculum-active');
  }, []);
  return (
    <div className="cv-view">
      <div className="cv-toolbar"><a href="/">Meira Soluções</a><button type="button" onClick={() => window.print()}>Imprimir / Salvar em PDF</button></div>
      <div className="cv-document" aria-label="Currículo de Júlia Reis Meira">
        <div className="cv-page">
          <header className="cv-header">
            <p className="cv-eyebrow">Currículo profissional</p>
            <h1>Júlia Reis Meira</h1>
            <p className="cv-subtitle">Engenheira Química | Meio Ambiente | Qualidade e Saneamento</p>
            <address className="cv-contact">
              <a href="mailto:juliareismeira@gmail.com">juliareismeira@gmail.com</a>
              <a href="tel:+5519999896901">(19) 9 9989-6901</a>
              <span>Andradas, MG</span>
              <a href="https://www.linkedin.com/in/juliarmeira/" target="_blank" rel="noreferrer">linkedin.com/in/juliarmeira</a>
            </address>
          </header>
          <section className="cv-profile"><h2>Resumo profissional</h2><p>Engenheira Química e Técnica em Meio Ambiente, com experiência em qualidade da água, acompanhamento de Estações de Tratamento de Esgoto, licenciamento ambiental, estudos hidrológicos, geoprocessamento e gestão pública.</p><p>Atuação em projetos ambientais, regularização, mapeamento de processos e análise de dados, com uso de QGIS e ferramentas digitais.</p><p>Em outubro de 2026, assumo o cargo efetivo de Fiscal de Meio Ambiente no Município de Andradas/MG, após aprovação em concurso público.</p></section>
          <section><h2>Experiência profissional</h2>{experiences.slice(0, 5).map(entry => <div key={`${entry.company}-${entry.role}`}><Experience entry={entry} /></div>)}</section>
          <footer className="cv-page-footer"><span>Júlia Reis Meira · Currículo</span><span>01 / 02</span></footer>
        </div>
        <div className="cv-page">
          <div className="cv-continuation"><span>Júlia Reis Meira</span><span>Engenharia química · Meio ambiente</span></div>
          <section><h2>Experiência profissional <span className="cv-muted">/ continuação</span></h2>{experiences.slice(5).map(entry => <div key={`${entry.company}-${entry.role}`}><Experience entry={entry} /></div>)}</section>
          <section className="cv-section"><h2>Formação acadêmica</h2><div className="cv-entry"><h3>Bacharelado em Engenharia Química</h3><p>FHO — Centro Universitário Hermínio Ometto · Concluído em março de 2023</p></div><div className="cv-entry"><h3>Técnico em Meio Ambiente</h3><p>ETEC Dr. Carolino da Motta e Silva</p></div></section>
          <section className="cv-section"><h2>Competências técnicas</h2><dl className="cv-knowledge">
            <div><dt>Meio ambiente e saneamento</dt><dd>Qualidade da água · Acompanhamento de ETEs · Fiscalização ambiental · Licenciamento ambiental · Gestão de resíduos · Intervenções na flora · CTF/APP · Estudos hidrológicos · Sistemas individuais de tratamento de esgoto</dd></div>
            <div><dt>Qualidade e processos</dt><dd>Mapeamento de processos · Ferramentas da qualidade · Controle de processos · Melhoria contínua · Análise e resolução de problemas</dd></div>
            <div><dt>Geoprocessamento e engenharia</dt><dd>QGIS · AutoCAD · HEC-RAS · Mapeamento e análise espacial</dd></div>
            <div><dt>Tecnologia e automação</dt><dd>Inteligência artificial aplicada a rotinas profissionais · Antigravity · Power BI básico · Python básico · Pacote Office · Ecossistema Google</dd></div>
          </dl></section>
          <section className="cv-section cv-courses"><h2>Cursos e certificações</h2>
            <div><h3>Estratégia Aplicada à Fiscalização Ambiental</h3><p>SEMAD / Universidade Sisema · 22 h · 2026</p></div>
            <div><h3>Fiscalização de Intervenções na Flora</h3><p>SEMAD / Universidade Sisema · 22 h · 2026</p></div>
            <div><h3>Projeto e Dimensionamento de Tanque Séptico, Filtro Anaeróbio e Sumidouro</h3><p>40 h · 2024</p></div>
            <div><h3>Descomplica QGIS — Aperfeiçoamento no uso do QGIS</h3><p>Ambientis Engenharia · 120 h · 2023</p></div>
          </section>
          <section className="cv-section"><h2>Idiomas</h2><p>Inglês — avançado · Espanhol — intermediário · Italiano — básico</p></section>
          <footer className="cv-page-footer"><span>Júlia Reis Meira · Currículo</span><span>02 / 02</span></footer>
        </div>
      </div>
    </div>
  );
};
export default CurriculumPage;
