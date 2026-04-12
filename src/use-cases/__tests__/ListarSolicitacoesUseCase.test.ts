import { ListarSolicitacoesUseCase } from '../ListarSolicitacoesUseCase';
import { NullSolicitacaoRepository } from './NullSolicitacaoRepository';

const makeRepo = (data: any[] = []) => {
  const repo = new NullSolicitacaoRepository();
  repo.findBetweenDates = jest.fn().mockResolvedValue(data);
  return repo;
};

describe('ListarSolicitacoesUseCase', () => {
  it('lança erro quando inicio está vazio', async () => {
    const useCase = new ListarSolicitacoesUseCase(makeRepo());
    await expect(
      useCase.execute({ inicio: '', fim: '2026-04-11T12:00' }),
    ).rejects.toThrow('Data início é obrigatória');
  });

  it('lança erro quando fim está vazio', async () => {
    const useCase = new ListarSolicitacoesUseCase(makeRepo());
    await expect(
      useCase.execute({ inicio: '2026-04-01T00:00', fim: '' }),
    ).rejects.toThrow('Data fim é obrigatória');
  });

  it('chama repo.findBetweenDates com as datas recebidas', async () => {
    const repo = makeRepo();
    const useCase = new ListarSolicitacoesUseCase(repo);
    await useCase.execute({ inicio: '2026-04-01T00:00', fim: '2026-04-11T23:59' });
    expect(repo.findBetweenDates).toHaveBeenCalledWith(
      '2026-04-01T00:00',
      '2026-04-11T23:59',
    );
  });

  it('retorna array vazio quando repo retorna []', async () => {
    const useCase = new ListarSolicitacoesUseCase(makeRepo([]));
    const result = await useCase.execute({ inicio: '2026-04-01', fim: '2026-04-11' });
    expect(result).toEqual([]);
  });

  it('retorna array vazio quando repo retorna dado não-array', async () => {
    const repo = new NullSolicitacaoRepository();
    repo.findBetweenDates = jest.fn().mockResolvedValue(null as any);
    const useCase = new ListarSolicitacoesUseCase(repo);
    const result = await useCase.execute({ inicio: '2026-04-01', fim: '2026-04-11' });
    expect(result).toEqual([]);
  });

  it('coloca PENDENTE antes de outros status', async () => {
    const data = [
      { id: 1, status: 'APROVADO', dataDeAbertura: '2026-04-10T10:00' },
      { id: 2, status: 'PENDENTE', dataDeAbertura: '2026-04-08T10:00' },
      { id: 3, status: 'REPROVADO', dataDeAbertura: '2026-04-09T10:00' },
    ];
    const useCase = new ListarSolicitacoesUseCase(makeRepo(data));
    const result = await useCase.execute({ inicio: '2026-04-01', fim: '2026-04-11' });
    expect(result[0].status).toBe('PENDENTE');
  });

  it('ordena dentro do mesmo status por data decrescente', async () => {
    const data = [
      { id: 1, status: 'APROVADO', dataDeAbertura: '2026-04-05T10:00' },
      { id: 2, status: 'APROVADO', dataDeAbertura: '2026-04-10T10:00' },
      { id: 3, status: 'APROVADO', dataDeAbertura: '2026-04-08T10:00' },
    ];
    const useCase = new ListarSolicitacoesUseCase(makeRepo(data));
    const result = await useCase.execute({ inicio: '2026-04-01', fim: '2026-04-11' });
    expect(result.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it('mantém PENDENTE antes e ordena o restante por data decrescente', async () => {
    const data = [
      { id: 1, status: 'APROVADO', dataDeAbertura: '2026-04-10T10:00' },
      { id: 2, status: 'PENDENTE', dataDeAbertura: '2026-04-01T10:00' },
      { id: 3, status: 'PENDENTE', dataDeAbertura: '2026-04-09T10:00' },
      { id: 4, status: 'CANCELADO', dataDeAbertura: '2026-04-11T10:00' },
    ];
    const useCase = new ListarSolicitacoesUseCase(makeRepo(data));
    const result = await useCase.execute({ inicio: '2026-04-01', fim: '2026-04-11' });
    // Os dois primeiros devem ser PENDENTE (mais recente na frente)
    expect(result[0].status).toBe('PENDENTE');
    expect(result[1].status).toBe('PENDENTE');
    expect(result[0].id).toBe(3); // mais recente
    expect(result[1].id).toBe(2);
  });
});
