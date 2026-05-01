/** @type {import('teraprox-core-sdk').RemoteManifest} */
export const manifest = {
  name: 'teraprox_app_solicitacao',
  version: '1.1.0',
  menuGroup: { name: 'SGM', icon: 'FaTools', order: 10 },
  defaultReducers: ['globalError', 'notification', 'picker', 'pickers', 'timer'],
  menuSections: [
    {
      group: 'SGM',
      label: 'Manutenção',
      icon: 'FaClipboardList',
      order: 10, // ordem da sub-section dentro de SGM
      items: [
        {
          label: 'Solicitações de Serviço',
          path: '/solicitacoesDeServico',
          module: './SolicitacoesDeServico',
          context: 'solicitacaoDeServico',
          icon: 'FaClipboardCheck',
          order: 10, // dentro de Manutenção: SS=10, OS=20, OM=30
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
    // Read-only por id — destino do chip "SS #X" em OsCard cross-MF.
    // Não dispara dispatch para o reducer de form: tela faz fetch direto por id.
    {
      path: '/solicitacao/:id',
      module: './SolicitacaoDeServicoView',
      context: 'solicitacaoDeServico',
      reducers: [],
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
