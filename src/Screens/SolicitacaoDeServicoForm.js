import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Form, Spinner } from 'react-bootstrap';
import { useToast, RecursoDisplayer } from 'teraprox-core-sdk';
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
import { SectorSelector, UploadArea, ActionButtons } from 'teraprox-ui-kit';
import './solicitacaoDeServicoForm.css';

// ─── Recurso Picker ───────────────────────────────────────────────────────────
// ─── Main Form ────────────────────────────────────────────────────────────────
function SolicitacaoDeServicoForm({ form, remove, cancelar, dispatch, controller }) {
  const toast = useToast();
  const [disabled, setDisabled] = useState(false);
  const [emergencial, setEmergencial] = useState(null);
  const [anexo, setAnexo] = useState(null);
  const [setores, setSetores] = useState([]);
  const { companyId } = useSelector((state) => state.global ?? {});

  const recursos = form?.recursos || [];
  const anexosPersistidos = Array.isArray(form?.anexos) ? form.anexos : [];

  useEffect(() => {
    let mounted = true;
    if (companyId) {
      controller('user', endPointUser)
        .get(`findSetoresByCompanyId/${companyId}`, undefined, { "x-teraprox-host": "user" })
        .then((resp) => {
          let list = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
          if (mounted) setSetores(list.filter(i => i?.nome));
        }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [companyId, controller]);

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
        <SectorSelector
          setores={setores}
          defaultSectorName={form?.setorDestino}
          onSectorSelect={(setor) => dispatch(setSetorDestinoSolicitacao(setor.nome))}
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
          <UploadArea 
            onFilePut={setAnexo} 
            anexo={anexo} 
            accept={{ "image/jpeg": [], "image/png": [], "application/pdf": [] }}
          />
          {anexo && (
            <div style={{ marginTop: '8px' }}>
              <button type="button" className="sf-btn-delete" onClick={() => setAnexo(null)}>Remover foto</button>
            </div>
          )}
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
          <ActionButtons
            disabled={disabled}
            saveLabel={disabled ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar'}
            saveClick={handleSave}
            isEditing={!!form?.id}
            deleteConfirmMsg={`Deseja deletar a Solicitação ${form?.id}?`}
            deleteClick={remove}
            cancelEditClick={cancelar}
          />
        </div>
      </div>
    </div>
  );
}

export default withWebContext(SolicitacaoDeServicoForm);
