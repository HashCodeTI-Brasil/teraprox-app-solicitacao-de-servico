export const paths = {
  solicitacoesDeServico: '/solicitacoesDeServico',
  solicitacaoDeServicoForm: '/solicitacaoDeServicoForm',
  aprovaStatus: '/aprovacaoStatus',
  login: '/Login',
};

export const endPointManutencao =
  process.env.REACT_APP_END_POINT_MANUTENCAO || 'http://localhost:3001';

export const endPointUser =
  process.env.REACT_APP_END_POINT_USER || 'https://teraprox-gateway-7ggpsfrixq-rj.a.run.app/';

export const ids = {
  solicitacoesDeServicoFilterIconButton: 'sol-filter-btn',
};

export const STATUS_COLORS = {
  PENDENTE: '#f59e0b',
  APROVADO: '#22c55e',
  REPROVADO: '#ef4444',
  CANCELADO: '#6b7280',
  EM_EXECUCAO: '#3b82f6',
};

export const getStatusColor = (status) =>
  STATUS_COLORS[status?.toUpperCase()] || '#9ca3af';
