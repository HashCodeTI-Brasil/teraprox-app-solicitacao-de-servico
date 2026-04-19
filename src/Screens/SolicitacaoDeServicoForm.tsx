import { Form } from 'react-bootstrap';
import { SectorSelector, ActionButtons, AnexoManager } from 'teraprox-ui-kit';
import { RecursoDisplayer } from '@teraprox/ui-kit-sgm';
import { formatIsoDate } from '../Services/stringUtils';
import { useSolicitacaoFormViewModel } from '../view-models/ReduxSolicitacaoFormAdapter';
import useArvoreControllers from '../hooks/useArvoreControllers';
import './solicitacaoDeServicoForm.css';

function SolicitacaoDeServicoForm() {
  const vm = useSolicitacaoFormViewModel();
  const { form, anexos } = vm;
  const recursos = form?.recursos || [];
  const arvoreControllers = useArvoreControllers();

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
            onSaveRecurso={(list) => vm.setRecursos(list)}
            {...arvoreControllers}
          />
          {recursos.length > 0 && (
            <div className="sf-recurso-chips">
              {recursos.map((r: any) => (
                <span key={r.id} className="sf-chip">
                  {r.nome || r.name || r.descricao}
                  <button
                    type="button"
                    className="sf-chip-remove"
                    onClick={() => vm.setRecursos(recursos.filter((x: any) => x.id !== r.id))}
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
            onChange={(e) => vm.setDataAbertura(new Date(e.target.value).toISOString())}
          />
        </div>

        {/* Setor */}
        <div className="sf-field">
          <label className="sf-label">Setor destino</label>
          <SectorSelector
            setores={vm.setores}
            defaultSectorName={form?.setorDestino}
            onSectorSelect={(setor) => vm.setSetorDestino(setor.nome)}
            selectionLabel=""
            selectionPlaceholder="Selecione o setor..."
          />
        </div>

        {/* Descrição */}
        <div className="sf-field">
          <label className="sf-label">Descrição do problema <span className="sf-required">*</span></label>
          <textarea
            className="sf-textarea"
            rows={4}
            placeholder="Descreva o problema observado..."
            value={form?.descricaoDoProblema || ''}
            onChange={(e) => vm.setDescricaoDoProblema(e.target.value)}
          />
        </div>

        {/* Emergencial */}
        <div className="sf-field">
          <label className="sf-label"><strong>Solicitação emergencial?</strong></label>
          <div className="sf-hint">Ex: máquina parada, linha parada</div>
          <div className="sf-radio-group">
            <Form.Check
              type="radio"
              id="emergencial-sim"
              label="Sim"
              checked={vm.emergencial === 'Y'}
              onChange={() => vm.setEmergencial('Y')}
            />
            <Form.Check
              type="radio"
              id="emergencial-nao"
              label="Não"
              checked={vm.emergencial === 'N'}
              onChange={() => vm.setEmergencial('N')}
            />
          </div>
        </div>

        {/* Anexos — gerenciado pelo useAnexoManager (signed URL / GCS) */}
        <div className="sf-field">
          <label className="sf-label">Anexos</label>
          <AnexoManager
            persistidos={anexos.persistidos.map((a: any, i: number) => ({
              id: a.id || `p-${i}`,
              nome: a.nome || a.name || `Anexo ${i + 1}`,
              tipo: a.tipo || a.type || a.contentType || '',
              tamanho: a.tamanho || a.size,
              url: a.url || a.signedUrl,
              createdAt: a.createdAt,
            }))}
            locais={anexos.locais}
            onAddFiles={anexos.addFiles}
            onRemoveLocal={anexos.removeLocal}
            onRemovePersistido={anexos.removePersistido}
            onDownload={async (anexo) => {
              const url = (anexo as any).url || await anexos.getUrl((anexo as any).id);
              if (url) window.open(url, '_blank');
            }}
            maxFiles={5}
          />
        </div>

        {/* Buttons */}
        <div className="sf-buttons">
          <ActionButtons
            disabled={vm.disabled}
            saveLabel={vm.disabled ? 'Salvando...' : 'Salvar'}
            onSave={vm.handleSave}
            isEditing={!!form?.id}
            deleteConfirmMsg={`Deseja deletar a Solicitação ${form?.id}?`}
            onDelete={vm.handleRemove}
            onCancelEdit={vm.handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default SolicitacaoDeServicoForm;
