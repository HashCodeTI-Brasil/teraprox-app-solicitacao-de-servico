/**
 * SolicitacaoDeServicoView — tela read-only de SS, acessada via /solicitacao/:id.
 *
 * Usada como destino quando o usuário clica no chip "SS #X" do card de
 * Ordem de Serviço (em /os/planejamento, SGM-OS). Não toca o estado da
 * tela de listagem (não dispara dispatch para o reducer de form), só
 * busca a SS pelo id e exibe os campos sem permitir edição.
 *
 * Endpoint: GET /solicitacaoDeServico/:id (read default do AbstractController).
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPaperclip } from 'react-icons/fi';
import { useCoreService } from 'teraprox-core-sdk';
import { formatDate } from '../Services/stringUtils';
import { getStatusColor } from '../models/constantes';
import './solicitacaoDeServicoForm.css';

interface SolicitacaoView {
  id: number | string;
  dataDeAbertura?: string;
  descricaoDoProblema?: string;
  status?: string;
  setor?: string;
  setorDestino?: string;
  father?: string;
  solicitante?: string;
  aprovador?: string;
  aprovadorUserId?: number;
  createdAt?: string;
  updatedAt?: string;
  recurso?: { id?: number; nome?: string };
  justificativa?: string | null;
  anexos?: Array<{
    id?: number | string;
    originalName?: string;
    nome?: string;
    contentType?: string;
    size?: number;
    signedUrl?: string;
    url?: string;
    key?: string;
    createdAt?: string;
  }> | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sf-field">
      <label className="sf-label">{label}</label>
      <div className="sf-readonly-value">{children}</div>
    </div>
  );
}

function SolicitacaoDeServicoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createController } = useCoreService();
  const [solicitacao, setSolicitacao] = useState<SolicitacaoView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da solicitação não informado.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    createController('solicitacaoDeServico')
      .get(String(id))
      .then((data: any) => {
        if (cancelled) return;
        if (!data || !data.id) {
          setError(`Solicitação #${id} não encontrada.`);
          setSolicitacao(null);
        } else {
          setSolicitacao(data as SolicitacaoView);
        }
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'Falha ao carregar a solicitação.');
        setSolicitacao(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, createController]);

  const cor = getStatusColor(solicitacao?.status);
  const recursoNome = solicitacao?.recurso?.nome || '—';
  const recursoFather = solicitacao?.father && solicitacao.father !== '-' ? solicitacao.father : '';
  const recursoLabel = recursoFather ? `${recursoFather} › ${recursoNome}` : recursoNome;

  return (
    <div className="sf-wrapper">
      <div className="sf-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="ss-icon-btn"
          onClick={() => navigate(-1)}
          title="Voltar"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <FiArrowLeft size={20} />
        </button>
        <h5 className="sf-title" style={{ margin: 0 }}>
          {solicitacao?.id ? `Solicitação #${solicitacao.id}` : 'Solicitação de Serviço'}
        </h5>
        {solicitacao?.status && (
          <span
            className="ss-status-badge"
            style={{
              color: cor,
              borderColor: `${cor}60`,
              backgroundColor: `${cor}18`,
              marginLeft: 'auto',
            }}
          >
            {solicitacao.status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="sf-body">
        {loading && (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
            Carregando solicitação…
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: 16, color: '#b91c1c', background: '#fee2e2', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {!loading && !error && solicitacao && (
          <>
            <Field label="Ativo / Recurso">{recursoLabel}</Field>
            <Field label="Data de abertura">{formatDate(solicitacao.dataDeAbertura)}</Field>
            <Field label="Setor de origem → destino">
              {(solicitacao.setor || '—')}
              {' → '}
              {(solicitacao.setorDestino || '—')}
            </Field>
            <Field label="Solicitante">{solicitacao.solicitante || '—'}</Field>
            <Field label="Descrição do problema">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {solicitacao.descricaoDoProblema || '—'}
              </div>
            </Field>

            {solicitacao.aprovador && (
              <Field label="Aprovador">{solicitacao.aprovador}</Field>
            )}

            {solicitacao.justificativa && (
              <Field label="Motivo da reprovação">{solicitacao.justificativa}</Field>
            )}

            {Array.isArray(solicitacao.anexos) && solicitacao.anexos.length > 0 && (
              <div className="sf-field">
                <label className="sf-label">Anexos</label>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {solicitacao.anexos.map((a, i) => {
                    const url = a.signedUrl || a.url;
                    const name = a.originalName || a.nome || `Anexo ${i + 1}`;
                    return (
                      <li key={a.id ?? `anexo-${i}`}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1e40af' }}
                          >
                            <FiPaperclip size={14} />
                            {name}
                          </a>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                            <FiPaperclip size={14} /> {name}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SolicitacaoDeServicoView;
