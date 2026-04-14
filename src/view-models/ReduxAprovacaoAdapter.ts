import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCoreService, useToast, useAnexoManager } from 'teraprox-core-sdk';
import type { Sector } from 'teraprox-ui-kit';
import { IAprovacaoViewModel, AprovacaoFormState } from './IAprovacaoViewModel';
import { setDescricaoJustificativa } from '../Reducers/justificativaReducer';
import {
  setDataDePlanejamento,
  setStatus,
  setTipoOsSolicitacao,
  setSolicitacaoMantenedor,
} from '../Reducers/solicitacaoDeServicoReducer';
import {
  setAddTarefa,
  setAddTarefas,
  setUpdateTarefaFromList,
} from '../Reducers/tarefaReducer';
import { paths } from '../models/constantes';
import useNavigator from '../hooks/useNavigator';
import type { RootState } from '../store';
import type { StatusSolicitacao } from 'teraprox-core-sdk';

export function useAprovacaoViewModel(): IAprovacaoViewModel {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const toast = useToast();
  const { createController } = useCoreService();

  // ── Redux state ───────────────────────────────────────────────────────────
  const form = useSelector((state: RootState) => state.solicitacaoDeServico.form);
  const tarefas = useSelector((state: RootState) => state.tarefa.tarefas);
  const justificativa = useSelector((state: RootState) => state.justificativa.form);

  const contextController = useMemo(() => createController('solicitacaoDeServico'), [createController]);

  // ── Anexo manager — upload/download de anexos da SS em aprovação ──────────
  const anexoManager = useAnexoManager({
    entityId: form?.id ?? '0',
    context: 'solicitacaoDeServico',
    port: 'anexo',
  });

  // Track locally removed anexo IDs (for instant UI update before RTDB propagates)
  const [removedAnexoIds, setRemovedAnexoIds] = useState<Set<string | number>>(new Set());

  // Remove via dedicated endpoint with sentinel → emits RTDB matching object
  const removeAnexoPersistido = useCallback(async (anexoId: string | number) => {
    try {
      await contextController.delete('anexo', anexoId);
      setRemovedAnexoIds(prev => new Set(prev).add(anexoId));
    } catch (err) {
      console.error('[AprovacaoAdapter] Erro ao remover anexo:', err);
      toast.warning('Erro ao remover anexo');
    }
  }, [contextController, toast]);

  // ── Local state ───────────────────────────────────────────────────────────
  const [formState, setFormState] = useState<AprovacaoFormState>({
    status: form?.status || '',
    showDateField: false,
    showSectorChange: false,
    showReprovationReason: false,
  });
  const [setores, setSetores] = useState<Sector[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anexosSolicitacao, setAnexosSolicitacao] = useState<any[]>(
    Array.isArray(form?.anexos) ? form.anexos : []
  );
  const [carregandoAnexos, setCarregandoAnexos] = useState(false);
  const [buscaAnexosRealizada, setBuscaAnexosRealizada] = useState(false);

  // ── Load setores ──────────────────────────────────────────────────────────
  // A API user expõe GET /setor/all (não segue o padrão OnRoad de GET /:context = readAll).
  // Usando path explícito para funcionar tanto via gateway quanto standalone.
  // TODO: normalizar API user para que GET /setor = readAll
  useEffect(() => {
    let mounted = true;
    createController('setor').readAll('all')
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        if (mounted && list.length > 0) {
          setSetores(list);
        }
      })
      .catch(() => {
        if (mounted) {
          setSetores([
            { id: 1, nome: 'Manutenção Mecânica' },
            { id: 2, nome: 'Manutenção Elétrica' },
            { id: 3, nome: 'Operação' },
            { id: 4, nome: 'Utilidades' },
          ]);
        }
      });
    return () => { mounted = false; };
  }, [createController]);

  // ── Sync form status changes ──────────────────────────────────────────────
  useEffect(() => {
    if (form?.status && form.status !== formState.status) {
      setFormState((prev) => ({
        ...prev,
        status: form.status,
        showReprovationReason: form.status === 'REPROVADO',
      }));
    }
  }, [form?.status, formState.status]);

  useEffect(() => {
    setAnexosSolicitacao(Array.isArray(form?.anexos) ? form.anexos : []);
  }, [form?.anexos]);

  useEffect(() => {
    setBuscaAnexosRealizada(false);
  }, [form?.id]);

  // ── Lazy-load attachments ─────────────────────────────────────────────────
  useEffect(() => {
    if (!form?.id || buscaAnexosRealizada || (Array.isArray(form?.anexos) && form.anexos.length)) return;
    setCarregandoAnexos(true);
    contextController.read(undefined, form.id)
      .then((result: any) => {
        setAnexosSolicitacao(Array.isArray(result?.anexos) ? result.anexos : []);
      })
      .catch(() => setAnexosSolicitacao([]))
      .finally(() => {
        setCarregandoAnexos(false);
        setBuscaAnexosRealizada(true);
      });
  }, [buscaAnexosRealizada, contextController, form?.anexos, form?.id]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const isApproved = useMemo(() => formState.status === 'APROVADO', [formState.status]);
  const isRejected = useMemo(() => formState.status === 'REPROVADO', [formState.status]);
  const hasStatus  = useMemo(() => Boolean(formState.status), [formState.status]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (isApproved) {
      if (!form?.osTipos?.length) errors.push('Defina o tipo da ordem');
      if (!hasStatus) errors.push('Status da solicitação é obrigatório');
    }
    if (isRejected && (!justificativa?.descricao || justificativa.descricao.length < 1)) {
      errors.push('Motivo da reprovação é obrigatório');
    }
    return errors;
  }, [isApproved, isRejected, hasStatus, form, justificativa]);

  // ── UI state handlers ─────────────────────────────────────────────────────
  const handleStatusChange = useCallback((status: string) => {
    setFormState((prev) => ({
      ...prev,
      status,
      showReprovationReason: status === 'REPROVADO',
      showDateField: prev.showDateField && status === 'APROVADO',
      showSectorChange: prev.showSectorChange && status !== 'REPROVADO',
    }));
    dispatch(setStatus(status as StatusSolicitacao));
  }, [dispatch]);

  const handleSectorChange = useCallback((enabled: boolean) => {
    setFormState((prev) => ({ ...prev, showSectorChange: enabled }));
  }, []);

  const handleSectorSelect = useCallback((setor: Sector) => {
    setFormState((prev) => ({ ...prev, showSectorChange: setor.nome }));
  }, []);

  const handleDateFieldToggle = useCallback((enabled: boolean) => {
    setFormState((prev) => ({ ...prev, showDateField: enabled }));
    if (!enabled) dispatch(setDataDePlanejamento(undefined));
  }, [dispatch]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (descricaoProblema: string) => {
    if (!formState.showSectorChange && !isRejected) {
      if (validationErrors.length > 0) {
        validationErrors.forEach((e) => toast.warning(e));
        return;
      }
    }
    setIsSubmitting(true);
    try {
      if (formState.showSectorChange && typeof formState.showSectorChange !== 'boolean') {
        await contextController.save(undefined, { id: form.id, setorDestino: formState.showSectorChange });
        toast.success('Setor alterado com sucesso!');
      } else if (isApproved) {
        const formCopy = { ...form, tarefas, id: null, descricaoDoProblema: descricaoProblema };
        await contextController.post(`aprovaSolicitacao/${form.id}`, formCopy);
        toast.success('Solicitação aprovada com sucesso!');
      } else if (isRejected) {
        await contextController.post(`reprovaSolicitacao/${form.id}`, {
          ...form,
          descricaoDoProblema: descricaoProblema,
          justificativa: { ...justificativa, userId: form.userId },
        });
        toast.success('Solicitação reprovada com sucesso!');
      }
      setTimeout(() => navigate(paths.solicitacoesDeServico), 1000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Erro ao processar solicitação: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [validationErrors, formState, isApproved, isRejected, form, tarefas, justificativa, contextController, navigate, toast]);

  const handleCancel = useCallback(() => {
    navigate(paths.solicitacoesDeServico);
  }, [navigate]);

  // ── Redux field dispatchers ───────────────────────────────────────────────
  const dispatchSetDataPlanejada = useCallback((iso: string | undefined) => dispatch(setDataDePlanejamento(iso)), [dispatch]);
  const dispatchSetTipoOs = useCallback((tipo: any) => dispatch(setTipoOsSolicitacao([tipo])), [dispatch]);
  const dispatchSetDescricaoJustificativa = useCallback((v: string) => dispatch(setDescricaoJustificativa(v)), [dispatch]);
  const dispatchSetMantenedor = useCallback((m: any) => dispatch(setSolicitacaoMantenedor(m)), [dispatch]);
  const dispatchClearMantenedor = useCallback(() => dispatch(setSolicitacaoMantenedor(null)), [dispatch]);
  const dispatchAddTarefa = useCallback((t: any) => dispatch(setAddTarefa(t)), [dispatch]);
  const dispatchUpdateTarefa = useCallback((t: any) => dispatch(setUpdateTarefaFromList(t)), [dispatch]);
  const dispatchAddTarefas = useCallback((ts: any[]) => dispatch(setAddTarefas(ts)), [dispatch]);

  // Converte anexos carregados da API para o formato AnexoPersistido
  const prePopulatedPersistidos = useMemo(() => {
    if (!Array.isArray(anexosSolicitacao) || !anexosSolicitacao.length) return [];
    return anexosSolicitacao.map((a: any, i: number) => ({
      id: a.id ?? `p-${i}`,
      nome: a.originalName || a.nome || a.name || `Anexo ${i + 1}`,
      tipo: a.contentType || a.tipo || a.type || '',
      tamanho: a.size || a.tamanho,
      url: a.signedUrl || a.url,
      key: a.key,
      createdAt: a.createdAt,
    }));
  }, [anexosSolicitacao]);

  // Combina: novos uploads (anexoManager) + pré-existentes (API), filtra removidos
  const anexosPersistidos = (anexoManager.persistidos.length > 0
    ? anexoManager.persistidos
    : prePopulatedPersistidos
  ).filter((a: any) => !removedAnexoIds.has(a.id));

  return {
    form,
    tarefas,
    justificativa,
    isApproved,
    isRejected,
    hasStatus,
    validationErrors,
    formState,
    setores,
    isSubmitting,
    initialDescricao: form?.descricaoDoProblema || '',
    anexosPersistidos,
    anexosLocais: anexoManager.locais,
    carregandoAnexos,
    onAddAnexos: anexoManager.addFiles,
    onRemoveAnexoLocal: anexoManager.removeLocal,
    onRemoveAnexoPersistido: removeAnexoPersistido,
    getAnexoUrl: anexoManager.getUrl,
    dispatchSetDataPlanejada,
    dispatchSetTipoOs,
    dispatchSetDescricaoJustificativa,
    dispatchAddTarefa,
    dispatchUpdateTarefa,
    dispatchAddTarefas,
    dispatchSetMantenedor,
    dispatchClearMantenedor,
    handleStatusChange,
    handleSectorChange,
    handleSectorSelect,
    handleDateFieldToggle,
    handleSubmit,
    handleCancel,
  };
}
