import React, { useState, useEffect } from 'react';
import {
  FileText, ShieldCheck, RefreshCw, AlertTriangle,
  Search, CheckCircle2, Clock, Scale, BookOpen, Filter,
  ArrowUpRight, HelpCircle, XCircle, MessageSquare, RotateCcw
} from 'lucide-react';

interface RegulationItem {
  id: number;
  title: string;
  type: string;
  number?: string;
  year?: number;
  status: string;
  official_url: string;
  version: number;
  last_verified_at: string;
  checked_at?: string;
  evidence: { text: string; url: string; kind: string }[];
  fetch_ok: boolean;
  fresh: boolean;
  warning?: string;
}

// -------------------------------------------------------
// STATUS DISPLAY — honesto e rastreável
// Nunca mostra VIGENTE sem evidência confirmada
// -------------------------------------------------------
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; badge: string }> = {
  ACTIVE: {
    label: 'Vigente',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badge: 'Confirmado como vigente'
  },
  PENDING_REVIEW: {
    label: 'Aguardando Análise',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: <Clock className="w-3.5 h-3.5" />,
    badge: 'Status determinado por heurística — não confirmado'
  },
  REVOKED: {
    label: 'Revogada',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: <XCircle className="w-3.5 h-3.5" />,
    badge: 'Sinais de revogação detectados no texto'
  },
  SUPERSEDED: {
    label: 'Substituída',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: <XCircle className="w-3.5 h-3.5" />,
    badge: 'Norma substituída por versão mais recente'
  },
  PARTIALLY_ACTIVE: {
    label: 'Revogação parcial',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badge: 'Revogação parcial identificada; os dispositivos restantes exigem análise'
  },
  PUBLIC_CONSULTATION: {
    label: 'Consulta Pública',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    badge: 'Em processo de consulta pública / minuta'
  },
  DRAFT: {
    label: 'Minuta',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: <FileText className="w-3.5 h-3.5" />,
    badge: 'Documento em fase de elaboração'
  },
  UNKNOWN: {
    label: 'Status Indeterminado',
    color: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    badge: 'Status não pôde ser determinado sem revisão humana ou LLM'
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['UNKNOWN'];
  return (
    <span
      title={cfg.badge}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color} cursor-help`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

export const RegulatorioMAPAPage: React.FC = () => {
  const [regulations, setRegulations] = useState<RegulationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [crawling, setCrawling] = useState<boolean>(false);
  const [reprocessing, setReprocessing] = useState<boolean>(false);
  const [monitor, setMonitor] = useState<{ monitor_enabled: boolean; crawl_running: boolean; last_run_at?: string; last_run_status?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [notification, setNotification] = useState<{ text: string; kind: 'ok' | 'warn' | 'error' } | null>(null);

  const apiBase = (import.meta.env.VITE_REGULATORY_API_URL ?? '').replace(/\/$/, '');

  const fetchRegulations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/regulations`);
      if (res.ok) {
        const data = await res.json();
        setRegulations(data.regulations ?? []);
      } else {
        setNotification({ text: 'API não disponível no navegador. Execute o backend via CLI.', kind: 'warn' });
        setRegulations([]);
      }
    } catch {
      setNotification({ text: 'Servidor regulatório indisponível. Verifique a conexão com o backend.', kind: 'warn' });
      setRegulations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
    const refreshMonitor = async () => {
      try {
        const res = await fetch(`${apiBase}/api/health`);
        if (res.ok) setMonitor(await res.json());
        else setMonitor(null);
      } catch { setMonitor(null); }
    };
    refreshMonitor();
    const timer = window.setInterval(refreshMonitor, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    setNotification(null);
    try {
      const res = await fetch(`${apiBase}/api/crawl`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setNotification({ text: data.report_summary ?? 'Varredura concluída.', kind: data.status === 'PARTIAL' ? 'warn' : 'ok' });
        await fetchRegulations();
      } else {
        const error = await res.json().catch(() => ({}));
        setNotification({ text: error.detail ?? 'Erro na varredura. Verifique o servidor.', kind: 'error' });
      }
    } catch {
      setNotification({ text: 'Backend indisponível. Use o CLI: python -m backend.main --run-crawl', kind: 'warn' });
    } finally {
      setCrawling(false);
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    setNotification(null);
    try {
      const res = await fetch(`${apiBase}/api/reprocess-status`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setNotification({
          text: data.report_summary ?? `Reclassificação concluída. ${data.status_changed} status corrigidos.`,
          kind: data.status === 'PARTIAL' ? 'warn' : 'ok'
        });
        await fetchRegulations();
      } else {
        const error = await res.json().catch(() => ({}));
        setNotification({ text: error.detail ?? 'Erro ao reclassificar. Verifique o servidor.', kind: 'error' });
      }
    } catch {
      setNotification({ text: 'Backend indisponível.', kind: 'warn' });
    } finally {
      setReprocessing(false);
    }
  };

  const filteredRegulations = regulations.filter(reg => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || reg.title.toLowerCase().includes(q) || (reg.number ?? '').includes(q);
    const matchesType = selectedType === 'TODOS' || (reg.type ?? '').toUpperCase().includes(selectedType);
    const matchesStatus = selectedStatus === 'TODOS' || reg.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusCounts = regulations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const notifClass = notification
    ? notification.kind === 'ok'
      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
      : notification.kind === 'warn'
      ? 'bg-amber-950/60 border-amber-500/30 text-amber-200'
      : 'bg-red-950/60 border-red-500/30 text-red-200'
    : '';

  return (
    <div className="space-y-6 text-slate-100 p-2 sm:p-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              Inteligência Regulatória MAPA — Bebidas
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitoramento, controle de versão e rastro auditável de atos normativos. Status nunca presumido sem evidência.
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleReprocess}
            disabled={reprocessing || crawling}
            title="Consulta novamente as fontes oficiais e reavalia as evidências"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700/60 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all active:scale-95"
          >
            <RotateCcw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
            {reprocessing ? 'Reclassificando...' : 'Corrigir Status'}
          </button>

          <button
            onClick={handleTriggerCrawl}
            disabled={crawling || reprocessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${crawling ? 'animate-spin' : ''}`} />
            {crawling ? 'Varrendo...' : 'Nova Varredura MAPA'}
          </button>
        </div>
      </div>

      {/* Notification banner */}
      <div className="text-xs text-slate-400">
        {monitor
          ? `${monitor.crawl_running ? 'Varredura em execução' : monitor.monitor_enabled ? 'Monitor automático habilitado' : 'Monitor automático desabilitado'} · Última execução: ${monitor.last_run_at ? new Date(monitor.last_run_at).toLocaleString('pt-BR') : 'ainda não realizada'}${monitor.last_run_status ? ` (${monitor.last_run_status})` : ''}`
          : 'Monitor sem conexão com o servidor'}
      </div>
      {notification && (
        <div className={`p-4 border rounded-xl flex items-start gap-3 text-sm ${notifClass}`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap font-sans">{notification.text}</pre>
        </div>
      )}

      {/* ⚠️ Aviso de anti-alucinação */}
      <div className="p-4 bg-amber-950/30 border border-amber-700/30 rounded-xl flex items-start gap-3 text-sm text-amber-300">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <p className="font-semibold text-amber-200 mb-1">Vigência exige evidência específica da norma</p>
          <p className="text-amber-400/80 leading-relaxed">
            Normas classificadas como <strong>"Aguardando Análise"</strong> ou <strong>"Status Indeterminado"</strong> ainda não foram confirmadas por revisão normativa.
            A coleta consulta o índice e os documentos oficiais. Textos antigos e cláusulas de entrada em vigor não confirmam a vigência atual. Revogações parciais exigem análise dos dispositivos afetados.
            Nunca use apenas a lista do portal como prova de vigência — normas revogadas por atos posteriores podem permanecer listadas.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</span>
          <div className="text-3xl font-extrabold text-white mt-1">{regulations.length}</div>
          <div className="flex items-center gap-1 mt-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Documentos mapeados</span>
          </div>
        </div>

        {(['PENDING_REVIEW', 'REVOKED', 'PUBLIC_CONSULTATION', 'UNKNOWN'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = statusCounts[s] ?? 0;
          return (
            <div key={s} className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-md">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{cfg.label}</span>
              <div className={`text-3xl font-extrabold mt-1 ${count > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{count}</div>
              <span className="text-xs text-slate-500 mt-1 block">normas</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar portaria, decreto, número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['TODOS', 'PORTARIA', 'DECRETO', 'INSTRUCAO_NORMATIVA', 'MANUAL'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === type ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {type === 'INSTRUCAO_NORMATIVA' ? 'IN' : type}
            </button>
          ))}
          <div className="w-px h-5 bg-slate-700 mx-1" />
          {['TODOS', 'PENDING_REVIEW', 'REVOKED', 'PARTIALLY_ACTIVE', 'SUPERSEDED', 'PUBLIC_CONSULTATION', 'UNKNOWN'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedStatus === s ? 'bg-slate-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
            >
              {s === 'TODOS' ? 'Todos Status' : (STATUS_CONFIG[s]?.label ?? s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Atos Normativos Mapeados ({filteredRegulations.length})
          </h2>
          <span className="text-xs text-slate-500">
            Fontes federais: MAPA e documentos oficiais vinculados
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
            <p>Carregando base regulatória...</p>
          </div>
        ) : filteredRegulations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {regulations.length === 0
              ? 'Nenhuma norma no banco. Execute o crawler via CLI ou pelo botão acima.'
              : 'Nenhuma norma encontrada para os filtros aplicados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Título / Ato Normativo</th>
                  <th className="py-3.5 px-4">N°</th>
                  <th className="py-3.5 px-4">Versão</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Fonte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRegulations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {(item.type ?? 'DESCONHECIDO').replace('_', '\n')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-100 max-w-md">
                      <div className="line-clamp-2 text-sm leading-snug">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">MAPA — Bebidas · {item.year ?? '?'}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs whitespace-nowrap">
                      {item.number ? `nº ${item.number}` : '—'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 font-mono text-emerald-300">
                        v{item.version}.0
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                      <div className="text-xs text-slate-500 mt-2 whitespace-normal max-w-xs">
                        {item.checked_at ? `Consultado: ${new Date(item.checked_at).toLocaleString('pt-BR')}` : 'Sem consulta documentada'}
                        {!item.fresh && <p className="text-amber-400">Verificação incompleta ou desatualizada</p>}
                        {item.warning && <p>{item.warning}</p>}
                        {item.evidence?.map((e, i) => (
                          <a key={i} href={e.url} target="_blank" rel="noopener noreferrer" className="block text-emerald-400 underline mt-1">{e.text}</a>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <a
                        href={item.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium transition-colors"
                      >
                        Fonte Oficial <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Base para GPT instructions */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Configuração para uso como base do Agente GPT
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para usar este banco como base do seu agente: inicie o servidor com <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-xs">uvicorn backend.main:app --port 8000</code>,
          utilize <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-xs">GET /api/knowledge?q=cachaça</code> para consultar textos e evidências,
          e configure o system prompt do agente para <strong>nunca afirmar vigência sem citar a URL oficial e o status retornado por esta API</strong>.
          Documentos com status <em>UNKNOWN</em> ou <em>PENDING_REVIEW</em> devem ser comunicados ao usuário como "não confirmados".
        </p>
      </div>
    </div>
  );
};
