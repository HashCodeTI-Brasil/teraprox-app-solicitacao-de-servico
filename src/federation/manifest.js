/** @type {import('teraprox-core-sdk/federation').RemoteManifest} */
export const manifest = {
  name: 'teraprox_app_solicitacao',
  version: '1.1.0',
  defaultReducers: ['globalError', 'notification', 'picker', 'pickers', 'timer'],
  menuSections: [
    {
      label: 'Solicitações',
      icon: 'FaClipboardCheck',
      items: [
        {
          label: 'Solicitações de Serviço',
          path: '/solicitacoesDeServico',
          module: './SolicitacoesDeServico',
          context: 'solicitacaoDeServico',
          reducers: ['solicitacaoDeServico'],
        },
      ],
    },
  ],
  formRoutes: [
    {
      path: '/solicitacaoDeServicoForm',
      module: './SolicitacaoDeServicoForm',
      context: 'solicitacaoDeServico',
      reducers: ['solicitacaoDeServico', 'tarefa'],
    },
    {
      path: '/aprovacaoStatus',
      module: './AprovacaoStatus',
      context: 'solicitacaoDeServico',
      reducers: ['solicitacaoDeServico', 'tarefa', 'justificativa'],
    },
  ],
}

export default manifest
