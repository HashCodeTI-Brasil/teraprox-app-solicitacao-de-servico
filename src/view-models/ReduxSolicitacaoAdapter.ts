import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCoreService, useToast, SolicitacaoDeServico } from 'teraprox-core-sdk';
import { ISolicitacaoViewModel } from './ISolicitacaoViewModel';
import {
  setSolicitacoes,
  setSolicitante,
  setSetorSolicitacao,
  updateSingleSsRow,
} from '../Reducers/solicitacaoDeServicoReducer';
import { paths, getPeriodRange } from '../models/constantes';
import useNavigator from '../hooks/useNavigator';
import type { RootState } from '../store';

export function useSolicitacaoViewModel(): ISolicitacaoViewModel {
  const dispatch = useDispatch();
  const navigate = useNavigator();
  const toast = useToast();
  const { createController, subscribe, unsubscribe } = useCoreService();

  // ── Redux state ──────────────────────────────────────────────────────────
  const solicitacoes = useSelector((state: RootState) => state.solicitacaoDeServico?.solicitacoes ?? []);
  const globalState = useSelector((state: RootState) => state.global) ?? {};
  const userId: string  = globalState.userId  ?? '';
  const fullName: string = globalState.fullName ?? '';
  const setor: string   = globalState.setor   ?? '';

  // ── Local adapter state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    () => dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [endDate, setEndDate] = useState(
    () => dayjs().format('YYYY-MM-DDTHH:mm')
  );

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchSolicitacoes = useCallback(async () => {
    const inicio = dayjs(startDate);
    const dataFimMod = dayjs(endDate).add(5, 'minute');
    setLoading(true);
    try {
      const data = await createController('solicitacaoDeServico').get(
        `findBetweenDates/${inicio.format('YYYY-MM-DDTHH:mm')}/${dataFimMod.toISOString()}`
      );
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => {
        if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1;
        if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1;
        return new Date(b.dataDeAbertura).getTime() - new Date(a.dataDeAbertura).getTime();
      });
      dispatch(setSolicitacoes(sorted));
    } catch {
      toast.error('Erro ao carregar solicitações.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, createController, dispatch, toast]);

  const subscribeRealtime = useCallback(() => {
    const refresher = (payload: any) => {
      createController('solicitacaoDeServico')
        .read(undefined, payload)
        .then((ss: any) => { if (ss) dispatch(updateSingleSsRow(ss)); })
        .catch(() => {});
    };
    const mo = { context: 'solicitacaoDeServico', location: '*', refresher };
    subscribe(mo);
    return () => unsubscribe(mo);
  }, [createController, subscribe, unsubscribe, dispatch]);

  // ── Date range helpers ───────────────────────────────────────────────────
  const setPeriod = useCallback((period: string) => {
    const { inicio, fim } = getPeriodRange(period);
    setStartDate(inicio.format('YYYY-MM-DDTHH:mm'));
    setEndDate(fim.format('YYYY-MM-DDTHH:mm'));
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────
  const handleNovaClick = useCallback(async () => {
    const recursos = await createController('recurso').readAll().catch(() => []);
    if (!Array.isArray(recursos) || recursos.length === 0) {
      toast.warning('Sua empresa não possui recursos cadastrados. Contate um administrador!');
      return;
    }
    dispatch(setSolicitante({ userId, fullName }));
    dispatch(setSetorSolicitacao(setor));
    navigate(paths.solicitacaoDeServicoForm);
  }, [createController, dispatch, navigate, toast, userId, fullName, setor]);

  const normalizeAndDispatch = useCallback((ss: any) => {
    const recurso = ss.recurso ?? null;
    const recursos = Array.isArray(ss.recursos) && ss.recursos.length > 0
      ? ss.recursos
      : recurso ? [recurso] : [];
    dispatch({
      type: 'solicitacaoDeServicoReducer/populateToEdit',
      payload: { ...ss, recursos },
    });
  }, [dispatch]);

  const handleCardClick = useCallback((ss: any) => {
    normalizeAndDispatch(ss);
    navigate(paths.solicitacaoDeServicoForm);
  }, [normalizeAndDispatch, navigate]);

  const handleAprovarClick = useCallback((ss: any) => {
    normalizeAndDispatch(ss);
    navigate(paths.aprovaStatus);
  }, [normalizeAndDispatch, navigate]);

  return {
    solicitacoes,
    loading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setPeriod,
    fetchSolicitacoes,
    subscribeRealtime,
    handleNovaClick,
    handleCardClick,
    handleAprovarClick,
    userId,
    fullName,
    setor,
  };
}
