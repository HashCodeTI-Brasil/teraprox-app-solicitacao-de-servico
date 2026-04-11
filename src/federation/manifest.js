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
          path: '/solicitacoes',
          module: './SolicitacoesDeServico',
          context: 'solicitacaoDeServico',
        },
      ],
    },
  ],
}

export default manifest
