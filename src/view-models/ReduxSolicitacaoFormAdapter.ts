import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCoreService, useHttpController, useToast, useAnexoManager } from 'teraprox-core-sdk';
import { ISolicitacaoFormViewModel } from './ISolicitacaoFormViewModel';
import {
  clearSolicitacaoDeServicoForm,
  setDataAbertura,
  setDescricaoDoProblema,
  setRecursos,
  setSetorDestinoSolicitacao,
} from '../Reducers/solicitacaoDeServicoReducer';
import { paths } from '../models/constantes';
import useNavigator from '../hooks/useNavigator';
import type { RootState } from '../store';

const endPointUser = process.env.REACT_APP_END_POINT_USER as string;

export function useSolicitacaoFormViewModel(): ISolicitacaoFormViewModel {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const toast = useToast();
  const { createController } = useCoreService();
  const setorController = useHttpController('setor', endPointUser);

  // ── Redux state ─────────────────────────────────────────────────────────
  const form = useSelector((state: RootState) => state.solicitacaoDeServico.form);
  const globalState = useSelector((state: RootState) => state.global) ?? {};
  const companyId: string | undefined = (globalState as any).companyId ?? undefined;
  const userId: string | undefined = (globalState as any).userId ?? (globalState as any).id ?? undefined;
  const fullName: string | undefined = (globalState as any).fullName ?? undefined;

  // ── Local state ──────────────────────────────────────────────────────────
  const [emergencial, setEmergencial] = useState<string | null>(null);
  const [setores, setSetores] = useState<any[]>([]);
  const [disabled, setDisabled] = useState(false);

  // entityId dinâmico: quando editando usa form.id; na criação é setado após POST
  const [ssEntityId, setSsEntityId] = useState<string | number>(form?.id || '0');
  const entityIdRef = useRef(ssEntityId);
  entityIdRef.current = ssEntityId;

  // ── Anexo manager (core-sdk: signed URL → GCS, com fallback direto) ────
  const anexoManager = useAnexoManager({
    context: 'solicitacaoDeServico',
    entityId: ssEntityId,
  });

  // Pré-popula persistidos quando abrindo para edição
  const formAnexos = form?.anexos;
  const prePopulatedPersistidos = useMemo(() => {
    if (!Array.isArray(formAnexos) || !formAnexos.length) return null;
    return formAnexos.map((a: any, i: number) => ({
      id: a.id ?? `p-${i}`,
      nome: a.originalName || a.nome || a.name || `Anexo ${i + 1}`,
      tipo: a.contentType || a.tipo || a.type || '',
      tamanho: a.size || a.tamanho,
      url: a.signedUrl || a.url,
      key: a.key,
      createdAt: a.createdAt,
    }));
  }, [formAnexos]);

  // ── Load setores (multi-tenant: busca todos do tenant, sem filtrar por companyId) ──
  useEffect(() => {
    let mounted = true;
    setorController
      .get('all')
      .then((resp: any) => {
        const list = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
        const filtered = list.filter((i: any) => i?.nome);
        if (mounted) {
          if (filtered.length > 0) {
            setSetores(filtered);
          } else if (process.env.NODE_ENV !== 'production') {
            setSetores([
              { id: 1, nome: 'Manutenção Mecânica' },
              { id: 2, nome: 'Manutenção Elétrica' },
              { id: 3, nome: 'Operação' },
              { id: 4, nome: 'Utilidades' },
            ]);
          }
        }
      })
      .catch(() => {
        if (mounted && process.env.NODE_ENV !== 'production') {
          setSetores([
            { id: 1, nome: 'Manutenção Mecânica' },
            { id: 2, nome: 'Manutenção Elétrica' },
            { id: 3, nome: 'Operação' },
            { id: 4, nome: 'Utilidades' },
          ]);
        }
      });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(setDataAbertura(new Date().toISOString()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const recursos = form?.recursos || [];
    if (!recursos.length) {
      toast.warning('Selecione pelo menos um ativo/recurso.');
      return;
    }
    if (!form?.descricaoDoProblema?.trim()) {
      toast.warning('Descrição do problema é obrigatória.');
      return;
    }
    if (emergencial === null) {
      toast.warning('Informe se é emergencial.');
      return;
    }

    setDisabled(true);

    const isEmergencial = emergencial === 'Y';
    const status = isEmergencial ? 'APROVADO' : 'PENDENTE';
    const ssController = createController('solicitacaoDeServico');
    const rootController = createController('');

    try {
      // 1. Cria as solicitações (JSON puro)
      const results = await Promise.all(
        recursos.map((rec: any) => {
          const recursoId = rec.id ?? rec.recursoId;
          const payload: Record<string, any> = {
            descricaoDoProblema: form.descricaoDoProblema,
            dataDeAbertura: form.dataDeAbertura,
            setorDestino: form.setorDestino,
            status,
            recursoId,
            userId: form.userId || userId || '1',
            solicitante: form.solicitante || fullName || 'Dev Local',
          };

          return isEmergencial
            ? rootController.post('maquinaParada', payload)
            : ssController.post(undefined, payload);
        }),
      );

      toast.success('Solicitação salva com sucesso!');

      // 2. Se há anexos locais pendentes, faz upload via signed URL (GCS)
      const pendingFiles = anexoManager.locais.filter((a) => a.status === 'pending' || a.status === 'error');
      if (pendingFiles.length > 0) {
        const created = results.filter((r: any) => r?.id);
        if (created.length > 0) {
          const ssId = created[0].id;
          setSsEntityId(ssId);
          try {
            await anexoManager.uploadAll(ssId);
            toast.info('Anexo(s) enviado(s) com sucesso.');
          } catch {
            toast.warning('Falha ao enviar anexo(s). Tente novamente pela tela de edição.');
          }
        }
      }
      dispatch(clearSolicitacaoDeServicoForm());
      navigate(paths.solicitacoesDeServico);
    } catch (error) {
      toast.error(`Erro ao salvar: ${(error as any)?.message || 'falha inesperada'}`);
    } finally {
      setDisabled(false);
    }
  }, [form, emergencial, anexoManager, createController, dispatch, navigate, toast, userId, fullName]);

  const handleCancel = useCallback(() => {
    dispatch(clearSolicitacaoDeServicoForm());
    navigate(paths.solicitacoesDeServico);
  }, [dispatch, navigate]);

  const handleRemove = useCallback(() => {
    if (!form?.id) return;
    createController('solicitacaoDeServico')
      .delete(undefined, form.id)
      .then(() => toast.warning(`Solicitação ${form.id} removida.`))
      .catch(() => {});
    dispatch(clearSolicitacaoDeServicoForm());
    navigate(paths.solicitacoesDeServico);
  }, [form, createController, dispatch, navigate, toast]);

  // ── Field dispatchers ─────────────────────────────────────────────────────
  const dispatchSetRecursos = useCallback((list: any[]) => dispatch(setRecursos(list)), [dispatch]);
  const dispatchSetDataAbertura = useCallback((iso: string) => dispatch(setDataAbertura(iso)), [dispatch]);
  const dispatchSetDescricao = useCallback((texto: string) => dispatch(setDescricaoDoProblema(texto)), [dispatch]);
  const dispatchSetSetor = useCallback((nome: string) => dispatch(setSetorDestinoSolicitacao(nome)), [dispatch]);

  return {
    form,
    companyId,
    emergencial,
    setEmergencial,
    setores,
    disabled,
    anexos: {
      // Usa persistidos do hook (após upload), ou os dados que vieram do form (ao editar)
      persistidos: anexoManager.persistidos.length > 0
        ? anexoManager.persistidos
        : (prePopulatedPersistidos ?? []),
      locais: anexoManager.locais,
      addFiles: anexoManager.addFiles,
      removeLocal: anexoManager.removeLocal,
      removePersistido: async (anexoId: string | number) => {
        try {
          const ssCtrl = createController('solicitacaoDeServico');
          await ssCtrl.delete('anexo', anexoId);
        } catch {
          // fallback to generic delete
          await anexoManager.removePersistido(anexoId);
        }
      },
      getUrl: anexoManager.getUrl,
    },
    setRecursos: dispatchSetRecursos,
    setDataAbertura: dispatchSetDataAbertura,
    setDescricaoDoProblema: dispatchSetDescricao,
    setSetorDestino: dispatchSetSetor,
    handleSave,
    handleCancel,
    handleRemove,
  };
}
