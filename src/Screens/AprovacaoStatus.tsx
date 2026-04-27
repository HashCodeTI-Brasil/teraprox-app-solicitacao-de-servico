/**
 * AprovacaoStatus — Migrado do SGM (monolito) para teraprox-app-SGM-SS.
 * Refatorado para o padrão ViewModel (Hexagonal): toda lógica Redux/API encapsulada
 * em useAprovacaoViewModel(). Este componente gerencia apenas estado de UI puro.
 */
import React, { useEffect, useRef, useState } from "react"
import {
  FaCheck,
  FaClock,
  FaCog,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa"
import { useCoreService } from "teraprox-core-sdk"
import { ActionButtons, AnexoManager, AutoComplete, FormField, SectorSelector, TextWithMore, type Sector, type AnexoPersistedItem } from "teraprox-ui-kit"
import { formatIsoDate } from "../Services/stringUtils"
import { useAprovacaoViewModel } from "../view-models/ReduxAprovacaoAdapter"
import { paths } from "../models/constantes"
import useNavigator from "../hooks/useNavigator"
import "./AprovacaoStatus.css"

// ─── Componentes Inline (sem dependência do monolito) ────────────────────────
function MantenedorPicker({
  selected,
  onSelect,
  onClear,
}: {
  selected?: any
  onSelect: (m: any) => void
  onClear: () => void
}) {
  const { createController } = useCoreService()
  const [lista, setLista] = useState<any[]>([])

  useEffect(() => {
    createController("mantenedor")
      .get("mantenedorDashboard")
      .then((data: any) => setLista(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [createController])

  const getLabel = (m: any) => m?.nomeUsuario || m?.nome || String(m?.userId ?? "")
  const options = lista.map(getLabel)
  const currentLabel = selected ? getLabel(selected) : ""

  return (
    <div>
      <AutoComplete
        title="Mantenedor Responsável"
        loadCondition={true}
        ops={options}
        value={currentLabel}
        onSelectedClick={(val: string) => {
          const found = lista.find((m: any) => getLabel(m) === val)
          if (found) onSelect(found)
        }}
      />
      {selected && (
        <div className="d-flex align-items-center gap-2 mt-2">
          <span className="badge bg-secondary d-flex align-items-center gap-1">
            {getLabel(selected)}
            <FaTimes
              size={10}
              style={{ cursor: "pointer", marginLeft: 4 }}
              onClick={onClear}
              title="Remover mantenedor"
            />
          </span>
        </div>
      )}
      {lista.length === 0 && options.length === 0 && (
        <small className="text-muted">Carregando mantenedores...</small>
      )}
    </div>
  )
}

function TipoDeOrdemSelector({ onSelect, selectedValue }: { onSelect: (tipo: any) => void; selectedValue?: any }) {
  const { createController } = useCoreService()
  const [tipos, setTipos] = useState<any[]>([])

  useEffect(() => {
    createController("tipoDeOrdem").readAll()
      .then((data: any) => setTipos(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [createController])

  const getLabel = (t: any) => t?.tipo || t?.descricao || t?.nome || ""
  const options = tipos.map(getLabel)
  const currentLabel = getLabel(selectedValue?.[0]) || ""

  return (
    <AutoComplete
      title="Tipo de Ordem"
      loadCondition={true}
      ops={options}
      value={currentLabel}
      onSelectedClick={(val: string) => {
        const found = tipos.find((t: any) => getLabel(t) === val)
        if (found) onSelect(found)
      }}
    />
  )
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
const AprovacaoStatus = () => {
  const vm = useAprovacaoViewModel()
  const navigate = useNavigator()
  const { form, formState, isApproved, isRejected, hasStatus } = vm

  // Estado local — não passa pelo ViewModel para evitar re-renders em cada keystroke
  const [descricao, setDescricao] = useState(vm.initialDescricao)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const elementRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ── Sub-componentes internos ─────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { variant: string; icon: React.ElementType; text: string }> = {
      APROVADO: { variant: "success", icon: FaCheck, text: "Aprovado" },
      REPROVADO: { variant: "danger",  icon: FaTimes,  text: "Reprovado" },
      PENDENTE:  { variant: "warning", icon: FaClock,  text: "Pendente"  },
    }
    const { variant, icon: Icon, text } = config[status] || config.PENDENTE
    return (
      <span className={`status-badge badge bg-${variant} d-flex align-items-center gap-2`}>
        <Icon size={14} />
        {text}
      </span>
    )
  }

  const ValidationAlert = ({ errors }: { errors: string[] }) => {
    if (!errors.length) return null
    return (
      <div className="alert alert-warning fade-in" role="alert">
        <div className="d-flex align-items-start gap-2">
          <FaExclamationTriangle className="mt-1" />
          <div>
            <strong>Atenção - Corrija os seguintes itens:</strong>
            <ul className="mb-0 mt-2">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4 aprovacao-status-container">
      <div className="row g-4">
        <div className="col-lg-8">
          {/* Card Principal */}
          <div
            id="aprovacao-card-status"
            ref={(el: HTMLDivElement | null) => { elementRefs.current["status"] = el }}
            className="card mb-4 status-card fade-in"
          >
            <div className="card-header card-header-primary text-white">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaCog /> Aprovação de Solicitação
                {hasStatus && <StatusBadge status={formState.status} />}
              </h5>
            </div>
            <div className="card-body">
              {submitAttempted && !(formState.showSectorChange || isRejected) && <ValidationAlert errors={vm.validationErrors} />}

              {/* Seleção de Status */}
              <div className="row mb-3">
                <div className={`col-md-6${formState.showSectorChange ? " d-none" : ""}`}>
                  <AutoComplete
                    onSelectedClick={vm.handleStatusChange}
                    loadCondition={true}
                    title="Status da Solicitação"
                    ops={["APROVADO", "REPROVADO"]}
                    value={formState.status}
                  />
                </div>
                {formState.showSectorChange && (
                  <div className="col-md-6">
                    <SectorSelector
                      setores={vm.setores}
                      onSectorSelect={(setor: Sector) => vm.handleSectorSelect(setor)}
                    />
                  </div>
                )}
              </div>

              {/* Opções Adicionais */}
              {!isRejected && (
                <div className="row mb-3">
                  <div className={`col-md-4${formState.showSectorChange ? " d-none" : ""}`}>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="aprovacao-switch-data"
                        checked={formState.showDateField}
                        onChange={(e) => vm.handleDateFieldToggle(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="aprovacao-switch-data">
                        Definir Data Planejada
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="aprovacao-switch-setor"
                        checked={!!formState.showSectorChange}
                        onChange={(e) => vm.handleSectorChange(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="aprovacao-switch-setor">
                        Alterar Setor Responsável
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Campo de Data Planejada */}
              {formState.showDateField && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormField
                      ty="datetime-local"
                      label="Data Planejada"
                      onValueUpdate={(v) => vm.dispatchSetDataPlanejada(v ? new Date(v).toISOString() : undefined)}
                      val={formatIsoDate(form.dataPlanejada) ?? undefined}
                    />
                  </div>
                </div>
              )}

              {/* Motivo da Reprovação */}
              {isRejected && (
                <div className="row mb-3">
                  <div className="col">
                    <FormField
                      val={vm.justificativa?.descricao}
                      asTextArea
                      label="Motivo da Reprovação"
                      onValueUpdate={(v) => vm.dispatchSetDescricaoJustificativa(v)}
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Configuração OS (só quando Aprovado) */}
          {!formState.showSectorChange && isApproved && (
            <div className="card mb-4 status-card fade-in">
              <div className="card-header"><h6 className="mb-0">Configuração da Ordem de Serviço</h6></div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col">
                    <FormField
                      asTextArea
                      label="Descrição do problema"
                      rows={4}
                      val={descricao}
                      onValueUpdate={setDescricao}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <TipoDeOrdemSelector
                      onSelect={(tipo: any) => vm.dispatchSetTipoOs(tipo)}
                      selectedValue={form?.osTipos}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <MantenedorPicker
                      selected={form?.osMantenedor ?? form?.mantenedores?.[0]}
                      onSelect={vm.dispatchSetMantenedor}
                      onClear={vm.dispatchClearMantenedor}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card Anexos */}
          <div className="card mb-4 status-card fade-in">
            <div className="card-header"><h6 className="mb-0">Anexos</h6></div>
            <div className="card-body">
              <AnexoManager
                persistidos={vm.anexosPersistidos as AnexoPersistedItem[]}
                locais={vm.anexosLocais}
                loading={vm.carregandoAnexos}
                onAddFiles={isRejected ? undefined : vm.onAddAnexos}
                onRemoveLocal={isRejected ? undefined : vm.onRemoveAnexoLocal}
                onRemovePersistido={isRejected ? undefined : vm.onRemoveAnexoPersistido}
                getImageReadUrl={async (anexo) => {
                  const a = anexo as any
                  return a.url || a.signedUrl || (await vm.getAnexoUrl(a.id, a.key).catch(() => ''))
                }}
                onDownload={async (anexo) => {
                  const a = anexo as any
                  const url = a.url
                    || await vm.getAnexoUrl(a.id, a.key).catch(() => '')
                  if (url) window.open(url, '_blank')
                }}
                readonly={isRejected}
                maxFiles={5}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Resumo */}
        <div className="col-lg-4">
          <div className="card mb-4 status-card">
            <div className="card-header"><h6 className="mb-0">Resumo da Solicitação</h6></div>
            <div className="card-body">
              <p><strong>ID:</strong> #{form?.id}</p>
              <p><strong>Status Atual:</strong> {form?.status || "—"}</p>
              <p><strong>Solicitante:</strong> {form?.solicitante || "—"}</p>
              <p><strong>Recurso:</strong> {(form?.recurso as any)?.nome || "—"}</p>
              <p><strong>Setor Destino:</strong> {form?.setorDestino || "—"}</p>
              {form?.descricaoDoProblema && (
                <div>
                  <strong>Problema:</strong>
                  <TextWithMore text={form.descricaoDoProblema} maxLength={120} />
                </div>
              )}
            </div>
          </div>

          <ActionButtons
            disabled={vm.isSubmitting}
            saveLabel={vm.isSubmitting ? "Salvando..." : "Confirmar"}
            onSave={() => {
              setSubmitAttempted(true)
              vm.handleSubmit(descricao)
            }}
            isEditing={true}
            onCancelEdit={() => navigate(paths.solicitacoesDeServico)}
          />
        </div>
      </div>
    </div>
  )
}

export default AprovacaoStatus
