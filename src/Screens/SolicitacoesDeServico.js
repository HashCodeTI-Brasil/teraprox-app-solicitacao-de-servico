import './solicitacoesDeServico.css';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FiRefreshCw, FiPlus, FiSearch, FiCalendar, FiFilter, FiX } from 'react-icons/fi';
import { MdOutlineAssignmentLate } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useCoreService, useToast } from 'teraprox-core-sdk';
import useNavigator from '../hooks/useNavigator';
import {
  setSolicitacoes,
  setSolicitante,
  setSetorSolicitacao,
  updateSingleSsRow,
} from '../Reducers/solicitacaoDeServicoReducer';
import { paths, getStatusColor } from '../models/constantes';
import { formatShortDate, formatDate } from '../Services/stringUtils';
import { StatusPills, PeriodSelector } from 'teraprox-ui-kit';

// ─── Status pills configuration ───────────────────────────────────────────
const STATUS_PILLS = ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO', 'EM_EXECUCAO'];

const PERIOD_OPTIONS = [
  { label: 'Última Semana', value: 'week' },
  { label: 'Última Quinzena', value: 'fortnight' },
  { label: 'Último Mês', value: 'month' },
  { label: 'Último Bimestre', value: 'bimonthly' },
  { label: 'Último Ano', value: 'year' },
];

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

// ─── Period helpers ────────────────────────────────────────────────────────
function getPeriodRange(period) {
  const hoje = dayjs();
  switch (period) {
    case 'week': return { inicio: hoje.subtract(7, 'day'), fim: hoje };
    case 'fortnight': return { inicio: hoje.subtract(15, 'day'), fim: hoje };
    case 'month': return { inicio: hoje.subtract(1, 'month'), fim: hoje };
    case 'bimonthly': return { inicio: hoje.subtract(2, 'month'), fim: hoje };
    case 'year': return { inicio: hoje.subtract(1, 'year'), fim: hoje };
    default: return { inicio: hoje.subtract(7, 'day'), fim: hoje };
  }
}

