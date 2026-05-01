import './solicitacoesDeServico.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiRefreshCw, FiPlus, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { MdOutlineAssignmentLate } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { getStatusColor } from '../models/constantes';
import { formatShortDate, formatDate } from '../Services/stringUtils';
import { StatusPills, PeriodSelector } from 'teraprox-ui-kit';
import { useSolicitacaoViewModel } from '../view-models/ReduxSolicitacaoAdapter';
import useNavigator from '../hooks/useNavigator';

// ─── Status pills configuration ───────────────────────────────────────────
const STATUS_PILLS = ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO', 'EM_EXECUCAO'];

const SORT_OPTIONS = [
  { label: 'Data ↓', value: 'date_desc' },
  { label: 'Data ↑', value: 'date_asc' },
  { label: 'Status', value: 'status' },
];

const GROUP_OPTIONS = [
  { label: 'Sem Agrupamento', value: 'none' },
  { label: 'Por Status', value: 'status' },
  { label: 'Por Solicitante', value: 'solicitante' },
  { label: 'Por Recurso', value: 'recurso' },
];

// ─── Card component ────────────────────────────────────────────────────────
function SolicitacaoCard({
  solicitacao,
  onCardClick,
  onAprovarClick,
  onViewOs,
  highlight,
}: {
  solicitacao: any;
  onCardClick?: (ss: any) => void;
  onAprovarClick?: (ss: any) => void;
  onViewOs?: (osId: number | string) => void;
  highlight?: boolean;
}) {
  const cor = getStatusColor(solicitacao.status);
  const recursoNome = solicitacao.recurso?.nome || solicitacao.recursoNome || '';
  const dateText = formatShortDate(solicitacao.dataDeAbertura);
  const isPendente = solicitacao.status?.toUpperCase() === 'PENDENTE';
  const osGerada = solicitacao.ordemDeServico;
  const osId = osGerada?.id;

  return (
    <div
      className={`ss-card${highlight ? ' ss-card--highlight' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onCardClick && onCardClick(solicitacao)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick(solicitacao)}
    >
      <div className="ss-card-border" style={{ backgroundColor: cor }} />
      <div className="ss-card-body">
        <div className="ss-card-row-space">
          <span className="ss-card-id">#{solicitacao.id ?? '---'}</span>
          <span className="ss-status-badge" style={{ color: cor, borderColor: `${cor}60`, backgroundColor: `${cor}18` }}>
            {solicitacao.status?.toUpperCase() ?? 'PENDENTE'}
          </span>
        </div>
        {recursoNome ? (
          <div className="ss-card-row ss-card-recurso">
            <span className="ss-card-icon-label">&#xF012D;</span>
            <span className="ss-card-recurso-text">{recursoNome}</span>
          </div>
        ) : null}
        {solicitacao.descricaoDoProblema ? (
          <p className="ss-card-desc">{solicitacao.descricaoDoProblema}</p>
        ) : null}
        {osGerada && osId && (
          <div className="ss-card-row">
            <button
              type="button"
              className="ss-os-link"
              onClick={(e) => {
                e.stopPropagation();
                onViewOs && onViewOs(osId);
              }}
              title={`Abrir Ordem de Serviço #${osId} gerada por esta solicitação`}
            >
              <span role="img" aria-label="os">📋</span>
              {' '}OS gerada: <strong>#{osId}</strong>
              {osGerada.status ? (
                <span className="ss-os-link-status">{' · '}{osGerada.status}</span>
              ) : null}
              {' '}<span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
        <div className="ss-card-row-space ss-card-footer">
          <span className="ss-card-meta">
            <span role="img" aria-label="solicitante">👤</span>
            {' '}{solicitacao.solicitante ?? '-'}
          </span>
          <span className="ss-card-meta">
            <span role="img" aria-label="data">🕐</span>
            {' '}{dateText}
          </span>
          {isPendente && onAprovarClick && (
            <button
              className="ss-btn-aprovar"
              onClick={(e) => { e.stopPropagation(); onAprovarClick(solicitacao); }}
              title="Aprovar / Reprovar esta solicitação"
            >
              Aprovar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sort dropdown ─────────────────────────────────────────────────────────
function SortDropdown({ activeSort, onChange }: { activeSort: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === activeSort);

  return (
    <div className="ss-dropdown" ref={ref}>
      <button className="ss-toolbar-btn" onClick={() => setOpen(!open)}>
        <FiFilter size={14} />
        <span>{current?.label ?? 'Ordenar'}</span>
      </button>
      {open && (
        <div className="ss-dropdown-menu">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`ss-dropdown-item ${activeSort === o.value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Group dropdown ────────────────────────────────────────────────────────
function GroupDropdown({ activeGroup, onChange }: { activeGroup: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = GROUP_OPTIONS.find((o) => o.value === activeGroup);

  return (
    <div className="ss-dropdown" ref={ref}>
      <button className="ss-toolbar-btn" onClick={() => setOpen(!open)}>
        <span>{current?.label ?? 'Agrupar'}</span>
      </button>
      {open && (
        <div className="ss-dropdown-menu">
          {GROUP_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`ss-dropdown-item ${activeGroup === o.value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="ss-empty">
      <MdOutlineAssignmentLate size={56} color="#9ca3af" />
      <p>Nenhuma solicitação encontrada</p>
    </div>
  );
}

// ─── Group header ──────────────────────────────────────────────────────────
function GroupHeader({ title, count, collapsed, onToggle }: { title: string; count: number; collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="ss-group-header" role="button" onClick={onToggle} tabIndex={0}>
      <div className="ss-group-title-row">
        <span className="ss-group-title">{title} ({count})</span>
        <span className={`ss-group-chevron ${collapsed ? 'collapsed' : ''}`}>▼</span>
      </div>
    </div>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
function SolicitacoesDeServico() {
  const vm = useSolicitacaoViewModel();
  const navigate = useNavigator();
  const [searchParams] = useSearchParams();
  // SS card no SGM-OS link de volta com ?ss=<id> para destacar a SS clicada;
  // OS pode link de volta com ?osOrigem=<id> (não usado aqui, mas suportado).
  const focusSsId = searchParams.get('ss');

  // ── Pure UI state (no Redux, no API) ──────────────────────────────────
  const [activePills, setActivePills] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [groupOption, setGroupOption] = useState('status');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set<string>());

  /**
   * Navega para a OS gerada por uma SS. SGM-OS expõe `/os/executar/:id`
   * para entrar na execução; o host (teraprox-core) faz o load do MF.
   * stopPropagation já foi feito no card antes de chamar.
   */
  const handleViewOs = useCallback(
    (osId: number | string) => {
      if (osId == null || osId === '') return;
      navigate(`/os/executar/${osId}`);
    },
    [navigate],
  );

  // Subscribe to real-time updates
  useEffect(() => vm.subscribeRealtime(), []);

  // Refetch when the date range changes
  useEffect(() => {
    vm.fetchSolicitacoes();
  }, [vm.startDate, vm.endDate]);

  // ── Status counters (derived from ViewModel data) ─────────────────────
  const counters = useMemo(() => {
    const map: Record<string, number> = {};
    vm.solicitacoes.forEach((ss: any) => {
      const s = ss.status?.toUpperCase() ?? 'PENDENTE';
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [vm.solicitacoes]);

  const statusMeta = useMemo(() => {
    const meta: Record<string, { label: string; color: string; count: number }> = {};
    STATUS_PILLS.forEach((status) => {
      meta[status] = { label: status, color: getStatusColor(status), count: counters[status] ?? 0 };
    });
    return meta;
  }, [counters]);

  // ── Filter + sort (pure UI derivation) ───────────────────────────────
  const filteredList = useMemo(() => {
    let list = [...vm.solicitacoes];

    if (activePills.size > 0) {
      list = list.filter((ss) => activePills.has(ss.status?.toUpperCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((ss: any) => {
        const recursoNome = ss.recurso?.nome || '';
        return (
          String(ss.id).includes(q) ||
          recursoNome.toLowerCase().includes(q) ||
          (ss.solicitante?.nome || (typeof ss.solicitante === 'string' ? ss.solicitante : '') || '').toLowerCase().includes(q) ||
          (ss.descricaoDoProblema || '').toLowerCase().includes(q)
        );
      });
    }

    list.sort((a: any, b: any) => {
      if (sortOption === 'date_asc') return new Date(a.dataDeAbertura).getTime() - new Date(b.dataDeAbertura).getTime();
      if (sortOption === 'status') return (a.status ?? '').localeCompare(b.status ?? '');
      return new Date(b.dataDeAbertura).getTime() - new Date(a.dataDeAbertura).getTime();
    });

    return list;
  }, [vm.solicitacoes, activePills, searchQuery, sortOption]);

  // ── Group ─────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    if (groupOption === 'none') return new Map<string, any[]>([['all', filteredList]]);
    const map = new Map<string, any[]>();
    filteredList.forEach((ss: any) => {
      let key: string;
      switch (groupOption) {
        case 'status':      key = ss.status?.toUpperCase() ?? 'SEM STATUS'; break;
        case 'solicitante': key = ss.solicitante ?? 'Desconhecido'; break;
        case 'recurso':     key = ss.recurso?.nome ?? 'Sem Recurso'; break;
        default:            key = formatDate(ss.dataDeAbertura);
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ss);
    });
    return map;
  }, [filteredList, groupOption]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="ss-root">
      {/* Header */}
      <div className="ss-header">
        <h2 className="ss-title">Solicitações de Serviço</h2>
        <div className="ss-header-actions">
          <button
            className="ss-icon-btn"
            onClick={vm.fetchSolicitacoes}
            disabled={vm.loading}
            title="Atualizar"
          >
            {vm.loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : <FiRefreshCw size={18} />}
          </button>
          <button className="ss-btn-primary" onClick={vm.handleNovaClick} title="Nova Solicitação">
            <FiPlus size={16} />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="ss-pills-row">
        <StatusPills
          statuses={statusMeta}
          activeKeys={Array.from(activePills)}
          onSelectionChange={(keys) => setActivePills(new Set(keys))}
        />
        {activePills.size > 0 && (
          <button className="ss-pill ss-pill-clear" onClick={() => setActivePills(new Set())}>
            <FiX size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="ss-search-row">
        <div className="ss-search-input-wrap">
          <FiSearch className="ss-search-icon" size={16} />
          <input
            className="ss-search-input"
            type="text"
            placeholder="Buscar por ID, recurso, solicitante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="ss-search-clear" onClick={() => setSearchQuery('')}><FiX size={14} /></button>
          )}
        </div>
      </div>

      {/* Toolbar: period / sort / group */}
      <div className="ss-toolbar">
        <PeriodSelector
          startDate={vm.startDate}
          endDate={vm.endDate}
          onStartDateChange={vm.setStartDate}
          onEndDateChange={vm.setEndDate}
          onPresetSelect={vm.setPeriod}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <SortDropdown activeSort={sortOption} onChange={setSortOption} />
          <GroupDropdown activeGroup={groupOption} onChange={(v) => { setGroupOption(v); setCollapsedGroups(new Set()); }} />
        </div>
      </div>

      {/* List */}
      <div className="ss-list">
        {vm.loading && filteredList.length === 0 ? (
          <div className="ss-loading" role="status" aria-label="A carregar">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">A carregar...</span>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState />
        ) : (
          Array.from(grouped.entries()).map(([groupKey, items]) => (
            <div key={groupKey}>
              {groupOption !== 'none' && (
                <GroupHeader
                  title={groupKey}
                  count={items.length}
                  collapsed={collapsedGroups.has(groupKey)}
                  onToggle={() => toggleGroup(groupKey)}
                />
              )}
              {!collapsedGroups.has(groupKey) &&
                items.map((ss: any, index: number) => (
                  <SolicitacaoCard
                    key={`${groupKey}-${ss.id ?? 'sem-id'}-${ss.dataDeAbertura ?? 'sem-data'}-${index}`}
                    solicitacao={ss}
                    onCardClick={() => vm.handleCardClick(ss)}
                    onAprovarClick={() => vm.handleAprovarClick(ss)}
                    onViewOs={handleViewOs}
                    highlight={focusSsId != null && String(ss.id) === String(focusSsId)}
                  />
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SolicitacoesDeServico;
