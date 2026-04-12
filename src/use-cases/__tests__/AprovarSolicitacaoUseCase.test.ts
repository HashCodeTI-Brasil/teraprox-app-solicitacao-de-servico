import { AprovarSolicitacaoUseCase } from '../AprovarSolicitacaoUseCase';
import { NullSolicitacaoRepository } from './NullSolicitacaoRepository';

const makeForm = (overrides: any = {}) => ({
  id: 42,
  userId: 'user-1',
  descricaoDoProblema: 'Máquina parada',
  status: 'PENDENTE',
  recursos: [{ id: 'r1', nome: 'Torno CNC' }],
  osTipos: [],
  ...overrides,
});

describe('AprovarSolicitacaoUseCase', () => {
  let repo: NullSolicitacaoRepository;
  let useCase: AprovarSolicitacaoUseCase;

  beforeEach(() => {
    repo = new NullSolicitacaoRepository();
    useCase = new AprovarSolicitacaoUseCase(repo);
  });

  it('lança erro quando id está ausente', async () => {
    await expect(
      useCase.execute({
        id: '',
        form: makeForm(),
        tarefas: [],
        descricaoDoProblema: 'ok',
        osTipos: [{ id: 1 }],
      }),
    ).rejects.toThrow('ID da solicitação é obrigatório');
  });

  it('lança erro quando osTipos está vazio', async () => {
    await expect(
      useCase.execute({
        id: 42,
        form: makeForm(),
        tarefas: [],
        descricaoDoProblema: 'ok',
        osTipos: [],
      }),
    ).rejects.toThrow('Defina o tipo da ordem de serviço');
  });

  it('lança erro quando osTipos é undefined', async () => {
    await expect(
      useCase.execute({
        id: 42,
        form: makeForm(),
        tarefas: [],
        descricaoDoProblema: 'ok',
        osTipos: undefined as any,
      }),
    ).rejects.toThrow('Defina o tipo da ordem de serviço');
  });

  it('chama repo.aprovar com o id correto', async () => {
    const spy = jest.spyOn(repo, 'aprovar');
    await useCase.execute({
      id: 42,
      form: makeForm(),
      tarefas: [{ id: 't1' }],
      descricaoDoProblema: 'Atualizada',
      osTipos: [{ id: 1, descricao: 'Corretiva' }],
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(42, expect.any(Object));
  });

  it('envia payload com id=null e tarefas mescladas', async () => {
    const spy = jest.spyOn(repo, 'aprovar');
    const tarefas = [{ id: 't1', descricao: 'Lubrificar' }];
    await useCase.execute({
      id: 42,
      form: makeForm({ descricaoDoProblema: 'Original' }),
      tarefas,
      descricaoDoProblema: 'Editada',
      osTipos: [{ id: 1 }],
    });
    const [, payload] = spy.mock.calls[0];
    expect(payload.id).toBeNull();
    expect(payload.tarefas).toEqual(tarefas);
    expect(payload.descricaoDoProblema).toBe('Editada');
  });
});