// ─── Card component ────────────────────────────────────────────────────────
function SolicitacaoCard({ solicitacao, onCardClick }) {
  const cor = getStatusColor(solicitacao.status);
  const recursoNome = solicitacao.recurso?.nome || solicitacao.recursoNome || '';
  const dateText = formatShortDate(solicitacao.dataDeAbertura);

  return (
    <div
      className="ss-card"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick && onCardClick(solicitacao)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick(solicitacao)}
    >
      <div className="ss-card-border" style={{ backgroundColor: cor }} />
      <div className="ss-card-body">
        {/* Linha 1: ID + Status badge */}
        <div className="ss-card-row-space">
          <span className="ss-card-id">#{solicitacao.id ?? '---'}</span>
          <span
            className="ss-status-badge"
            style={{
              color: cor,
              borderColor: `${cor}60`,
              backgroundColor: `${cor}18`,
            }}
          >
            {solicitacao.status?.toUpperCase() ?? 'PENDENTE'}
          </span>
        </div>

        {/* Recurso */}
        {recursoNome ? (
          <div className="ss-card-row ss-card-recurso">
            <span className="ss-card-icon-label">&#xF012D;</span>
            <span className="ss-card-recurso-text">{recursoNome}</span>
          </div>
        ) : null}

        {/* Descrição */}
        {solicitacao.descricaoDoProblema ? (
          <p className="ss-card-desc">{solicitacao.descricaoDoProblema}</p>
        ) : null}

        {/* Linha final: solicitante + data */}
        <div className="ss-card-row-space ss-card-footer">
          <span className="ss-card-meta">
            <span role="img" aria-label="solicitante">👤</span>
            {' '}{solicitacao.solicitante ?? '-'}
          </span>
          <span className="ss-card-meta">
            <span role="img" aria-label="data">🕐</span>
            {' '}{dateText}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sort dropdown ─────────────────────────────────────────────────────────
function SortDropdown({ activeSort, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
function GroupDropdown({ activeGroup, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
function GroupHeader({ title, count, collapsed, onToggle }) {
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
  const { createController, subscribe, unsubscribe } = useCoreService();
  const navigate = useNavigator();
  const dispatch = useDispatch();
  const toast = useToast();

  const solicitacoes = useSelector((state) => state.solicitacaoDeServico?.solicitacoes ?? []);
  const { userId, fullName, setor } = useSelector((state) => state.global) ?? {};

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(getPeriodRange('week').inicio.format('YYYY-MM-DDTHH:mm'));
  const [endDate, setEndDate] = useState(getPeriodRange('week').fim.format('YYYY-MM-DDTHH:mm'));
  const [activePills, setActivePills] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [groupOption, setGroupOption] = useState('status');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Status counters
  const counters = useMemo(() => {
    const map = {};
    solicitacoes.forEach((ss) => {
      const s = ss.status?.toUpperCase() ?? 'PENDENTE';
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [solicitacoes]);

  const statusMeta = useMemo(() => {
    const meta = {};
    STATUS_PILLS.forEach((status) => {
      meta[status] = {
        label: status,
        color: getStatusColor(status),
        count: counters[status] ?? 0,
      };
    });
    return meta;
  }, [counters]);

  // Real-time update subscription
  const refresher = useCallback(
    (payload) => {
      createController('solicitacaoDeServico')
        .read('', payload)
        .then((ss) => {
          if (ss) dispatch(updateSingleSsRow(ss));
        })
        .catch(() => {});
    },
    [createController, dispatch]
  );

  useEffect(() => {
    const mo = { context: 'solicitacaoDeServico', location: '*', refresher };
    subscribe(mo);
    return () => unsubscribe(mo);
  }, [subscribe, unsubscribe, refresher]);

  // Fetch function
  const fetchSolicitacoes = useCallback(async () => {
    const inicio = dayjs(startDate);
    const fim = dayjs(endDate);
    const dataFimMod = fim.add(5, 'minute');
    setLoading(true);
    try {
      const data = await createController('solicitacaoDeServico').get(
        `solicitacaoDeServico/findBetweenDates/${inicio.format('YYYY-MM-DDTHH:mm')}/${dataFimMod.toISOString()}`
      );
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1;
        if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1;
        return new Date(b.dataDeAbertura) - new Date(a.dataDeAbertura);
      });
      dispatch(setSolicitacoes(sorted));
    } catch (err) {
      toast.error('Erro ao carregar solicitações.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, createController, dispatch, toast]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [startDate, endDate]);

  // Toggle status pill
  const togglePill = (status) => {
    setActivePills((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // ─── Filter + sort ─────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    let list = [...solicitacoes];

    // Status pills filter
    if (activePills.size > 0) {
      list = list.filter((ss) => activePills.has(ss.status?.toUpperCase()));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((ss) => {
        const recursoNome = ss.recurso?.nome || '';
        return (
          String(ss.id).includes(q) ||
          recursoNome.toLowerCase().includes(q) ||
          (ss.solicitante || '').toLowerCase().includes(q) ||
          (ss.descricaoDoProblema || '').toLowerCase().includes(q)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortOption === 'date_asc') return new Date(a.dataDeAbertura) - new Date(b.dataDeAbertura);
      if (sortOption === 'status') return (a.status ?? '').localeCompare(b.status ?? '');
      return new Date(b.dataDeAbertura) - new Date(a.dataDeAbertura); // date_desc
    });

    return list;
  }, [solicitacoes, activePills, searchQuery, sortOption]);

  // ─── Group ─────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    if (groupOption === 'none') return new Map([['all', filteredList]]);
    const map = new Map();
    filteredList.forEach((ss) => {
      let key;
      switch (groupOption) {
        case 'status': key = ss.status?.toUpperCase() ?? 'SEM STATUS'; break;
        case 'solicitante': key = ss.solicitante ?? 'Desconhecido'; break;
        case 'recurso': key = ss.recurso?.nome ?? 'Sem Recurso'; break;
        default: key = formatDate(ss.dataDeAbertura);
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ss);
    });
    return map;
  }, [filteredList, groupOption]);

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleNovaClick = async () => {
    const recursos = await createController('recurso').readAll().catch(() => []);
    if (!Array.isArray(recursos) || recursos.length === 0) {
      toast.warning('Sua empresa não possui recursos cadastrados. Contate um administrador!');
      return;
    }
    dispatch(setSolicitante({ userId, fullName }));
    dispatch(setSetorSolicitacao(setor));
    navigate(paths.solicitacaoDeServicoForm);
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
            onClick={fetchSolicitacoes}
            disabled={loading}
            title="Atualizar"
          >
            {loading ? <Spinner size="sm" animation="border" /> : <FiRefreshCw size={18} />}
          </button>
          <button className="ss-btn-primary" onClick={handleNovaClick} title="Nova Solicitação">
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
          startDate={startDate} 
          endDate={endDate} 
          onStartDateChange={setStartDate} 
          onEndDateChange={setEndDate} 
          onPresetSelect={(p) => { 
            const {inicio, fim} = getPeriodRange(p); 
            setStartDate(inicio.format('YYYY-MM-DDTHH:mm')); 
            setEndDate(fim.format('YYYY-MM-DDTHH:mm')); 
          }} 
        />
        <div style={{display: 'flex', gap: '8px'}}>
          <SortDropdown activeSort={sortOption} onChange={setSortOption} />
          <GroupDropdown activeGroup={groupOption} onChange={(v) => { setGroupOption(v); setCollapsedGroups(new Set()); }} />
        </div>
      </div>

      {/* List */}
      <div className="ss-list">
        {loading && filteredList.length === 0 ? (
          <div className="ss-loading"><Spinner animation="border" /></div>
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
                items.map((ss, index) => (
                  <SolicitacaoCard
                    key={`${groupKey}-${ss.id ?? 'sem-id'}-${ss.dataDeAbertura ?? 'sem-data'}-${index}`}
                    solicitacao={ss}
                    onCardClick={() => {
                      dispatch({ type: 'solicitacaoDeServicoReducer/populateToEdit', payload: ss });
                      navigate(paths.solicitacaoDeServicoForm);
                    }}
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
