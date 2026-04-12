import dayjs from 'dayjs';
import { StatusSolicitacao } from 'teraprox-core-sdk';

export const paths = {
  solicitacoesDeServico: '/solicitacoesDeServico',
  solicitacaoDeServicoForm: '/solicitacaoDeServicoForm',
  aprovaStatus: '/aprovacaoStatus',
  login: '/Login',
} as const;

export type AppPath = typeof paths[keyof typeof paths];

export const endPointManutencao = process.env.REACT_APP_END_POINT_MANUTENCAO as string;
export const endPointUser = process.env.REACT_APP_END_POINT_USER as string;

export const ids = {
  solicitacoesDeServicoFilterIconButton: 'sol-filter-btn',
} as const;

export const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  PENDENTE:    '#f59e0b',
  APROVADO:    '#22c55e',
  REPROVADO:   '#ef4444',
  CANCELADO:   '#6b7280',
  EM_EXECUCAO: '#3b82f6',
};

export const getStatusColor = (status?: string): string =>
  STATUS_COLORS[(status?.toUpperCase() as StatusSolicitacao)] || '#9ca3af';

export function getPeriodRange(period: string) {
  const hoje = dayjs();
  switch (period) {
    case 'week':       return { inicio: hoje.subtract(7, 'day'),    fim: hoje };
    case 'fortnight':  return { inicio: hoje.subtract(15, 'day'),   fim: hoje };
    case 'month':      return { inicio: hoje.subtract(1, 'month'),  fim: hoje };
    case 'bimonthly':  return { inicio: hoje.subtract(2, 'month'),  fim: hoje };
    case 'year':       return { inicio: hoje.subtract(1, 'year'),   fim: hoje };
    default:           return { inicio: hoje.subtract(7, 'day'),    fim: hoje };
  }
}
