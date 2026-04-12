/** @type {import('teraprox-core-sdk/federation').RemoteManifest} */
export const manifest = {
  name: 'teraprox_app_solicitacao',
  version: '1.0.0',
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
        },
      ],
    },
  ],
  formRoutes: [
    { path: '/solicitacaoDeServicoForm', module: './SolicitacaoDeServicoForm', context: 'solicitacaoDeServico' },
    { path: '/aprovacaoStatus',          module: './AprovacaoStatus',          context: 'solicitacaoDeServico' },
  ],
}

export default manifest
