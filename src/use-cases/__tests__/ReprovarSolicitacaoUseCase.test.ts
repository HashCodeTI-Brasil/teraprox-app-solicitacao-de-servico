import { ReprovarSolicitacaoUseCase } from '../ReprovarSolicitacaoUseCase';
import { NullSolicitacaoRepository } from './NullSolicitacaoRepository';

const makeForm = (overrides: any = {}) => ({
  id: 99,
  userId: 'user-2',
  descricaoDoProblema: 'Equipamento com falha',
  status: 'PENDENTE',
  ...overrides,
});

describe('ReprovarSolicitacaoUseCase', () => {
  let repo: NullSolicitacaoRepository;
  let useCase: ReprovarSolicitacaoUseCase;

  beforeEach(() => {
    repo = new NullSolicitacaoRepository();
    useCase = new ReprovarSolicitacaoUseCase(repo);
  });

  it('lança erro quando id está ausente', async () => {
    await expect(
      useCase.execute({
        id: '',
        form: makeForm(),
        justificativa: { descricao: 'motivo válido' },
        descricaoDoProblema: 'ok',
      }),
    ).rejects.toThrow('ID da solicitação é obrigatório');
  });

  it('lança erro quando justificativa é string vazia', async () => {
    await expect(
      useCase.execute({
        id: 99,
        form: makeForm(),
        justificativa: { descricao: '' },
        descricaoDoProblema: 'ok',
      }),
    ).rejects.toThrow('Motivo da reprovação é obrigatório');
  });

  it('lança erro quando justificativa é apenas espaços em branco', async () => {
    await expect(
      useCase.execute({
        id: 99,
        form: makeForm(),
        justificativa: { descricao: '   ' },
        descricaoDoProblema: 'ok',
      }),
    ).rejects.toThrow('Motivo da reprovação é obrigatório');
  });

  it('lança erro quando justificativa.descricao é undefined', async () => {
    await expect(
      useCase.execute({
        id: 99,
        form: makeForm(),
        justificativa: { descricao: undefined as any },
        descricaoDoProblema: 'ok',
      }),
    ).rejects.toThrow('Motivo da reprovação é obrigatório');
  });

  it('chama repo.reprovar com o id correto', async () => {
    const spy = jest.spyOn(repo, 'reprovar');
    await useCase.execute({
      id: 99,
      form: makeForm(),
      justificativa: { descricao: 'Fora do padrão' },
      descricaoDoProblema: 'Editada',
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(99, expect.any(Object));
  });

  it('inclui userId do form dentro da justificativa enviada', async () => {
    const spy = jest.spyOn(repo, 'reprovar');
    await useCase.execute({
      id: 99,
      form: makeForm({ userId: 'user-2' }),
      justificativa: { descricao: 'Fora do padrão', tipo: 'QUALIDADE' },
      descricaoDoProblema: 'Desc',
    });
    const [, payload] = spy.mock.calls[0];
    expect(payload.justificativa.userId).toBe('user-2');
    expect(payload.justificativa.tipo).toBe('QUALIDADE');
    expect(payload.descricaoDoProblema).toBe('Desc');
  });
});
