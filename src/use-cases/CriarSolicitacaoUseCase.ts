import { ISolicitacaoRepository } from './ports/ISolicitacaoRepository';
import type { IObservabilityPort } from 'teraprox-core-sdk';

export interface CriarInput {
  form: any;
  /** 'Y' = emergencial (maquinaParada), 'N' = normal — obrigatório */
  emergencial: 'Y' | 'N' | null;
  /** Arquivo de anexo opcional */
  anexo?: File | null;
}

export class CriarSolicitacaoUseCase {
  constructor(
    private readonly repo: ISolicitacaoRepository,
    private readonly observability?: IObservabilityPort,
  ) {}

  async execute(input: CriarInput): Promise<void> {
    const { form, emergencial, anexo } = input;

    if (!form?.recursos?.length) {
      throw new Error('Selecione pelo menos um ativo/recurso');
    }
    if (!form?.descricaoDoProblema?.trim()) {
      throw new Error('Descrição do problema é obrigatória');
    }
    if (emergencial === null || emergencial === undefined) {
      throw new Error('Informe se é emergencial');
    }

    const status = emergencial === 'Y' ? 'APROVADO' : 'PENDENTE';
    const rota = emergencial === 'Y' ? 'maquinaParada' : '';
    const fileAnexo = anexo instanceof File ? anexo : undefined;

    const requests = (form.recursos as Array<{ id: any }>).map(({ id }) => {
      const payload = { ...form, status, recursoId: id };
      return this.repo.criar(rota, payload, fileAnexo);
    });

    this.observability?.logBreadcrumb({
      category: 'action',
      message: 'Criando solicitação de serviço',
      data: { emergencial, recursos: form.recursos.length },
    });

    await Promise.all(requests);

    this.observability?.trackInteraction({
      name: 'create-solicitacao',
      properties: { emergencial, recursos: form.recursos.length },
    });
  }
}
