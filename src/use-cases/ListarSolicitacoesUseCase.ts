import { ISolicitacaoRepository } from './ports/ISolicitacaoRepository';
import type { IObservabilityPort } from 'teraprox-core-sdk';

export interface ListarInput {
  inicio: string;
  fim: string;
}

export class ListarSolicitacoesUseCase {
  constructor(
    private readonly repo: ISolicitacaoRepository,
    private readonly observability?: IObservabilityPort,
  ) {}

  async execute(input: ListarInput): Promise<any[]> {
    if (!input.inicio) {
      throw new Error('Data início é obrigatória');
    }
    if (!input.fim) {
      throw new Error('Data fim é obrigatória');
    }

    this.observability?.logBreadcrumb({
      category: 'http',
      message: 'Buscando solicitações por período',
      data: { inicio: input.inicio, fim: input.fim },
    });

    const data = await this.repo.findBetweenDates(input.inicio, input.fim);

    return (Array.isArray(data) ? data : []).sort((a, b) => {
      // PENDENTE sempre vem primeiro
      if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1;
      if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1;
      // Dentro do mesmo status: mais recente primeiro
      return new Date(b.dataDeAbertura).getTime() - new Date(a.dataDeAbertura).getTime();
    });
  }
}
