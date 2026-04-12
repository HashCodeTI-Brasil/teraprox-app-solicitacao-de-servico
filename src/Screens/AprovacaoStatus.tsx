/**
 * AprovacaoStatus — Migrado do SGM (monolito) para teraprox-app-SGM-SS.
 * Refatorado para o padrão ViewModel (Hexagonal): toda lógica Redux/API encapsulada
 * em useAprovacaoViewModel(). Este componente gerencia apenas estado de UI puro.
 */
import React, { useEffect, useRef, useState } from "react"
import {
  Alert,
  Badge,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap"
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
          <Badge bg="secondary" className="d-flex align-items-center gap-1">
            {getLabel(selected)}
            <FaTimes
              size={10}
              style={{ cursor: "pointer", marginLeft: 4 }}
              onClick={onClear}
              title="Remover mantenedor"
            />
          </Badge>
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
    return <Badge bg={variant} className="status-badge d-flex align-items-center gap-2"><Icon size={14} />{text}</Badge>
  }

  const ValidationAlert = ({ errors }: { errors: string[] }) => {
    if (!errors.length) return null
    return (
      <Alert variant="warning" className="fade-in">
        <div className="d-flex align-items-start gap-2">
          <FaExclamationTriangle className="mt-1" />
          <div>
            <strong>Atenção - Corrija os seguintes itens:</strong>
            <ul className="mb-0 mt-2">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <Container fluid className="py-4 aprovacao-status-container">
      <Row className="g-4">
        <Col lg={8}>
          {/* Card Principal */}
          <Card
            id="aprovacao-card-status"
            ref={(el: HTMLDivElement | null) => { elementRefs.current["status"] = el }}
            className="mb-4 status-card fade-in"
          >
            <Card.Header className="card-header-primary text-white">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaCog /> Aprovação de Solicitação
                {hasStatus && <StatusBadge status={formState.status} />}
              </h5>
            </Card.Header>
            <Card.Body>
              {submitAttempted && !(formState.showSectorChange || isRejected) && <ValidationAlert errors={vm.validationErrors} />}

              {/* Seleção de Status */}
              <Row className="mb-3">
                <Col hidden={!!formState.showSectorChange} md={6}>
                  <AutoComplete
                    onSelectedClick={vm.handleStatusChange}
                    loadCondition={true}
                    title="Status da Solicitação"
                    ops={["APROVADO", "REPROVADO"]}
                    value={formState.status}
                  />
                </Col>
                {formState.showSectorChange && (
                  <Col md={6}>
                    <SectorSelector
                      setores={vm.setores}
                      onSectorSelect={(setor: Sector) => vm.handleSectorSelect(setor)}
                    />
                  </Col>
                )}
              </Row>

              {/* Opções Adicionais */}
              {!isRejected && (
                <Row className="mb-3">
                  <Col hidden={!!formState.showSectorChange} md={4}>
                    <Form.Check
                      type="switch"
                      label="Definir Data Planejada"
                      checked={formState.showDateField}
                      onChange={(e) => vm.handleDateFieldToggle(e.target.checked)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      label="Alterar Setor Responsável"
                      checked={!!formState.showSectorChange}
                      onChange={(e) => vm.handleSectorChange(e.target.checked)}
                    />
                  </Col>
                </Row>
              )}

              {/* Campo de Data Planejada */}
              {formState.showDateField && (
                <Row className="mb-3">
                  <Col md={6}>
                    <FormField
                      ty="datetime-local"
                      label="Data Planejada"
                      onValueUpdate={(v) => vm.dispatchSetDataPlanejada(v ? new Date(v).toISOString() : undefined)}
                      val={formatIsoDate(form.dataPlanejada) ?? undefined}
                    />
                  </Col>
                </Row>
              )}

              {/* Motivo da Reprovação */}
              {isRejected && (
                <Row className="mb-3">
                  <Col>
                    <FormField
                      val={vm.justificativa?.descricao}
                      asTextArea
                      label="Motivo da Reprovação"
                      onValueUpdate={(v) => vm.dispatchSetDescricaoJustificativa(v)}
                      rows={4}
                    />
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Card Configuração OS (só quando Aprovado) */}
          {!formState.showSectorChange && isApproved && (
            <Card className="mb-4 status-card fade-in">
              <Card.Header><h6 className="mb-0">Configuração da Ordem de Serviço</h6></Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col>
                    <FormField
                      asTextArea
                      label="Descrição do problema"
                      rows={4}
                      val={descricao}
                      onValueUpdate={setDescricao}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <TipoDeOrdemSelector
                      onSelect={(tipo: any) => vm.dispatchSetTipoOs(tipo)}
                      selectedValue={form?.osTipos}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <MantenedorPicker
                      selected={form?.osMantenedor ?? form?.mantenedores?.[0]}
                      onSelect={vm.dispatchSetMantenedor}
                      onClear={vm.dispatchClearMantenedor}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Card Anexos */}
          <Card className="mb-4 status-card fade-in">
            <Card.Header><h6 className="mb-0">Anexos</h6></Card.Header>
            <Card.Body>
              <AnexoManager
                persistidos={vm.anexosPersistidos as AnexoPersistedItem[]}
                locais={vm.anexosLocais}
                loading={vm.carregandoAnexos}
                onAddFiles={isRejected ? undefined : vm.onAddAnexos}
                onRemoveLocal={isRejected ? undefined : vm.onRemoveAnexoLocal}
                onRemovePersistido={isRejected ? undefined : vm.onRemoveAnexoPersistido}
                onDownload={async (anexo) => {
                  const url = (anexo as any).url
                    || await vm.getAnexoUrl((anexo as any).id).catch(() => '')
                  if (url) window.open(url, '_blank')
                }}
                readonly={isRejected}
                maxFiles={5}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar Resumo */}
        <Col lg={4}>
          <Card className="mb-4 status-card">
            <Card.Header><h6 className="mb-0">Resumo da Solicitação</h6></Card.Header>
            <Card.Body>
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
            </Card.Body>
          </Card>

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
        </Col>
      </Row>
    </Container>
  )
}

export default AprovacaoStatus
