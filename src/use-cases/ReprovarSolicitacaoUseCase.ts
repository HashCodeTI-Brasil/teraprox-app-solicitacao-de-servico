import { ISolicitacaoRepository } from './ports/ISolicitacaoRepository';
import type { IObservabilityPort } from 'teraprox-core-sdk';

export interface ReprovarInput {
  id: string | number;
  /** Estado completo do formulário Redux */
  form: any;
  /** Justificativa preenchida pelo aprovador */
  justificativa: { descricao: string; [key: string]: any };
  /** Descrição do problema que pode ter sido editada localmente */
  descricaoDoProblema: string;
}

export class ReprovarSolicitacaoUseCase {
  constructor(
    private readonly repo: ISolicitacaoRepository,
    private readonly observability?: IObservabilityPort,
  ) {}

  async execute(input: ReprovarInput): Promise<void> {
    if (!input.id) {
      throw new Error('ID da solicitação é obrigatório');
    }
    if (!input.justificativa?.descricao?.trim()) {
      throw new Error('Motivo da reprovação é obrigatório');
    }

    const payload = {
      ...input.form,
      descricaoDoProblema: input.descricaoDoProblema,
      justificativa: {
        ...input.justificativa,
        userId: input.form?.userId,
      },
    };

    this.observability?.logBreadcrumb({
      category: 'action',
      message: 'Reprovando solicitação de serviço',
      data: { id: input.id },
    });

    await this.repo.reprovar(input.id, payload);

    this.observability?.trackInteraction({
      name: 'reject-solicitacao',
      properties: { id: input.id },
    });
  }
}
