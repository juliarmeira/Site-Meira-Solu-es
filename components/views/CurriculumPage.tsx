import React, { useEffect } from 'react';

const CurriculumPage: React.FC = () => {
  // Garantir que a página sempre carregue no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans selection:bg-gray-300 selection:text-black py-0 md:py-10 flex justify-center">
      
      {/* O Documento A4-like */}
      <div className="bg-white w-full max-w-[1000px] shadow-2xl relative overflow-hidden">
        
        {/* Lado esquerdo (uma barra fina se formos seguir exatamente, mas o template original tem um pequeno risco vertical no cabeçalho) */}
        
        <div className="p-8 md:p-14 lg:p-16">
          
          {/* ----- HEADER ----- */}
          <header className="relative mb-12">
            {/* Uma pequena linha decorativa vertical do lado esquerdo para igualar a imagem */}
            <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-300 -ml-6 hidden md:block" style={{ height: '70%' }}></div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-[0.35em] uppercase text-gray-900 leading-tight mb-8">
              <span className="font-light">JÚLIA REIS</span><br />
              <span className="font-bold border-b-2 border-transparent">MEIRA</span>
            </h1>

            {/* Faixa horiontal */}
            <div className="border-y border-gray-300 py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-800 flex-shrink-0"></span>
                <h2 className="text-xs md:text-sm font-semibold tracking-[0.25em] md:tracking-[0.35em] uppercase text-gray-800">
                  Engenheira Química <span className="text-gray-300 mx-2">|</span> Técnica em Meio Ambiente
                </h2>
              </div>

              {/* Informações de Contato (estilo bloco preto do template) */}
              <div className="flex flex-col text-[10px] md:text-xs">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center mb-1">
                  <span className="bg-gray-900 text-white font-bold text-center py-0.5 px-1 uppercase w-full">E</span>
                  <span><a href="mailto:juliareismeira@gmail.com" className="hover:underline">juliareismeira@gmail.com</a></span>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center mb-1">
                  <span className="bg-gray-900 text-white font-bold text-center py-0.5 px-1 uppercase w-full">P</span>
                  <span><a href="tel:19999896901" className="hover:underline">(19) 9 9989-6901</a></span>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center mb-1">
                  <span className="bg-gray-900 text-white font-bold text-center py-0.5 px-1 uppercase w-full">A</span>
                  <span>Rua Erasmo Trielli, 275, Vila Samambaia - Andradas/MG</span>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <span className="bg-gray-900 text-white font-bold text-center py-0.5 px-1 uppercase w-full">L</span>
                  <span><a href="https://www.linkedin.com/in/juliarmeira/" target="_blank" rel="noreferrer" className="hover:underline">linkedin.com/in/juliarmeira/</a></span>
                </div>
              </div>

            </div>
          </header>

          {/* ----- BODY COLUMNS ----- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
            
            {/* LADO ESQUERDO: Perfil & Experiência (60%) */}
            <div className="md:col-span-7">
              
              {/* PROFILE */}
              <section className="mb-12">
                <h3 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-gray-900 mb-6 flex items-center gap-3">
                  Objective & Profile
                </h3>
                <div className="text-xs md:text-[13px] leading-relaxed text-gray-600 text-justify space-y-3">
                  <p className="font-semibold text-gray-800">
                    Atuar na área de Engenharia Química, aplicando minha base analítica, vivência ambiental e facilidade com tecnologia para atuar no controle de qualidade, melhoria contínua e resolução de problemas práticos em processos industriais.
                  </p>
                  <p>
                    Sou Engenheira Química e Técnica em Meio Ambiente, e minha trajetória até aqui foi muito construída na prática: lidando com licenciamentos, análises de água e rotinas de gestão pública e ambiental. O que me motiva de verdade é entender como as coisas funcionam e otimizar processos. Não gosto de rotinas ineficientes, por isso sou curiosa com tecnologia — sempre busco aprender ferramentas novas, como o QGIS para mapeamento ou o básico de programação, para facilitar o trabalho do dia a dia.
                  </p>
                  <p>
                    Fora do trabalho, sou faixa branca de Jiu-Jitsu, o que me ensina muito sobre disciplina, apanhar, levantar e manter a constância. Profissionalmente, não sou a pessoa que tem resposta para tudo de imediato, mas sou a pessoa que vai sentar, investigar o problema, estudar a ferramenta necessária e entregar a solução de forma organizada.
                  </p>
                </div>
              </section>

              {/* EXPERIENCE LINE */}
              <section>
                <h3 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-gray-900 mb-8 flex items-center gap-3">
                  Experience
                </h3>

                <div className="relative border-l border-gray-300 ml-1.5 space-y-10 pb-4">
                  
                  {/* Item 1 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-800 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Secretaria de Planejamento Urbano e Meio Ambiente</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Técnica em Química <span className="mx-2">|</span> 10/2025 - Atualmente
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Realização de análises de qualidade de água nos distritos e aglomerados.</li>
                      <li>Acompanhamento técnico presencial e monitoramento do funcionamento das Estações de Tratamento de Esgoto (ETEs).</li>
                      <li>Execução de vistorias técnicas e elaboração de pareceres ambientais.</li>
                    </ul>
                  </div>

                  {/* Item 2 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Meira Soluções</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Consultora Técnica e Projetos <span className="mx-2">|</span> 2024 - Atualmente
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Atuação independente no mapeamento de processos e condução de projetos de regularização para produtores de cachaça.</li>
                      <li>Estudos e desenvolvimento de soluções tecnológicas (como integrações via Antygravity) para gestão de dados e controle de alambiques.</li>
                    </ul>
                  </div>

                  {/* Item 3 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Prefeitura Municipal</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Assistente Administrativo <span className="mx-2">|</span> 05/2024 - 10/2025
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Apoio na administração de contratos e convênios gerados por processos licitatórios.</li>
                      <li>Organização e acompanhamento administrativo de programas de estágio.</li>
                    </ul>
                  </div>

                  {/* Item 4 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Gonçalves Engenharia</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Técnica Ambiental <span className="mx-2">|</span> 01/2022 - 04/2025
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Atuação em projetos de engenharia rural, urbana e industrial.</li>
                      <li>Execução de estudos hidrológicos, processos de licenciamento, outorgas e intervenções.</li>
                      <li>Elaboração de mapas e análises espaciais utilizando o software QGIS.</li>
                    </ul>
                  </div>

                  {/* Item 5 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Kahza Experience</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Supervisora de Produção e Analista (Remoto) <span className="mx-2">|</span> 03/2022 - 04/2023
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Análise técnica de terrenos nos Estados Unidos para avaliar a viabilidade de compra em leilões, considerando fatores topográficos, econômicos e hidrológicos.</li>
                    </ul>
                  </div>

                  {/* Item 6 */}
                  <div className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[4.5px] top-1.5"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Icasa - Indústria Cerâmica Andradense S/A</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Estagiária <span className="mx-2">|</span> 04/2021 - 09/2021
                    </p>
                    <ul className="text-xs md:text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Acompanhamento diário das etapas de produção no chão de fábrica.</li>
                      <li>Aplicação prática de ferramentas de gestão de qualidade para mitigação de falhas na linha de produção cerâmica.</li>
                    </ul>
                  </div>

                </div>
              </section>

            </div>

            {/* LADO DIREITO: Skills, Educação e Idiomas (40%) */}
            <div className="md:col-span-5 space-y-12">
              
              {/* SKILLS */}
              <section>
                <h3 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-gray-900 mb-6">
                  Skills
                </h3>
                
                <div className="space-y-6">
                  {/* Soft Skills */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Comportamental (XP)</h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center bg-gray-50 px-2 py-1.5">
                        <span className="text-xs text-gray-800 font-medium">Organização e Disciplina</span>
                        <span className="text-[10px] tracking-widest text-gray-700 font-mono">●●●●●</span>
                      </li>
                      <li className="flex justify-between items-center bg-gray-50 px-2 py-1.5">
                        <span className="text-xs text-gray-800 font-medium">Aprendizado Contínuo</span>
                        <span className="text-[10px] tracking-widest text-gray-700 font-mono">●●●●●</span>
                      </li>
                      <li className="flex justify-between items-center bg-gray-50 px-2 py-1.5">
                        <span className="text-xs text-gray-800 font-medium">Perfil Analítico</span>
                        <span className="text-[10px] tracking-widest text-gray-700 font-mono">●●●○○</span>
                      </li>
                      <li className="flex justify-between items-center bg-gray-50 px-2 py-1.5">
                        <span className="text-xs text-gray-800 font-medium">Resolução de Problemas</span>
                        <span className="text-[10px] tracking-widest text-gray-700 font-mono">●●●○○</span>
                      </li>
                    </ul>
                  </div>

                  {/* Hard Skills */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Habilidades Técnicas</h4>
                    <div className="space-y-4">
                      <div className="ml-2">
                        <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-gray-600 rounded-full"></span>Engenharia e Processos</h5>
                        <p className="text-xs text-gray-600 leading-relaxed ml-2.5">
                          Análise de Qualidade de Água, Licenciamento Ambiental, Práticas ESG, Regularização de Destilarias (Cachaça), Gestão de Resíduos, CTF APP e Mapeamento de Processos.
                        </p>
                      </div>
                      <div className="ml-2">
                        <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-gray-600 rounded-full"></span>Softwares e Geo</h5>
                        <p className="text-xs text-gray-600 leading-relaxed ml-2.5">
                          QGIS (Intermediário/Avançado), AutoCAD, HEC-RAS, Pacote Office e ecossistema Google.
                        </p>
                      </div>
                      <div className="ml-2">
                        <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-gray-600 rounded-full"></span>Tecnologia</h5>
                        <p className="text-xs text-gray-600 leading-relaxed ml-2.5">
                          Uso de IA para rotinas administrativas, PowerBI (Básico), Python (Básico) e exploração da plataforma Antygravity para gestão de dados.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* EDUCATION */}
              <section>
                <h3 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-gray-900 mb-6">
                  Education
                </h3>
                <div className="relative border-l border-gray-300 ml-1.5 space-y-6">
                  
                  <div className="relative pl-5">
                    <div className="absolute w-[5px] h-[5px] bg-gray-600 rounded-full -left-[3px] top-1.5"></div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Bacharelado em Engenharia Química</h4>
                    <p className="text-xs text-gray-600 leading-tight">FHO – Centro Universitário Hermínio Ometto</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Concluído em Mar/2023</p>
                  </div>
                  
                  <div className="relative pl-5">
                    <div className="absolute w-[5px] h-[5px] bg-gray-600 rounded-full -left-[3px] top-1.5"></div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest leading-snug mb-1">Técnico em Meio Ambiente</h4>
                    <p className="text-xs text-gray-600 leading-tight">ETEC Dr. Carolino da Motta e Silva</p>
                  </div>

                </div>
              </section>

              {/* IDIOMAS */}
              <section>
                <h3 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-gray-900 mb-6">
                  Languages
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 uppercase tracking-widest">Inglês</span>
                    <span className="text-gray-500">Avançado</span>
                  </li>
                  <li className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                    <span className="font-bold text-gray-800 uppercase tracking-widest">Espanhol</span>
                    <span className="text-gray-500">Intermediário</span>
                  </li>
                  <li className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                    <span className="font-bold text-gray-800 uppercase tracking-widest">Italiano</span>
                    <span className="text-gray-500">Básico</span>
                  </li>
                </ul>
              </section>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CurriculumPage;
