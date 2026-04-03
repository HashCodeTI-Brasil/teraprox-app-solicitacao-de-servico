import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Form, Spinner } from 'react-bootstrap';
import { useToast, RecursoDisplayer } from '@teraprox/core-sdk';
import { withWebContext } from '../Hocs/withWebContext';
import {
  clearSolicitacaoDeServicoForm,
  setDataAbertura,
  setDescricaoDoProblema,
  setRecursos,
  setSetorDestinoSolicitacao,
} from '../Reducers/solicitacaoDeServicoReducer';
import { endPointUser } from '../models/constantes';
import { formatIsoDate } from '../Services/stringUtils';
import './solicitacaoDeServicoForm.css';

// ─── Recurso Picker ───────────────────────────────────────────────────────────
// ─── Sector Selector ──────────────────────────────────────────────────────────
const setoresCacheByCompany = new Map();
const setoresRequestByCompany = new Map();

const extractSetorList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

function SetorSelector({ controller, selected, onSelect }) {
  const { companyId } = useSelector((state) => state.global ?? {});
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(controller);

  useEffect(() => {
    controllerRef.current = controller;
  }, [controller]);

  useEffect(() => {
    let mounted = true;

    const loadSetores = async () => {
      if (!companyId) {
        if (mounted) setSetores([]);
        return;
      }

      const cache = setoresCacheByCompany.get(companyId);
      if (cache) {
        if (mounted) setSetores(cache);
        return;
      }

      setLoading(true);
      try {
        let pending = setoresRequestByCompany.get(companyId);
        if (!pending) {
          pending = controllerRef.current('user', endPointUser)
            .get(`findSetoresByCompanyId/${companyId}`)
            .then((response) => {
              const list = extractSetorList(response).filter((item) => item?.nome);
              setoresCacheByCompany.set(companyId, list);
              return list;
            })
            .catch(() => [])
            .finally(() => {
              setoresRequestByCompany.delete(companyId);
            });
          setoresRequestByCompany.set(companyId, pending);
        }

        const list = await pending;
        if (mounted) setSetores(list);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSetores();
    return () => { mounted = false; };
  }, [companyId]);

  return (
    <div className="sf-field">
      <label className="sf-label">Setor responsável pela execução</label>
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Form.Select
          className="sf-select"
          value={selected || ''}
          onChange={e => onSelect(e.target.value)}
        >
          <option value="">— Selecione um setor —</option>
          {setores.map(s => (
            <option key={s.id || s._id || s.nome} value={s.nome}>
              {s.nome}
            </option>
          ))}
        </Form.Select>
      )}
    </div>
  );
}

