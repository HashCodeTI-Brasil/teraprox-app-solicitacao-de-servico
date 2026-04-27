import { useMemo } from 'react'
import { useCoreService } from 'teraprox-core-sdk'

/**
 * Constrói os 3 controllers que RecursoDisplayer (teraprox-ui-kit) espera.
 *
 * Problema: RecursoDisplayer usa internamente `useHttpController('')` esperando
 * resolver pro gateway base. Em federado, `createController('')` retorna endpoint
 * vazio — URLs ficam relativas à página, não ao gateway.
 *
 * Workaround: cria um probe com contexto conhecido ('arvoreEstrutural') pra
 * extrair o gateway base e passa esse base como `baseEndPoint` pro
 * arvoreEstrutural (rotas branchByBranchLevel/1, branch/:id, recurso/:id são
 * root-level).
 */
export function useArvoreControllers() {
  const { createController } = useCoreService() as any

  return useMemo(() => {
    const probe = createController('arvoreEstrutural') as any
    const gatewayBase =
      typeof probe?.endpoint === 'string'
        ? (probe.endpoint as string).replace(/\/arvoreEstrutural$/, '')
        : undefined

    const arvoreEstruturalController =
      gatewayBase != null ? createController('arvoreEstrutural', gatewayBase) : probe
    const branchLevelController = createController('branchLevel')
    const recursoController = createController('recurso')

    return {
      arvoreEstruturalController,
      branchLevelController,
      recursoController,
    }
  }, [createController])
}

export default useArvoreControllers
