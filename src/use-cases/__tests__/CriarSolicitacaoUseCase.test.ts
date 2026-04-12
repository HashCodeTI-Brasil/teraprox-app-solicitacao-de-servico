import { CriarSolicitacaoUseCase } from '../CriarSolicitacaoUseCase';
import { NullSolicitacaoRepository } from './NullSolicitacaoRepository';

const makeForm = (overrides: any = {}) => ({
  descricaoDoProblema: 'Motor sem lubricação',
  dataDeAbertura: '2026-04-11T12:00',
  recursos: [{ id: 'r1', nome: 'Torno' }],
  setor: 'Produção',
  setorDestino: 'Manutenção',
  userId: 'user-3',
  ...overrides,
});

describe('CriarSolicitacaoUseCase', () => {
  let repo: NullSolicitacaoRepository;
  let useCase: CriarSolicitacaoUseCase;

  beforeEach(() => {
    repo = new NullSolicitacaoRepository();
    useCase = new CriarSolicitacaoUseCase(repo);
  });

  it('lança erro quando recursos está vazio', async () => {
    await expect(
      useCase.execute({ form: makeForm({ recursos: [] }), emergencial: 'N' }),
    ).rejects.toThrow('Selecione pelo menos um ativo/recurso');
  });

  it('lança erro quando recursos é undefined', async () => {
    await expect(
      useCase.execute({ form: makeForm({ recursos: undefined }), emergencial: 'N' }),
    ).rejects.toThrow('Selecione pelo menos um ativo/recurso');
  });

  it('lança erro quando descricaoDoProblema está vazia', async () => {
    await expect(
      useCase.execute({ form: makeForm({ descricaoDoProblema: '' }), emergencial: 'N' }),
    ).rejects.toThrow('Descrição do problema é obrigatória');
  });

  it('lança erro quando descricaoDoProblema é só espaços', async () => {
    await expect(
      useCase.execute({ form: makeForm({ descricaoDoProblema: '   ' }), emergencial: 'N' }),
    ).rejects.toThrow('Descrição do problema é obrigatória');
  });

  it('lança erro quando emergencial é null', async () => {
    await expect(
      useCase.execute({ form: makeForm(), emergencial: null }),
    ).rejects.toThrow('Informe se é emergencial');
  });

  it('chama repo.criar uma vez para 1 recurso', async () => {
    const spy = jest.spyOn(repo, 'criar');
    await useCase.execute({ form: makeForm(), emergencial: 'N' });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('chama repo.criar duas vezes para 2 recursos', async () => {
    const spy = jest.spyOn(repo, 'criar');
    const form = makeForm({ recursos: [{ id: 'r1' }, { id: 'r2' }] });
    await useCase.execute({ form, emergencial: 'N' });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('define status=PENDENTE e rota="" para emergencial=N', async () => {
    const spy = jest.spyOn(repo, 'criar');
    await useCase.execute({ form: makeForm(), emergencial: 'N' });
    const [rota, payload] = spy.mock.calls[0];
    expect(rota).toBe('');
    expect(payload.status).toBe('PENDENTE');
  });

  it('define status=APROVADO e rota=maquinaParada para emergencial=Y', async () => {
    const spy = jest.spyOn(repo, 'criar');
    await useCase.execute({ form: makeForm(), emergencial: 'Y' });
    const [rota, payload] = spy.mock.calls[0];
    expect(rota).toBe('maquinaParada');
    expect(payload.status).toBe('APROVADO');
  });

  it('passa o recursoId correto em cada chamada', async () => {
    const spy = jest.spyOn(repo, 'criar');
    const form = makeForm({ recursos: [{ id: 'r1' }, { id: 'r2' }] });
    await useCase.execute({ form, emergencial: 'N' });
    expect(spy.mock.calls[0][1].recursoId).toBe('r1');
    expect(spy.mock.calls[1][1].recursoId).toBe('r2');
  });

  it('passa undefined como anexo quando não é File', async () => {
    const spy = jest.spyOn(repo, 'criar');
    await useCase.execute({ form: makeForm(), emergencial: 'N', anexo: null });
    expect(spy.mock.calls[0][2]).toBeUndefined();
  });
});