// ─── Upload Area ──────────────────────────────────────────────────────────────
function UploadArea({ file, onSelect, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="sf-upload-area" onClick={() => !file && inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={e => onSelect(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="sf-upload-selected">
          <span className="sf-upload-name">📎 {file.name}</span>
          <button type="button" className="sf-chip-remove" onClick={e => { e.stopPropagation(); onRemove(); }}>×</button>
        </div>
      ) : (
        <div className="sf-upload-placeholder">
          <span className="sf-upload-icon">📷</span>
          <span>Clique para adicionar foto ou arquivo</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function SolicitacaoDeServicoForm({ form, remove, cancelar, dispatch, controller }) {
  const toast = useToast();
  const [disabled, setDisabled] = useState(false);
  const [emergencial, setEmergencial] = useState(null);
  const [anexo, setAnexo] = useState(null);

  const recursos = form?.recursos || [];
  const anexosPersistidos = Array.isArray(form?.anexos) ? form.anexos : [];

  useEffect(() => {
    dispatch(setDataAbertura(new Date().toISOString()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    if (!recursos.length) {
      toast.warning('Selecione pelo menos um ativo/recurso.');
      return false;
    }
    if (!form?.descricaoDoProblema?.trim()) {
      toast.warning('Descrição do problema é obrigatória.');
      return false;
    }
    if (emergencial === null) {
      toast.warning('Informe se é emergencial.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setDisabled(true);
    const status = emergencial === 'Y' ? 'APROVADO' : 'PENDENTE';
    const rota = emergencial === 'Y' ? 'maquinaParada' : '';
    try {
      const requests = recursos.map(({ id }) => {
        const payload = { ...form, status, recursoId: id };
        if (anexo instanceof File) {
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => {
            if (v !== null && v !== undefined) {
              fd.append(k, typeof v === 'object' && !(v instanceof File) ? JSON.stringify(v) : v);
            }
          });
          fd.set('anexo', anexo);
          return controller('solicitacaoDeServico').post(rota, fd, { 'Content-Type': 'multipart/form-data' });
        }
        return controller('solicitacaoDeServico').post(rota, payload);
      });
      await Promise.all(requests);
      toast.success('Solicitação salva com sucesso!');
      dispatch(clearSolicitacaoDeServicoForm());
      setAnexo(null);
      cancelar();
    } catch (error) {
      toast.error(`Erro ao salvar: ${error?.message || 'falha inesperada'}`);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className="sf-wrapper">
      <div className="sf-header">
        <h5 className="sf-title">{form?.id ? `Solicitação #${form.id}` : 'Nova Solicitação de Serviço'}</h5>
      </div>

      <div className="sf-body">
        {/* Recursos */}
        <div className="sf-field">
          <label className="sf-label">Ativo / Recurso <span className="sf-required">*</span></label>
          <RecursoDisplayer
            selectedList={recursos}
            onSaveRecurso={(list) => dispatch(setRecursos(list))}
          />
          {recursos.length > 0 && (
            <div className="sf-recurso-chips">
              {recursos.map(r => (
                <span key={r.id} className="sf-chip">
                  {r.nome || r.name || r.descricao}
                  <button
                    type="button"
                    className="sf-chip-remove"
                    onClick={() => dispatch(setRecursos(recursos.filter(x => x.id !== r.id)))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Data */}
        <div className="sf-field">
          <label className="sf-label">Data de abertura</label>
          <input
            type="datetime-local"
            className="sf-input"
            value={formatIsoDate(form?.dataDeAbertura)}
            onChange={e => dispatch(setDataAbertura(new Date(e.target.value).toISOString()))}
          />
        </div>

        {/* Setor */}
        <SetorSelector
          controller={controller}
          selected={form?.setorDestino}
          onSelect={(nome) => dispatch(setSetorDestinoSolicitacao(nome))}
        />

        {/* Descrição */}
        <div className="sf-field">
          <label className="sf-label">Descrição do problema <span className="sf-required">*</span></label>
          <textarea
            className="sf-textarea"
            rows={4}
            placeholder="Descreva o problema observado..."
            value={form?.descricaoDoProblema || ''}
            onChange={e => dispatch(setDescricaoDoProblema(e.target.value))}
          />
        </div>

        {/* Emergencial */}
        <div className="sf-field">
          <label className="sf-label">
            <strong>Solicitação emergencial?</strong>
          </label>
          <div className="sf-hint">Ex: máquina parada, linha parada</div>
          <div className="sf-radio-group">
            <Form.Check
              type="radio"
              id="emergencial-sim"
              label="Sim"
              checked={emergencial === 'Y'}
              onChange={() => setEmergencial('Y')}
            />
            <Form.Check
              type="radio"
              id="emergencial-nao"
              label="Não"
              checked={emergencial === 'N'}
              onChange={() => setEmergencial('N')}
            />
          </div>
        </div>

        {/* Upload */}
        <div className="sf-field">
          <label className="sf-label">Foto / Anexo</label>
          <UploadArea file={anexo} onSelect={setAnexo} onRemove={() => setAnexo(null)} />
        </div>

        {/* Anexos persistidos */}
        {anexosPersistidos.length > 0 && (
          <div className="sf-field">
            <label className="sf-label">Anexos já enviados</label>
            <div className="sf-attach-list">
              {anexosPersistidos.map((a, i) => (
                <a key={i} href={a.url || a} target="_blank" rel="noopener noreferrer" className="sf-attach-link">
                  📎 Anexo {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="sf-buttons">
          <button className="sf-btn-cancel" type="button" onClick={cancelar} disabled={disabled}>
            Cancelar
          </button>

          {form?.id && (
            <button
              className="sf-btn-delete"
              type="button"
              onClick={() => {
                if (window.confirm(`Deseja deletar a Solicitação ${form.id}?`)) remove();
              }}
              disabled={disabled}
            >
              Excluir
            </button>
          )}

          <button className="sf-btn-save" type="button" onClick={handleSave} disabled={disabled}>
            {disabled ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default withWebContext(SolicitacaoDeServicoForm);
