// Bridge padronizado do SDK — recebe coreService do Core via FederatedComponentHOC.
// Importar sempre pelo entry principal `teraprox-core-sdk` (não `.../federation`) para
// compartilhar o mesmo CoreServiceContext que useCoreService() nos view-models.
export { FederatedBridge as default } from 'teraprox-core-sdk'
