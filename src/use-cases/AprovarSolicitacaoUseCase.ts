import { ISolicitacaoRepository } from './ports/ISolicitacaoRepository';
import type { IObservabilityPort } from 'teraprox-core-sdk';

export interface AprovarInput {
  id: string | number;
  /** Estado completo do formulário Redux */
  form: any;
  /** Lista de tarefas associadas à SS */
  tarefas: any[];
  /** Descrição do problema que pode ter sido editada localmente */
  descricaoDoProblema: string;
  /** Tipos de ordens de serviço selecionados — obrigatório para aprovar */
  osTipos: any[];
}

export class AprovarSolicitacaoUseCase {
  constructor(
    private readonly repo: ISolicitacaoRepository,
    private readonly observability?: IObservabilityPort,
  ) {}

  async execute(input: AprovarInput): Promise<void> {
    if (!input.id) {
      throw new Error('ID da solicitação é obrigatório');
    }
    if (!input.osTipos?.length) {
      throw new Error('Defina o tipo da ordem de serviço antes de aprovar');
    }

    const payload = {
      ...input.form,
      tarefas: input.tarefas,
      id: null,
      descricaoDoProblema: input.descricaoDoProblema,
    };

    this.observability?.logBreadcrumb({
      category: 'action',
      message: 'Aprovando solicitação de serviço',
      data: { id: input.id, osTipos: input.osTipos.length },
    });

    await this.repo.aprovar(input.id, payload);

    this.observability?.trackInteraction({
      name: 'approve-solicitacao',
      properties: { id: input.id },
    });
  }
}
