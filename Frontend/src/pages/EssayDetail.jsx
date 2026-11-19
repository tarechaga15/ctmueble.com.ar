import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataCache } from "../context/DataCacheContext";
import { useToast } from "../context/ToastContext";
import { essaysService } from "../services/essaysService";
import { documentsService } from "../services/documentsService";
import { clientsService } from "../services/clientsService";
import { getDistrictDisplay, mapProvinceCodeToDistrictId } from "@/lib/districtUtils";
import { formatCuit, formatDni, isLegalEntityCuit } from "../components/steps/client-creation/BussinessSearch";
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FlaskConical,
  History,
  Layers,
  MapPin,
  Receipt,
  Send,
  ShieldCheck,
  ShieldAlert,
  User,
  UserCheck,
  UserRound,
  XCircle,
  ClipboardList,
  Package,
  AlertCircle,
  FileCheck,
  Loader2,
  Pencil,
  X,
  Save,
  Bell,
  BellOff,
  Info,
} from "lucide-react";
import { Button as UiButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card as UiCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Back from "../components/buttons/Back";
import Tabs from "../components/Tabs";
import DataGrid from "../components/DataGrid";
import EssayCard from "../components/EssayCard";
import StyledTable from "../components/StyledTable";
import CreateContractModal from "../components/modals/CreateContractModal";
import ReceiveSamplesModal from "../components/modals/ReceiveSamplesModal";
import AcceptEssayConfirmModal from "../components/modals/AcceptEssayConfirmModal";
import CancelEssayModal from "../components/modals/CancelEssayModal";
import ActionPlaceholderCard from "../components/ActionPlaceholderCard";
import ActionDecisionCard from "../components/ActionDecisionCard";
import RejectEssayModal from "../components/modals/RejectEssayModal";
import ReEmitReportModal from "../components/modals/ReEmitReportModal";
import ReissueRequestModal from "../components/modals/ReissueRequestModal";
import SnapshotVerificationModal from "../components/modals/SnapshotVerificationModal";
import AuditLogDetailModal from "../components/modals/AuditLogDetailModal";
import EmitReportModal from "../components/modals/EmitReportModal";
import EssayProgressModal from "../components/modals/EssayProgressModal";
import WorkOrderCard from "../components/WorkOrderCard";
import ErrorAlert from "../components/ErrorAlert";
import ClientEssayStatusBanner from "../components/ClientEssayStatusBanner";

function countryName(country) {
  if (!country) return "—";
  if (typeof country === "object") return country.name || country.code || "—";
  return String(country);
}

export default function EssayDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { upsertEssay, refreshClients, districts, loadDistricts, countries } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [essay, setEssay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    daysToDo: 30,
    price: 0,
    samplesConservationDays: 30,
  });
  const [generatingContract, setGeneratingContract] = useState(false);
  const [showReceiveSamplesModal, setShowReceiveSamplesModal] = useState(false);
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
  const [showCancelEssayModal, setShowCancelEssayModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReEmitReportModal, setShowReEmitReportModal] = useState(false);
  const [showReissueRequestModal, setShowReissueRequestModal] = useState(false);
  const [reissueRequestLoading, setReissueRequestLoading] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verifyingSnapshot, setVerifyingSnapshot] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [showEmitFirstReportModal, setShowEmitFirstReportModal] = useState(false);
  const [emittingFirstReport, setEmittingFirstReport] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [clientScheduled, setClientScheduled] = useState(null);
  const [scheduleClientLoading, setScheduleClientLoading] = useState(false);
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingRep, setEditingRep] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingBilling, setEditingBilling] = useState(false);
  const [generalForm, setGeneralForm] = useState({ cuit: "", name: "" });
  const [addressForm, setAddressForm] = useState({ address: "", location: "", district: "" });
  const [repForm, setRepForm] = useState({ name: "", dni: "" });
  const [contactForm, setContactForm] = useState({
    name: "", dni: "", mail: "", address: "", location: "", district: "",
    phone: { country_code: "54", phone: "" },
  });
  const [billingForm, setBillingForm] = useState({ cuit: "", address: "", location: "", district: "", paysIva: false });
  const [savingSegment, setSavingSegment] = useState(null);
  const [reEmitLoading, setReEmitLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [togglingNotifications, setTogglingNotifications] = useState(false);

  const isLaboratory = user?.profile === "LABORATORY";
  const _isClient = user?.profile === "CLIENT";
  const isLegalEntity = isLegalEntityCuit(essay?.client?.cuit);

  const essayProgress = useMemo(() => {
    const status = essay?.status;
    const flow = [
      { id: "requested", label: "Solicitud enviada", hint: "Se envió la solicitud de ensayo al laboratorio.", icon: Send },
      { id: "waiting_approval", label: "Espera de aprobación", hint: "El laboratorio revisa la solicitud para aceptarla o rechazarla.", icon: Clock },
      { id: "contract", label: "Contrato", hint: "Se genera el acuerdo de servicio y quedan fijados los términos.", icon: FileText },
      {
        id: "in_work",
        label: essay?.workOrder ? "En trabajo" : "Esperando muestras",
        hint: essay?.workOrder
          ? "El laboratorio está trabajando en el ensayo."
          : "Falta recibir las muestras para empezar el análisis.",
        icon: FlaskConical,
      },
      { id: "completed_process", label: "Completado", hint: "El ensayo finalizó y el informe está disponible para descarga.", icon: CheckCircle2 },
    ];
    const order = ["REQUESTED", "ACCEPTED", "SERVICE_AGREEMENT_MADED", "IN_WORK", "COMPLETED"];
    let steps = flow;
    let activeIndex = Math.max(0, order.indexOf(status));

    if (status === "REJECTED") {
      steps = [
        flow[0],
        { id: "rejected", label: "Ensayo rechazado", hint: "El laboratorio rechazó la solicitud.", icon: XCircle },
      ];
      activeIndex = 1;
    } else if (status === "CANCELLED") {
      const reached = essay?.workOrder ? 3 : essay?.terms ? 2 : 0;
      steps = [
        ...flow.slice(0, reached + 1),
        { id: "cancelled", label: "Ensayo cancelado", hint: "El ensayo fue cancelado.", icon: XCircle },
      ];
      activeIndex = steps.length - 1;
    }

    const nextNotice = {
      REQUESTED: "Sigue la revisión del laboratorio, que puede aceptar o rechazar la solicitud.",
      ACCEPTED: "Sigue generar el contrato. Ahí quedan fijados los términos del acuerdo.",
      SERVICE_AGREEMENT_MADED: "Sigue recibir las muestras para empezar el análisis.",
      IN_WORK: essay?.workOrder
        ? "Sigue cerrar el análisis y emitir el informe."
        : "Sigue recibir las muestras para empezar el análisis.",
      COMPLETED: "El ensayo finalizó. El informe está en Resultados.",
      REJECTED: essay?.observations
        ? `El laboratorio rechazó la solicitud. ${essay.observations}`
        : "El laboratorio rechazó la solicitud.",
      CANCELLED: essay?.observations ? `El ensayo fue cancelado. ${essay.observations}` : "El ensayo fue cancelado.",
    };
    const notice = nextNotice[status] || flow[activeIndex]?.hint || null;

    return { steps, activeIndex, notice };
  }, [essay?.status, essay?.workOrder, essay?.terms, essay?.observations]);

  // Eventos de auditoría que corresponden a los pasos del ProcessProgressBar (para vista cliente en Historial)
  const PROCESS_STEP_EVENT_CODES = [
    "REQUEST_CREATED",
    "REQUEST_APPROVED",
    "REQUEST_REJECTED",
    "CONTRACT_CREATED",
    "SAMPLES_RECEIVED",
    "RESULTS_LOADED",
    "REPORT_ISSUED",
    "ESSAY_CANCELLED",
  ];
  const _processStepAuditLogs =
    essay?.auditLogs?.filter((log) =>
      PROCESS_STEP_EVENT_CODES.includes(log.eventCode)
    ) ?? [];

  useEffect(() => {
    async function fetchEssay() {
      try {
        setLoading(true);
        setError(null);
        setActiveTab(0);
        const response = await essaysService.getById(id);
        setEssay(response);
        upsertEssay(response);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    }
    fetchEssay();
  }, [id]);

  // Si es laboratorio y hay cliente, comprobar si ya está agendado (para pestaña Solicitante)
  useEffect(() => {
    if (!isLaboratory || (!essay?.client?.id && !essay?.client?.cuit)) {
      setClientScheduled(null);
      return;
    }
    let cancelled = false;
    clientsService
      .isScheduled({ clientId: essay.client?.id, cuit: essay.client?.cuit })
      .then((scheduled) => {
        if (!cancelled) setClientScheduled(scheduled);
      })
      .catch(() => {
        if (!cancelled) setClientScheduled(false);
      });
    return () => { cancelled = true; };
  }, [isLaboratory, essay?.client?.id, essay?.client?.cuit]);

  useEffect(() => {
    if (!districts) loadDistricts?.().catch(() => {});
  }, [districts, loadDistricts]);

  /** Valor (id) para el selector de provincia/district. Acepta objeto { id, name }, id directo o código (ej. AR-S). */
  const getDistrictIdForSelect = (val, districtsList) => {
    if (!val) return "";
    return mapProvinceCodeToDistrictId(val, districtsList) || "";
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    essaysService
      .getById(id)
      .then((response) => {
        setEssay(response);
        upsertEssay(response);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  const refreshEssay = () => {
    return essaysService.getById(id).then((e) => {
      setEssay(e);
      upsertEssay(e);
      return e;
    });
  };

  const getCleanErrorMessage = (err, fallback = "Ocurrió un error al procesar la solicitud.") => {
    const msg = err?.response?.data?.message || err?.response?.data?.error || "";
    if (
      msg &&
      typeof msg === "string" &&
      !/status code|internal server error|is not defined|invalid status|network error|failed to fetch|syntaxerror|typeerror|referenceerror/i.test(
        msg
      )
    ) {
      return msg;
    }
    return fallback;
  };

  const handleToggleNotifications = async () => {
    if (togglingNotifications || !essay?.id) return;
    const nextState = !essay.client_notifications_enabled;
    setTogglingNotifications(true);
    try {
      const updated = await essaysService.updateNotifications(essay.id, nextState);
      setEssay((prev) => ({
        ...prev,
        client_notifications_enabled: updated.client_notifications_enabled,
        clientNotificationsEnabled: updated.clientNotificationsEnabled,
      }));
      upsertEssay({
        ...essay,
        client_notifications_enabled: updated.client_notifications_enabled,
      });
      await refreshEssay();
      showSuccessToast(
        nextState
          ? "Notificaciones por correo activadas para esta solicitud"
          : "Notificaciones por correo desactivadas para esta solicitud"
      );
    } catch (err) {
      showErrorToast(
        getCleanErrorMessage(
          err,
          "No se pudieron actualizar las notificaciones por correo. Intente nuevamente más tarde."
        )
      );
    } finally {
      setTogglingNotifications(false);
    }
  };

  /** Construye payload completo para el backend desde essay.client y opcionalmente sobrescribiendo un segmento. district/province como string ID. */
  const buildClientPayload = (overrides = {}) => {
    const c = essay?.client;
    if (!c) return null;
    const ensureDistrictId = (v) => {
      if (v == null || v === "") return v === "" ? "" : null;
      if (typeof v === "object" && v?.id != null) return String(v.id);
      return String(v);
    };
    const addr = overrides.address ?? c?.address ?? {};
    const contact = overrides.contact ?? c?.contact ?? {};
    const billing = overrides.billing ?? c?.billing ?? {};
    const phoneObj = contact?.phone && typeof contact.phone === "object"
      ? contact.phone
      : { country_code: contact?.country_code ?? "054", phone: typeof contact?.phone === "string" ? contact.phone : "" };
    return {
      cuit: (overrides.general ?? c)?.cuit ?? c?.cuit ?? "",
      name: (overrides.general ?? c)?.name ?? c?.name ?? "",
      address: {
        id: addr?.id ?? c?.address?.id ?? null,
        address: addr?.address ?? c?.address?.address ?? "",
        location: addr?.location ?? c?.address?.location ?? "",
        province: ensureDistrictId(addr?.province ?? addr?.district ?? c?.address?.district ?? c?.address?.province) ?? "",
      },
      representative: overrides.rep ?? c?.representative ?? { id: null, name: "", dni: "" },
      contact: {
        id: contact?.id ?? c?.contact?.id ?? null,
        name: contact?.name ?? c?.contact?.name ?? "",
        dni: contact?.dni ?? c?.contact?.dni ?? "",
        mail: contact?.mail ?? c?.contact?.mail ?? "",
        country_code: phoneObj?.country_code ?? "054",
        phone: phoneObj?.phone ?? "",
        address: contact?.address ?? c?.contact?.address ?? "",
        location: contact?.location ?? c?.contact?.location ?? "",
        district: ensureDistrictId(contact?.district ?? c?.contact?.district) ?? null,
        country: contact?.country ?? c?.contact?.country ?? null,
      },
      billing: {
        cuit: billing?.cuit ?? c?.billing?.cuit ?? "",
        address: billing?.address ?? c?.billing?.address ?? "",
        location: billing?.location ?? c?.billing?.location ?? "",
        province: ensureDistrictId(billing?.province ?? c?.billing?.province) ?? "",
        paysIva: billing?.paysIva ?? c?.billing?.paysIva ?? c?.billing?.pays_iva ?? false,
      },
    };
  };

  const saveSegment = async (segmentKey, payload) => {
    if (!essay?.id || !payload) return;
    setSavingSegment(segmentKey);
    try {
      const updated = await essaysService.updateEssayClient(essay.id, payload);
      setEssay(updated);
      upsertEssay(updated);
      if (segmentKey === "general") setEditingGeneral(false);
      if (segmentKey === "address") setEditingAddress(false);
      if (segmentKey === "rep") setEditingRep(false);
      if (segmentKey === "contact") setEditingContact(false);
      if (segmentKey === "billing") setEditingBilling(false);
      showSuccessToast("Datos del solicitante actualizados.");
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al guardar los datos del solicitante"));
    } finally {
      setSavingSegment(null);
    }
  };

  const startEditGeneral = () => {
    const c = essay?.client;
    if (c) setGeneralForm({ cuit: c.cuit ? formatCuit(c.cuit) : "", name: c.name || c.contact?.name || "" });
    setEditingGeneral(true);
  };
  const startEditAddress = () => {
    const addr = essay?.client?.address;
    const district = addr?.district ?? addr?.province ?? "";
    setAddressForm({
      address: addr?.address ?? "",
      location: addr?.location ?? "",
      district: getDistrictIdForSelect(district, districts) || "",
    });
    setEditingAddress(true);
  };
  const startEditRep = () => {
    const rep = essay?.client?.representative;
    if (rep) setRepForm({ name: rep.name ?? "", dni: rep.dni ? formatDni(rep.dni) : "" });
    setEditingRep(true);
  };
  const startEditContact = () => {
    const c = essay?.client?.contact;
    const phoneObj = c?.phone && typeof c.phone === "object" ? c.phone : { country_code: "54", phone: c?.phone ?? "" };
    setContactForm({
      name: c?.name ?? "",
      dni: c?.dni ? formatDni(c.dni) : "",
      mail: c?.mail ?? "",
      address: c?.address ?? "",
      location: c?.location ?? "",
      district: getDistrictIdForSelect(c?.district, districts) ?? "",
      phone: { country_code: phoneObj?.country_code ?? "54", phone: phoneObj?.phone ?? "" },
    });
    setEditingContact(true);
  };
  const startEditBilling = () => {
    const b = essay?.client?.billing;
    setBillingForm({
      cuit: b?.cuit ? formatCuit(b.cuit) : "",
      address: b?.address ?? "",
      location: b?.location ?? "",
      district: getDistrictIdForSelect(b?.province, districts) ?? "",
      paysIva: !!b?.paysIva && b?.paysIva !== false,
    });
    setEditingBilling(true);
  };

  const handleCancelGeneral = () => setEditingGeneral(false);
  const handleCancelAddress = () => setEditingAddress(false);
  const handleCancelRep = () => setEditingRep(false);
  const handleCancelContact = () => setEditingContact(false);
  const handleCancelBilling = () => setEditingBilling(false);

  const handleSaveGeneral = () => {
    const payload = buildClientPayload({
      general: {
        cuit: generalForm.cuit ? String(generalForm.cuit).replace(/\D/g, "") : "",
        name: generalForm.name,
      },
    });
    saveSegment("general", payload);
  };
  const handleSaveAddress = () => {
    const payload = buildClientPayload({
      address: {
        ...essay?.client?.address,
        id: essay?.client?.address?.id,
        address: addressForm.address,
        location: addressForm.location,
        province: addressForm.district,
      },
    });
    saveSegment("address", payload);
  };
  const handleSaveRep = () => {
    const payload = buildClientPayload({
      rep: {
        ...essay?.client?.representative,
        name: repForm.name,
        dni: repForm.dni ? String(repForm.dni).replace(/\D/g, "") : "",
      },
    });
    saveSegment("rep", payload);
  };
  const handleSaveContact = () => {
    const payload = buildClientPayload({
      contact: {
        ...essay?.client?.contact,
        name: contactForm.name,
        dni: contactForm.dni ? String(contactForm.dni).replace(/\D/g, "") : "",
        mail: contactForm.mail,
        address: contactForm.address,
        location: contactForm.location,
        district: contactForm.district,
        phone: contactForm.phone?.phone ? { country_code: contactForm.phone.country_code || "54", phone: contactForm.phone.phone } : null,
        country_code: contactForm.phone?.country_code,
      },
    });
    saveSegment("contact", payload);
  };
  const handleSaveBilling = () => {
    const payload = buildClientPayload({
      billing: {
        ...essay?.client?.billing,
        cuit: billingForm.cuit ? String(billingForm.cuit).replace(/\D/g, "") : "",
        address: billingForm.address,
        location: billingForm.location,
        province: billingForm.district,
        paysIva: billingForm.paysIva,
      },
    });
    saveSegment("billing", payload);
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const updated = await essaysService.procedureAction(id, "ACCEPT");
      setEssay(updated);
      upsertEssay(updated);
      showSuccessToast("Ensayo aceptado correctamente.");
      setShowAcceptConfirmModal(false);
    } catch (err) {
      setError(err);
      showErrorToast(getCleanErrorMessage(err, "Error al aceptar el ensayo"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEssay = async (reason) => {
    setActionLoading(true);
    try {
      const updated = await essaysService.procedureAction(id, "CANCEL", reason);
      setEssay(updated);
      upsertEssay(updated);
      showSuccessToast("Ensayo cancelado correctamente.");
      setShowCancelEssayModal(false);
    } catch (err) {
      setError(err);
      showErrorToast(getCleanErrorMessage(err, "Error al cancelar el ensayo"));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (observations) => {
    setActionLoading(true);
    try {
      const updated = await essaysService.procedureAction(id, "REJECT", observations);
      setEssay(updated);
      upsertEssay(updated);
      showSuccessToast("Ensayo rechazado correctamente.");
      setShowRejectModal(false);
    } catch (err) {
      setError(err);
      showErrorToast(getCleanErrorMessage(err, "Error al rechazar el ensayo"));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleClient = async () => {
    if (!essay?.client?.id && !essay?.client?.cuit) return;
    setScheduleClientLoading(true);
    try {
      await clientsService.addScheduled({
        clientId: essay.client?.id,
        cuit: essay.client?.cuit,
        name: essay.client?.name,
        representative: essay.client?.representative,
        contact: essay.client?.contact,
        address: essay.client?.address,
        billing: essay.client?.billing,
      });
      setClientScheduled(true);
      showSuccessToast("Empresa agendada en tu agenda correctamente.");
      await refreshClients();
    } catch (err) {
      console.error(err);
      showErrorToast(getCleanErrorMessage(err, "Error al agendar en la agenda"));
    } finally {
      setScheduleClientLoading(false);
    }
  };

  const handleGenerateContract = async (terms) => {
    const contract = await essaysService.generateContract(id, terms);
    const docId = contract?.id ?? contract?.documentId;
    if (contract?.url) {
      window.open(contract.url, "_blank");
    } else if (docId) {
      documentsService.download(docId, contract?.filename || "contrato.pdf", () => showSuccessToast("Descarga iniciada."));
    }
    refreshEssay();
  };

  useEffect(() => {
    if (essay?.terms) {
      setContractForm({
        daysToDo: essay.terms.daysToDo ?? essay.terms.days_to_do ?? 30,
        price: essay.terms.price != null ? essay.terms.price : 0,
        samplesConservationDays:
          essay.terms.samplesConservationDays ??
          essay.terms.samples_conservation_days ??
          30,
      });
    }
  }, [essay?.terms]);

  const handleDownloadContract = () => {
    if (!essay?.id) return;
    documentsService.downloadByEssayAndType(essay.id, "F-PC13-02", () =>
      showSuccessToast("Descarga de contrato iniciada.")
    );
  };

  const handleGenerateContractFromTab = async (e) => {
    e?.preventDefault();
    const d = parseInt(contractForm.daysToDo, 10);
    const p = parseFloat(contractForm.price);
    const s = parseInt(contractForm.samplesConservationDays, 10);
    if (!d || d <= 0) {
      showErrorToast("Los días para realizar el ensayo deben ser un número positivo.");
      return;
    }
    if (p < 0 || isNaN(p)) {
      showErrorToast("El precio debe ser un número mayor o igual a cero.");
      return;
    }
    if (!s || s <= 0) {
      showErrorToast("Los días de conservación de muestras deben ser un número positivo.");
      return;
    }
    setGeneratingContract(true);
    try {
      await handleGenerateContract({
        days_to_do: d,
        price: p,
        samples_conservation_days: s,
      });
      showSuccessToast("Contrato generado correctamente.");
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al generar contrato"));
    } finally {
      setGeneratingContract(false);
    }
  };

  // Muestras con resultado cargado
  const analyzedSamples = essay?.workOrder?.samples?.filter((s) => s.result != null) || [];
  const sampleCodes = analyzedSamples.length
    ? analyzedSamples.map((s) => s.code).join(", ")
    : "N/A";

  // Fecha de recepción: work order o primera muestra con receivedAt/receptionDate
  const woReception = essay?.workOrder?.samples_received_at;
  const firstReceivedAt = !woReception && essay?.workOrder?.samples?.find(
    (s) => s.receivedAt || s.receptionDate || s.received_at
  );
  const receptionDate = woReception
    ? new Date(woReception).toLocaleDateString("es-AR")
    : firstReceivedAt
    ? new Date(
        firstReceivedAt.receivedAt ||
          firstReceivedAt.receptionDate ||
          firstReceivedAt.received_at
      ).toLocaleDateString("es-AR")
    : "N/A";

  const lastReportDate = essay?.last_report_generated ?? essay?.lastReportGenerated ?? null;

  // Snapshot capturado en el último informe emitido
  const latestReportLog = (essay?.auditLogs || [])
    .filter(
      (l) => l.eventCode === "REPORT_ISSUED" || l.event_code === "REPORT_ISSUED"
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  const reportSnapshot =
    essay?.lastReportSnapshot ||
    essay?.reportResults ||
    latestReportLog?.metadata?.resultsSnapshot ||
    null;

  const hasEmittedReport = !!(
    lastReportDate ||
    essay?.finishDate ||
    latestReportLog
  );

  // Comprobar si las muestras o mediciones actuales difieren de las del informe emitido
  const samplesDifferFromReport = useMemo(() => {
    if (!hasEmittedReport || !reportSnapshot) return false;

    // Comparar average_value
    const currentAvg = essay?.workOrder?.average_value != null ? Number(essay.workOrder.average_value) : null;
    const reportAvg = reportSnapshot.average_value != null ? Number(reportSnapshot.average_value) : null;
    if (currentAvg != null && reportAvg != null && Math.abs(currentAvg - reportAvg) > 0.0001) {
      return true;
    }

    // Comparar resultados individuales de muestras
    const currentSamples = essay?.workOrder?.samples || [];
    const snapshotSamples = reportSnapshot.samples || [];
    if (snapshotSamples.length > 0 && currentSamples.length > 0) {
      const snapMap = new Map(snapshotSamples.map((s) => [String(s.id || s.code), s.result != null ? Number(s.result) : null]));
      for (const cs of currentSamples) {
        const key = String(cs.id || cs.code);
        if (snapMap.has(key)) {
          const snapRes = snapMap.get(key);
          const currentRes = cs.result != null ? Number(cs.result) : null;
          if (currentRes !== snapRes) {
            return true;
          }
        }
      }
    }

    return false;
  }, [hasEmittedReport, reportSnapshot, essay?.workOrder]);

  // Solo mostrar "modificaciones post informe" cuando ya hubo al menos un informe y una actualización posterior a esa fecha o cambio en mediciones.
  const timestampModified =
    !!lastReportDate &&
    ((essay?.workOrder?.last_update &&
      new Date(essay.workOrder.last_update) > new Date(lastReportDate)) ||
      (essay?.workOrder?.lastUpdate &&
        new Date(essay.workOrder.lastUpdate) > new Date(lastReportDate)) ||
      (essay?.last_update &&
        new Date(essay.last_update) > new Date(lastReportDate)) ||
      (essay?.lastUpdate &&
        new Date(essay.lastUpdate) > new Date(lastReportDate)));

  const modifiedAfterReport = hasEmittedReport && (timestampModified || samplesDifferFromReport);

  // Tipo de re-emisión: MODIFICATION si hubo cambios después del informe (misma lógica que la alerta), sino COPY
  const reportEmissionType = modifiedAfterReport ? "MODIFICATION" : "COPY";

  const reportAverageValue =
    reportSnapshot?.average_value ?? essay?.result ?? null;
  const reportUncertainty =
    reportSnapshot?.uncertainty ?? essay?.uncertainty ?? null;
  const reportSampleCodes =
    reportSnapshot?.sampleCodes ??
    (reportSnapshot?.samples?.length
      ? reportSnapshot.samples.map((s) => s.code).join(", ")
      : null);
  const reportSampleDimensions =
    reportSnapshot?.sample_dimensions ?? essay?.workOrder?.sample_dimensions ?? null;
  const reportReceptionDate = reportSnapshot?.samples_received_at
    ? new Date(reportSnapshot.samples_received_at).toLocaleDateString("es-AR")
    : receptionDate;
  const reportFinishDate =
    reportSnapshot?.finishDate || essay?.finishDate
      ? new Date(
          reportSnapshot?.finishDate || essay.finishDate
        ).toLocaleDateString("es-AR")
      : null;

  const resultsData = [
    {
      label: "Valor promedio",
      value: hasEmittedReport
        ? reportAverageValue != null
          ? `${reportAverageValue} mg/m².h`
          : "N/A"
        : essay?.workOrder?.average_value != null
          ? `${essay.workOrder.average_value} mg/m².h`
          : essay?.result != null
            ? `${essay.result} mg/m².h`
            : "N/A",
    },
    {
      label: "Incertidumbre",
      value: hasEmittedReport
        ? (reportUncertainty ?? "N/A")
        : (essay?.workOrder?.uncertainty ?? essay?.uncertainty ?? "N/A"),
    },
    {
      label: "Muestras analizadas",
      value: hasEmittedReport
        ? (reportSampleCodes ?? sampleCodes)
        : sampleCodes,
    },
    {
      label: "Dimensión de las muestras",
      value: hasEmittedReport
        ? (reportSampleDimensions ?? "N/A")
        : (essay?.workOrder?.sample_dimensions ?? "N/A"),
    },
    {
      label: "Fecha de recepción",
      value: hasEmittedReport ? (reportReceptionDate ?? "N/A") : receptionDate,
    },
    {
      label: "Fecha de fin de ensayo",
      value: hasEmittedReport
        ? (reportFinishDate ?? "N/A")
        : essay?.finishDate
          ? new Date(essay.finishDate).toLocaleDateString("es-AR")
          : "N/A",
    },
  ];

  const handleDownloadReport = () => {
    if (!essay?.id) return;
    documentsService.downloadByEssayAndType(essay.id, "F-PC15-01", () => showSuccessToast("Descarga iniciada."));
  };

  const samplesWithResult = useMemo(() => {
    return (essay?.workOrder?.samples || []).filter(
      (s) => s.result != null && s.result !== "" && !isNaN(parseFloat(s.result))
    );
  }, [essay?.workOrder?.samples]);

  const canEmitFirstReport =
    isLaboratory &&
    !essay?.finishDate &&
    essay?.status !== "COMPLETED" &&
    samplesWithResult.length >= 2;

  const handleEmitFirstReport = async () => {
    if (!essay?.id) return;
    setEmittingFirstReport(true);
    try {
      const result = await essaysService.emitReport(essay.id);
      const docId = result?.id ?? result?.documentId;
      if (result?.url) {
        window.open(result.url, "_blank");
      } else if (docId) {
        documentsService.download(docId, result?.filename || "informe.pdf", () =>
          showSuccessToast("Descarga iniciada.")
        );
      }
      await refreshEssay();
      showSuccessToast("Informe emitido correctamente.");
      setShowEmitFirstReportModal(false);
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al emitir el informe"));
    } finally {
      setEmittingFirstReport(false);
    }
  };

  const handleReEmitReport = async () => {
    if (!essay?.id) return;
    setReEmitLoading(true);
    try {
      const result = await essaysService.emitReport(essay.id);
      const docId = result?.id ?? result?.documentId;
      if (result?.url) {
        window.open(result.url, "_blank");
      } else if (docId) {
        documentsService.download(docId, result?.filename || "informe.pdf", () => showSuccessToast("Descarga iniciada."));
      }
      await refreshEssay();
      const isMod = reportEmissionType === "MODIFICATION";
      showSuccessToast(isMod ? "Informe emitido correctamente (modificación)." : "Informe emitido correctamente (copia).");
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al re-emitir el informe"));
      throw err;
    } finally {
      setReEmitLoading(false);
    }
  };

  const handleReissueRequest = async (reason) => {
    if (!essay?.id) return;
    setReissueRequestLoading(true);
    try {
      await essaysService.reissueRequest(essay.id, reason);
      await refreshEssay();
      await loadSnapshots();
      showSuccessToast("Solicitud F-PC13-01 reemitida con modificación correctamente.");
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al re-emitir la solicitud"));
      throw err;
    } finally {
      setReissueRequestLoading(false);
    }
  };

  const loadSnapshots = async () => {
    if (!essay?.id) return;
    setSnapshotsLoading(true);
    try {
      const data = await essaysService.getSnapshots(essay.id);
      setSnapshots(data);
    } catch (err) {
      console.warn("No se pudieron cargar snapshots de auditoría:", err);
    } finally {
      setSnapshotsLoading(false);
    }
  };

  const handleVerifySnapshot = async (snapshotId) => {
    setSelectedVerification(null);
    setVerifyingSnapshot(true);
    setShowVerificationModal(true);
    try {
      const result = await essaysService.verifySnapshot(snapshotId);
      setSelectedVerification(result);
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al verificar la snapshot"));
      setShowVerificationModal(false);
    } finally {
      setVerifyingSnapshot(false);
    }
  };

  const handleDownloadOtsProof = async (snapshotId, filename) => {
    try {
      await essaysService.downloadOtsProof(snapshotId, filename);
      showSuccessToast("Descarga de comprobante .ots iniciada");
    } catch (err) {
      showErrorToast(getCleanErrorMessage(err, "Error al descargar el comprobante OTS"));
    }
  };

  const handleValidateDocument = async (doc) => {
    if (!essay?.id) return;
    const docCode = doc?.typeDocument?.code || doc?.typeCode || "F-PC13-01";
    const isMod = Boolean(doc?.modificated !== undefined ? doc.modificated : doc?.modified);

    let currentSnapshots = snapshots;
    if (!currentSnapshots || currentSnapshots.length === 0) {
      try {
        currentSnapshots = await essaysService.getSnapshots(essay.id);
        setSnapshots(currentSnapshots);
      } catch (e) {
        console.warn("Error al cargar snapshots:", e);
      }
    }

    const matching = (currentSnapshots || [])
      .filter((s) => (s.documentType || s.document_type) === docCode)
      .sort((a, b) => (Number(a.version) || 0) - (Number(b.version) || 0));

    let targetSnapshot = null;
    if (matching.length === 1) {
      targetSnapshot = matching[0];
    } else if (matching.length > 1) {
      const sameCodeDocs = (essay?.documents || [])
        .filter((d) => (d?.typeDocument?.code || d?.typeCode || "F-PC13-01") === docCode)
        .sort((a, b) => new Date(a.generated_at || 0) - new Date(b.generated_at || 0));
      const docIdx = sameCodeDocs.findIndex((d) => d.id === doc.id);
      if (docIdx !== -1 && matching[docIdx]) {
        targetSnapshot = matching[docIdx];
      } else if (isMod) {
        targetSnapshot = matching[matching.length - 1];
      } else {
        targetSnapshot = matching[0];
      }
    }

    if (targetSnapshot?.id) {
      handleVerifySnapshot(targetSnapshot.id);
    } else if (currentSnapshots && currentSnapshots.length > 0) {
      handleVerifySnapshot(currentSnapshots[currentSnapshots.length - 1].id);
    } else {
      showErrorToast("Aún no se ha registrado un comprobante digital para este documento.");
    }
  };

  const isCompleted = essay?.status === "COMPLETED";
  const hasContract = Boolean(
    essay?.terms ||
    ["SERVICE_AGREEMENT_MADED", "IN_WORK", "COMPLETED"].includes(essay?.status)
  );
  const canGenerateContract = essay?.status === "ACCEPTED";
  const showSamplesTab = essay?.status === "IN_WORK" || isCompleted;
  const tabs = [
    ...(isCompleted ? [{ id: "results", label: "Resultados", icon: ShieldCheck }] : []),
    { id: "client", label: "Solicitud", icon: ClipboardList },
    { id: "contract", label: "Contrato", icon: FileText },
    ...(showSamplesTab ? [{ id: "samples", label: "Órdenes de trabajo", icon: FlaskConical }] : []),
    { id: "documentation", label: "Documentación", icon: FileText },
    { id: "history", label: "Historial", icon: History },
  ];
  const activeId = tabs[Math.min(activeTab, Math.max(tabs.length - 1, 0))]?.id;

  useEffect(() => {
    setActiveTab((prev) => Math.min(prev, Math.max(tabs.length - 1, 0)));
  }, [tabs.length]);

  useEffect(() => {
    if (activeId === "documentation" && essay?.id) {
      loadSnapshots();
    }
  }, [activeId, essay?.id]);

  const sampleStatusMap = {
    PENDING: {
      text: "Pendiente",
      color: "#f1c40f",
      background: "#fffbe6",
    },
    RECEIVED: {
      text: "Recibida",
      color: "#2980ef",
      background: "#eaf3fb",
    },
    ACCEPTED: {
      text: "Aceptada",
      color: "#27ae60",
      background: "#e7f8ee",
    },
    REJECTED: {
      text: "Rechazada",
      color: "#ea495c",
      background: "#fcebea",
    },
    ANALYZING: {
      text: "En análisis",
      color: "#9b59b6",
      background: "#f4ecf7",
    },
    ANALYZED: {
      text: "Analizada",
      color: "#27ae60",
      background: "#e7f8ee",
    },
  };

  // Definición de columnas para la tabla de muestras (mismo formato que WorkOrderDetail)
  const samplesColumns = [
    {
      header: "Código",
      accessor: "code",
      render: (sample) => <span className="font-medium">{sample.code || "N/A"}</span>,
    },
    {
      header: "Estado",
      accessor: "status",
      render: (sample) => {
        const sampleStatus = sampleStatusMap[sample?.status] || {
          text: sample?.status || "N/A",
          color: "#e5e7eb",
          background: "rgba(148,163,184,0.25)",
        };
        return (
          <span
            className="badge font-medium"
            style={{
              color: sampleStatus.color,
              backgroundColor: sampleStatus.background,
            }}
          >
            {sampleStatus.text}
          </span>
        );
      },
    },
    {
      header: "Resultado",
      accessor: "result",
      render: (sample) => (sample.result != null ? Number(sample.result).toFixed(2) : "—"),
    },
    {
      header: "Dimensiones",
      accessor: "dimensions",
      render: (sample) => {
        const ancho = sample.width;
        const largo = sample.height;
        const espesor = sample.thickness;
        if (ancho == null && largo == null && espesor == null) return "—";
        const fmt = (x) => (x != null && x !== "" ? Number(x).toFixed(1) : "");
        const parts = [ancho, largo, espesor]
          .filter((x) => x != null && x !== "")
          .map((x) => fmt(x))
          .filter(Boolean);
        if (parts.length === 0) return "—";
        return parts.join(" × ") + " mm";
      },
    },
  ];

  // Definición de columnas para la tabla de auditLogs
  const auditLogsColumns = [
    {
      header: "Evento",
      accessor: "eventDescription",
      className: "font-medium",
    },
    {
      header: "Fecha",
      accessor: "timestamp",
      render: (action) => {
        return action.timestamp
          ? new Date(action.timestamp).toLocaleString("es-AR")
          : "Fecha no disponible";
      },
    },
    {
      header: "Usuario",
      accessor: "userName",
      render: (action) => action.userName || "N/A",
    },
    {
      header: "Dispositivo / Origen",
      render: (action) => (
        <span className="text-xs text-muted-foreground truncate block max-w-[200px]" title={action.clientName}>
          {action.clientName || "—"}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      render: (action) => (
        <UiButton
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAuditLog(action);
            setShowAuditLogModal(true);
          }}
          className="text-xs h-7 px-2.5 gap-1.5"
          title="Ver información de esta acción"
        >
          <Info className="size-3.5" />
          <span>Detalles</span>
        </UiButton>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-muted-foreground">Cargando ensayo...</p>
      </div>
    );
  }

  if (error || !essay) {
    const message = error?.response?.data?.message || error?.message || "No se pudo cargar el ensayo.";
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4 p-4">
      <div className="w-full max-w-md space-y-4">
        <ErrorAlert
          title="Error al cargar el ensayo"
          message={message}
        />
        <div className="flex gap-3 justify-center">
          <button className="btn btn-primary" onClick={retryLoad}>
            Reintentar
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            Volver al inicio
          </button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Back size="50px" navigateTo="/dashboard" />
        <button
          type="button"
          disabled={togglingNotifications}
          onClick={handleToggleNotifications}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            essay?.client_notifications_enabled
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "border-border bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
          title={
            essay?.client_notifications_enabled
              ? "Hacé clic para desactivar las notificaciones por correo de este ensayo"
              : "Hacé clic para activar las notificaciones por correo de este ensayo"
          }
        >
          {togglingNotifications ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : essay?.client_notifications_enabled ? (
            <Bell className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <BellOff className="size-3.5" />
          )}
          <span>
            Notificaciones por correo:{" "}
            <strong>{essay?.client_notifications_enabled ? "Activadas" : "Desactivadas"}</strong>
          </span>
          <span className="text-[10px] underline ml-1 opacity-80">
            {essay?.client_notifications_enabled ? "Desactivar" : "Activar"}
          </span>
        </button>
      </div>

      <EssayCard
        essay={essay}
        variant="detail"
        onStatusClick={() => setShowProgress(true)}
        notice={isLaboratory ? essayProgress.notice : null}
        actions={
          isLaboratory ? (
            essay?.status === "REQUESTED" ? (
              <ActionDecisionCard
                label="¿Aceptás esta solicitud?"
                onConfirm={() => setShowAcceptConfirmModal(true)}
                onCancel={() => setShowCancelEssayModal(true)}
                disabled={actionLoading}
              />
            ) : essay?.status === "ACCEPTED" ? (
              <ActionDecisionCard
                label="¿Generar contrato para este ensayo?"
                onConfirm={() => setShowContractModal(true)}
                onCancel={() => setShowCancelEssayModal(true)}
                disabled={actionLoading}
              />
            ) : essay?.status === "SERVICE_AGREEMENT_MADED" ? (
              <ActionDecisionCard
                label="¿Recibir muestras para este ensayo?"
                onConfirm={() => setShowReceiveSamplesModal(true)}
                onCancel={() => setShowCancelEssayModal(true)}
                disabled={actionLoading}
              />
            ) : canEmitFirstReport ? (
              <ActionDecisionCard
                label="¿Emitir informe para este ensayo?"
                onConfirm={() => setShowEmitFirstReportModal(true)}
                onCancel={() => setShowCancelEssayModal(true)}
                disabled={actionLoading || emittingFirstReport}
              />
            ) : modifiedAfterReport ? (
              <ActionDecisionCard
                label="¿Re-emitir informe para este ensayo?"
                onConfirm={() => setShowReEmitReportModal(true)}
                onCancel={() => setShowCancelEssayModal(true)}
                disabled={actionLoading || reEmitLoading}
              />
            ) : null
          ) : (
            <ClientEssayStatusBanner
              status={essay?.status}
              observations={essay?.observations}
              onNavigateTab={(tabId) => {
                const targetIdx = tabs.findIndex((t) => t.id === tabId);
                if (targetIdx !== -1) setActiveTab(targetIdx);
              }}
            />
          )
        }
      />
      <EssayProgressModal
        show={showProgress}
        onClose={() => setShowProgress(false)}
        steps={essayProgress.steps}
        activeIndex={essayProgress.activeIndex}
      />
      <div className="mt-5 space-y-4">
        {/* Tabs Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="p-[16px]">
          {activeId === "results" && (
            <div className="space-y-4">
              {modifiedAfterReport ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <span className="text-destructive" aria-hidden>⚠</span>
                  <p className="text-sm">Los datos del ensayo fueron modificados después de la emisión del informe.</p>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-2">
                  <UiButton type="button" variant="outline" size="sm" disabled={reEmitLoading} onClick={() => setShowReEmitReportModal(true)}>
                    {reEmitLoading ? "Re-emitiendo..." : "Re-emitir informe"}
                  </UiButton>
                  <UiButton type="button" size="sm" onClick={handleDownloadReport}>
                    <Download />
                    Descargar informe
                  </UiButton>
              </div>
              <DataGrid data={resultsData} />
            </div>
          )}

          {activeId === "contract" && (
            <div className="space-y-6">
              <UiCard className="shadow-xs">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-foreground">
                          Términos del Contrato de Servicio
                        </CardTitle>
                        {hasContract ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Formalizado (F-PC13-02)
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pendiente de formalización
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Plazo de realización del ensayo, conservación de muestras y precio pactado (formulario F-PC13-02).
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {hasContract ? (
                      <UiButton
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadContract}
                        className="h-8 text-xs font-medium"
                      >
                        <Download className="size-3.5 mr-1.5" />
                        Descargar contrato (PDF)
                      </UiButton>
                    ) : isLaboratory ? (
                      <UiButton
                        type="button"
                        size="sm"
                        disabled={!canGenerateContract || generatingContract || actionLoading}
                        onClick={handleGenerateContractFromTab}
                        className="h-8 text-xs font-medium"
                        title={
                          !canGenerateContract
                            ? "Debés aceptar la solicitud antes de formalizar el contrato"
                            : undefined
                        }
                      >
                        {generatingContract ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin mr-1.5" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <FileText className="size-3.5 mr-1.5" />
                            Generar contrato
                          </>
                        )}
                      </UiButton>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {!hasContract && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                      <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {isLaboratory
                            ? essay?.status === "REQUESTED"
                              ? "Solicitud pendiente de aceptación para formalizar contrato."
                              : "El contrato de servicio aún no ha sido formalizado."
                            : "Contrato pendiente de formalización."}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {isLaboratory
                            ? essay?.status === "REQUESTED"
                              ? "Aceptá la solicitud en el encabezado para habilitar la emisión formal del contrato F-PC13-02 con estos términos."
                              : "Completá los términos a continuación y presioná 'Generar contrato' para emitir formalmente el acuerdo legal F-PC13-02."
                            : "Los valores a continuación son de referencia estimada. El laboratorio formalizará los términos definitivos en el acuerdo oficial."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Días para realizar el ensayo */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="daysToDoInput"
                          className="text-xs font-medium text-foreground"
                        >
                          Plazo de Ensayo (Días)
                        </Label>
                        <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded">
                          days_to_do
                        </span>
                      </div>
                      <Input
                        id="daysToDoInput"
                        type="number"
                        min="1"
                        step="1"
                        value={contractForm.daysToDo}
                        disabled={hasContract || !isLaboratory}
                        onChange={(e) =>
                          setContractForm((prev) => ({
                            ...prev,
                            daysToDo: e.target.value,
                          }))
                        }
                        placeholder="30"
                        className="text-sm h-9"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Días hábiles / corridos acordados para ejecutar el ensayo.
                      </p>
                    </div>

                    {/* Días de conservación de muestras */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="samplesConservationInput"
                          className="text-xs font-medium text-foreground"
                        >
                          Custodia de Muestras (Días)
                        </Label>
                        <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded">
                          samples_conservation_days
                        </span>
                      </div>
                      <Input
                        id="samplesConservationInput"
                        type="number"
                        min="1"
                        step="1"
                        value={contractForm.samplesConservationDays}
                        disabled={hasContract || !isLaboratory}
                        onChange={(e) =>
                          setContractForm((prev) => ({
                            ...prev,
                            samplesConservationDays: e.target.value,
                          }))
                        }
                        placeholder="30"
                        className="text-sm h-9"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Plazo de almacenamiento de contramuestras bajo custodia.
                      </p>
                    </div>

                    {/* Precio del servicio */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="priceInput"
                          className="text-xs font-medium text-foreground"
                        >
                          Precio del Servicio (ARS)
                        </Label>
                        <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded">
                          price
                        </span>
                      </div>
                      <Input
                        id="priceInput"
                        type="number"
                        min="0"
                        step="0.01"
                        value={contractForm.price}
                        disabled={hasContract || !isLaboratory}
                        onChange={(e) =>
                          setContractForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="text-sm h-9 font-medium"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Monto total convenido a facturar por el ensayo.
                      </p>
                    </div>
                  </div>

                  {hasContract && essay?.terms?.price != null && !isNaN(Number(essay.terms.price)) && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Monto total convenido formalmente:
                      </span>
                      <span className="font-semibold text-foreground text-sm font-mono">
                        ARS ${Number(essay.terms.price).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </UiCard>
            </div>
          )}

          {activeId === "client" && (
            <div className="space-y-6">
              {/* Notificaciones por correo */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      essay?.client_notifications_enabled
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {essay?.client_notifications_enabled ? (
                      <Bell className="size-5" />
                    ) : (
                      <BellOff className="size-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        Notificaciones por correo al solicitante
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          essay?.client_notifications_enabled
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {essay?.client_notifications_enabled ? "Activadas" : "Desactivadas"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {essay?.client_notifications_enabled
                        ? `Se envían alertas a ${
                            essay?.contact?.mail ||
                            essay?.client?.contact?.mail ||
                            "la casilla del solicitante"
                          } ante cualquier cambio de estado.`
                        : "El solicitante no recibe correos automáticos ante los cambios de estado."}
                    </p>
                  </div>
                </div>
                <UiButton
                  type="button"
                  variant={essay?.client_notifications_enabled ? "outline" : "default"}
                  size="sm"
                  disabled={togglingNotifications}
                  onClick={handleToggleNotifications}
                  className="shrink-0 text-xs"
                >
                  {togglingNotifications ? (
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  ) : essay?.client_notifications_enabled ? (
                    <BellOff className="size-3.5 mr-1.5" />
                  ) : (
                    <Bell className="size-3.5 mr-1.5" />
                  )}
                  {essay?.client_notifications_enabled
                    ? "Desactivar notificaciones"
                    : "Activar notificaciones"}
                </UiButton>
              </div>

              {modifiedAfterReport && (
                <div
                  className="p-3.5 rounded-xl flex items-start gap-2 border border-destructive/30 bg-destructive/10"
                >
                  <span className="text-destructive font-semibold" aria-hidden>⚠</span>
                  <p className="text-sm text-foreground">
                    Los datos del ensayo fueron modificados después de la emisión del informe. Podés re-emitirlo desde Resultados.
                  </p>
                </div>
              )}

              {isLaboratory && clientScheduled === false && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/20 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Esta empresa no está en tu agenda</p>
                      <p className="text-xs text-muted-foreground">Podés agendarla para tener disponible su ficha y vincular solicitantes en futuros ensayos.</p>
                    </div>
                  </div>
                  <UiButton
                    size="sm"
                    disabled={scheduleClientLoading}
                    onClick={handleScheduleClient}
                    className="shrink-0"
                  >
                    {scheduleClientLoading ? "Agendando..." : "Agendar en mi agenda"}
                  </UiButton>
                </div>
              )}

              {isLaboratory && clientScheduled === true && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                      Empresa registrada en tu agenda de clientes.
                    </p>
                  </div>
                  <UiButton
                    variant="outline"
                    size="sm"
                    disabled={scheduleClientLoading}
                    onClick={handleScheduleClient}
                    className="text-xs h-7"
                  >
                    {scheduleClientLoading ? "Actualizando..." : "Actualizar en agenda"}
                  </UiButton>
                </div>
              )}

              {/* 1. Tipo de Ensayo y Elemento a Ensayar */}
              <UiCard className="shadow-xs">
                <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <FlaskConical className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Tipo de Ensayo y Elemento a Ensayar
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Detalles del ensayo solicitado, material a analizar, datos de fabricación y muestreo.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-muted-foreground">Ensayo Solicitado</p>
                      <p className="text-sm font-semibold text-foreground">
                        {essay?.type?.name || (typeof essay?.type === "string" ? essay.type : "—")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Elemento a Ensayar</p>
                      <p className="text-sm font-medium text-foreground">
                        {essay?.elements?.product || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fabricante</p>
                      <p className="text-sm font-medium text-foreground">
                        {essay?.elements?.manufacturer || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">País de Origen</p>
                      <p className="text-sm font-medium text-foreground">
                        {countryName(essay?.elements?.country)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fecha de Toma de Muestra</p>
                      <p className="text-sm font-medium text-foreground">
                        {essay?.elements?.date
                          ? new Date(essay.elements.date).toLocaleDateString("es-AR")
                          : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Número de Lote</p>
                      <p className="text-sm font-medium text-foreground font-mono">
                        {essay?.elements?.batch_number ?? essay?.elements?.batchNumber ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-muted-foreground">Observaciones del Ensayo</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {essay?.elements?.observations || "Sin observaciones adicionales"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </UiCard>

              {/* 2. Empresa / Cliente */}
              <UiCard className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        Información de la Entidad
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Identificación tributaria y razón social de la empresa o cliente solicitante.
                      </CardDescription>
                    </div>
                  </div>

                  {!!essay?.client && (
                    <div>
                      {!editingGeneral ? (
                        <UiButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startEditGeneral}
                          className="h-8 text-xs font-medium"
                        >
                          <Pencil className="size-3.5 mr-1.5" />
                          Editar
                        </UiButton>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelGeneral}
                            disabled={savingSegment === "general"}
                            className="h-8 text-xs font-medium"
                          >
                            <X className="size-3.5 mr-1.5" />
                            Cancelar
                          </UiButton>
                          <UiButton
                            type="button"
                            size="sm"
                            onClick={handleSaveGeneral}
                            disabled={savingSegment === "general"}
                            className="h-8 text-xs font-medium"
                          >
                            {savingSegment === "general" ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="size-3.5 mr-1.5" />
                                Guardar
                              </>
                            )}
                          </UiButton>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        CUIT / Identificación Tributaria
                      </Label>
                      {!editingGeneral ? (
                        <div className="text-xs font-mono font-medium text-foreground min-h-[36px] flex items-center">
                          {essay?.client?.cuit ? formatCuit(essay.client.cuit) : "—"}
                        </div>
                      ) : (
                        <Input
                          value={generalForm.cuit}
                          onChange={(e) => setGeneralForm((f) => ({ ...f, cuit: e.target.value }))}
                          placeholder="XX-XXXXXXXX-X"
                          className="text-xs h-9 font-mono border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {isLegalEntity ? "Razón Social *" : "Nombre Completo *"}
                      </Label>
                      {!editingGeneral ? (
                        <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                          {essay?.client?.name || essay?.client?.contact?.name || "—"}
                        </div>
                      ) : (
                        <Input
                          value={generalForm.name}
                          onChange={(e) => setGeneralForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder={isLegalEntity ? "Razón social de la empresa" : "Nombre del cliente"}
                          className="text-xs h-9 font-medium border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </UiCard>

              {/* 3. Domicilio de la Empresa */}
              <UiCard className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        Domicilio de la Empresa
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Dirección fiscal y operativa de la entidad.
                      </CardDescription>
                    </div>
                  </div>

                  {!!essay?.client && (
                    <div>
                      {!editingAddress ? (
                        <UiButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startEditAddress}
                          className="h-8 text-xs font-medium"
                        >
                          <Pencil className="size-3.5 mr-1.5" />
                          Editar
                        </UiButton>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelAddress}
                            disabled={savingSegment === "address"}
                            className="h-8 text-xs font-medium"
                          >
                            <X className="size-3.5 mr-1.5" />
                            Cancelar
                          </UiButton>
                          <UiButton
                            type="button"
                            size="sm"
                            onClick={handleSaveAddress}
                            disabled={savingSegment === "address"}
                            className="h-8 text-xs font-medium"
                          >
                            {savingSegment === "address" ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="size-3.5 mr-1.5" />
                                Guardar
                              </>
                            )}
                          </UiButton>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Dirección (Calle y Número)
                      </Label>
                      {!editingAddress ? (
                        <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                          {essay?.client?.address?.address || "—"}
                        </div>
                      ) : (
                        <Input
                          value={addressForm.address}
                          onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
                          placeholder="Calle y número"
                          className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Localidad / Ciudad
                      </Label>
                      {!editingAddress ? (
                        <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                          {essay?.client?.address?.location || "—"}
                        </div>
                      ) : (
                        <Input
                          value={addressForm.location}
                          onChange={(e) => setAddressForm((f) => ({ ...f, location: e.target.value }))}
                          placeholder="Ciudad / Localidad"
                          className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Provincia
                      </Label>
                      {!editingAddress ? (
                        <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                          {getDistrictDisplay(essay?.client?.address?.district ?? essay?.client?.address?.province, districts) || "—"}
                        </div>
                      ) : (
                        <select
                          value={mapProvinceCodeToDistrictId(addressForm.district, districts) || ""}
                          onChange={(e) => setAddressForm((f) => ({ ...f, district: e.target.value.trim() }))}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Seleccionar provincia...</option>
                          {(districts || []).map((d) => {
                            const cleanId = String(d.id).trim();
                            return (
                              <option key={cleanId} value={cleanId}>
                                {d.name}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </UiCard>

              {/* 4. Representante Legal */}
              {isLegalEntity && (essay?.client?.representative || editingRep) && (
                <UiCard className="shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                        <UserCheck className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Representante Legal
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Apoderado o autoridad legal facultada para suscribir acuerdos y contratos.
                        </CardDescription>
                      </div>
                    </div>

                    {!!essay?.client && (
                      <div>
                        {!editingRep ? (
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={startEditRep}
                            className="h-8 text-xs font-medium"
                          >
                            <Pencil className="size-3.5 mr-1.5" />
                            Editar
                          </UiButton>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UiButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelRep}
                              disabled={savingSegment === "rep"}
                              className="h-8 text-xs font-medium"
                            >
                              <X className="size-3.5 mr-1.5" />
                              Cancelar
                            </UiButton>
                            <UiButton
                              type="button"
                              size="sm"
                              onClick={handleSaveRep}
                              disabled={savingSegment === "rep"}
                              className="h-8 text-xs font-medium"
                            >
                              {savingSegment === "rep" ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Save className="size-3.5 mr-1.5" />
                                  Guardar
                                </>
                              )}
                            </UiButton>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Nombre Completo
                        </Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.representative?.name || "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.name}
                            onChange={(e) => setRepForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Nombre y apellido"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          DNI
                        </Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.representative?.dni ? formatDni(essay.client.representative.dni) : "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.dni}
                            onChange={(e) => setRepForm((f) => ({ ...f, dni: e.target.value }))}
                            placeholder="DNI del representante"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </UiCard>
              )}

              {/* 5. Ficha del Solicitante */}
              {(essay?.client?.contact || editingContact) && (
                <UiCard className="shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                        <UserRound className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Ficha del Solicitante
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Persona de contacto directo designada para el seguimiento del ensayo.
                        </CardDescription>
                      </div>
                    </div>

                    {!!essay?.client && (
                      <div>
                        {!editingContact ? (
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={startEditContact}
                            className="h-8 text-xs font-medium"
                          >
                            <Pencil className="size-3.5 mr-1.5" />
                            Editar
                          </UiButton>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UiButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelContact}
                              disabled={savingSegment === "contact"}
                              className="h-8 text-xs font-medium"
                            >
                              <X className="size-3.5 mr-1.5" />
                              Cancelar
                            </UiButton>
                            <UiButton
                              type="button"
                              size="sm"
                              onClick={handleSaveContact}
                              disabled={savingSegment === "contact"}
                              className="h-8 text-xs font-medium"
                            >
                              {savingSegment === "contact" ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Save className="size-3.5 mr-1.5" />
                                  Guardar
                                </>
                              )}
                            </UiButton>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Nombre Completo</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.contact?.name || "—"}
                          </div>
                        ) : (
                          <Input
                            value={contactForm.name}
                            onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Nombre y apellido"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.contact?.dni ? formatDni(essay.client.contact.dni) : "—"}
                          </div>
                        ) : (
                          <Input
                            value={contactForm.dni}
                            onChange={(e) => setContactForm((f) => ({ ...f, dni: e.target.value }))}
                            placeholder="Documento nacional de identidad"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Teléfono</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {(() => {
                              const p = essay?.client?.contact?.phone;
                              if (!p) return "—";
                              if (typeof p === "object") return p.phone ? `+${p.country_code || "54"} ${p.phone}` : "—";
                              return p;
                            })()}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={contactForm.phone?.country_code || "54"}
                              onChange={(e) =>
                                setContactForm((p) => ({
                                  ...p,
                                  phone: {
                                    ...(p.phone || {}),
                                    country_code: e.target.value,
                                  },
                                }))
                              }
                              className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring"
                            >
                              {(countries || []).map((c) => (
                                <option key={c.id || c.country_code} value={String(c.country_code).trim()}>
                                  +{String(c.country_code).trim()}
                                </option>
                              ))}
                              {(!countries || countries.length === 0) && <option value="54">+54</option>}
                            </select>
                            <Input
                              type="tel"
                              value={contactForm.phone?.phone || ""}
                              onChange={(e) =>
                                setContactForm((p) => ({
                                  ...p,
                                  phone: {
                                    country_code: p.phone?.country_code || "54",
                                    phone: e.target.value.replace(/[^\d\s-]/g, ""),
                                  },
                                }))
                              }
                              placeholder="11 2345-6789"
                              className="h-9 text-xs flex-1 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Email de Contacto</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.contact?.mail || "—"}
                          </div>
                        ) : (
                          <Input
                            type="email"
                            value={contactForm.mail}
                            onChange={(e) => setContactForm((f) => ({ ...f, mail: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Dirección</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.contact?.address || "—"}
                          </div>
                        ) : (
                          <Input
                            value={contactForm.address}
                            onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))}
                            placeholder="Calle y número"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Localidad</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay?.client?.contact?.location || "—"}
                          </div>
                        ) : (
                          <Input
                            value={contactForm.location}
                            onChange={(e) => setContactForm((f) => ({ ...f, location: e.target.value }))}
                            placeholder="Ciudad / Localidad"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-medium text-muted-foreground">Provincia</Label>
                        {!editingContact ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {getDistrictDisplay(essay?.client?.contact?.district, districts) || "—"}
                          </div>
                        ) : (
                          <select
                            value={mapProvinceCodeToDistrictId(contactForm.district, districts) || ""}
                            onChange={(e) => setContactForm((f) => ({ ...f, district: e.target.value.trim() }))}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                          >
                            <option value="">Seleccionar provincia...</option>
                            {(districts || []).map((d) => {
                              const cleanId = String(d.id).trim();
                              return (
                                <option key={cleanId} value={cleanId}>
                                  {d.name}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">País</Label>
                        <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                          {typeof essay?.client?.contact?.country === "object"
                            ? essay.client.contact.country?.name
                            : essay?.client?.contact?.country || "Argentina"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </UiCard>
              )}

              {/* 6. Datos de Facturación */}
              {(essay?.client?.billing != null || editingBilling) && (
                <UiCard className="shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                        <Receipt className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Datos de Facturación
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Información impositiva y domicilio fiscal para facturación del servicio.
                        </CardDescription>
                      </div>
                    </div>

                    {!!essay?.client && (
                      <div>
                        {!editingBilling ? (
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={startEditBilling}
                            className="h-8 text-xs font-medium"
                          >
                            <Pencil className="size-3.5 mr-1.5" />
                            Editar
                          </UiButton>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UiButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelBilling}
                              disabled={savingSegment === "billing"}
                              className="h-8 text-xs font-medium"
                            >
                              <X className="size-3.5 mr-1.5" />
                              Cancelar
                            </UiButton>
                            <UiButton
                              type="button"
                              size="sm"
                              onClick={handleSaveBilling}
                              disabled={savingSegment === "billing"}
                              className="h-8 text-xs font-medium"
                            >
                              {savingSegment === "billing" ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Save className="size-3.5 mr-1.5" />
                                  Guardar
                                </>
                              )}
                            </UiButton>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          CUIT de Facturación
                        </Label>
                        {!editingBilling ? (
                          <div className="text-xs font-mono font-medium text-foreground min-h-[36px] flex items-center">
                            {essay.client.billing?.cuit ? formatCuit(essay.client.billing.cuit) : "—"}
                          </div>
                        ) : (
                          <Input
                            value={billingForm.cuit}
                            onChange={(e) => setBillingForm((f) => ({ ...f, cuit: e.target.value }))}
                            placeholder="XX-XXXXXXXX-X"
                            className="text-xs h-9 font-mono border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Dirección Fiscal
                        </Label>
                        {!editingBilling ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay.client.billing?.address || "—"}
                          </div>
                        ) : (
                          <Input
                            value={billingForm.address}
                            onChange={(e) => setBillingForm((f) => ({ ...f, address: e.target.value }))}
                            placeholder="Calle y número de facturación"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Localidad Fiscal
                        </Label>
                        {!editingBilling ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay.client.billing?.location || "—"}
                          </div>
                        ) : (
                          <Input
                            value={billingForm.location}
                            onChange={(e) => setBillingForm((f) => ({ ...f, location: e.target.value }))}
                            placeholder="Ciudad / Localidad"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Provincia Fiscal
                        </Label>
                        {!editingBilling ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {getDistrictDisplay(essay?.client?.billing?.province, districts) || "—"}
                          </div>
                        ) : (
                          <select
                            value={mapProvinceCodeToDistrictId(billingForm.district, districts) || ""}
                            onChange={(e) => setBillingForm((f) => ({ ...f, district: e.target.value.trim() }))}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                          >
                            <option value="">Seleccionar provincia...</option>
                            {(districts || []).map((d) => {
                              const cleanId = String(d.id).trim();
                              return (
                                <option key={cleanId} value={cleanId}>
                                  {d.name}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Condición frente al IVA
                        </Label>
                        {!editingBilling ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {essay.client.billing?.paysIva != null
                              ? essay.client.billing.paysIva
                                ? "Responsable Inscripto (Paga IVA)"
                                : "Consumidor Final / Exento"
                              : "—"}
                          </div>
                        ) : (
                          <div className="min-h-[36px] flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="billingPaysIvaCheckEssay"
                              checked={!!billingForm.paysIva}
                              disabled={savingSegment === "billing"}
                              onChange={(e) => setBillingForm((p) => ({ ...p, paysIva: e.target.checked }))}
                              className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label
                              htmlFor="billingPaysIvaCheckEssay"
                              className="text-xs font-medium cursor-pointer text-foreground"
                            >
                              Responsable Inscripto (Paga IVA)
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </UiCard>
              )}
            </div>
          )}

          {activeId === "samples" && (
            <div className="space-y-6">
              {!essay?.workOrder ? (
                <ActionPlaceholderCard
                  legend="Recibir muestras"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>}
                  onClick={() => setShowReceiveSamplesModal(true)}
                />
              ) : (
                <>
                  {isLaboratory && essay?.workOrder?.id && (
                    <div className="flex justify-end mb-4">
                      <UiButton type="button" variant="outline" size="sm" onClick={() => navigate(`/samples/${essay.workOrder.id}`)}>
                        Ver orden de trabajo
                      </UiButton>
                    </div>
                  )}

                  {isLaboratory && essay?.workOrder?.id && (
                    <WorkOrderCard workOrder={essay?.workOrder} variant="detail" />
                  )}

                  <UiCard className="shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                        <Layers className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Probetas Analizadas
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Resultados analíticos y mediciones dimensionales registradas para el ensayo.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <StyledTable
                        columns={samplesColumns}
                        data={essay?.workOrder?.samples || []}
                        emptyMessage="No hay muestras analizadas aún."
                      />
                    </CardContent>
                  </UiCard>
                </>
              )}
            </div>
          )}

          {activeId === "documentation" && (
            <div className="space-y-4">
              {isLaboratory && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Documentación oficial emitida con respaldo de autenticidad y fecha cierta.
                  </p>
                  <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reissueRequestLoading}
                    onClick={() => setShowReissueRequestModal(true)}
                  >
                    <FileCheck className="size-4 mr-1.5" />
                    {reissueRequestLoading ? "Re-emitiendo..." : "Re-emitir solicitud (F-PC13-01)"}
                  </UiButton>
                </div>
              )}
              <StyledTable
                columns={[
                  {
                    header: "Documento",
                    className: "font-medium whitespace-normal",
                    render: (doc, index) => doc.typeDocument?.name || `Documento ${index + 1}`,
                  },
                  { header: "Código", render: (doc) => doc?.typeDocument?.code || "—" },
                  { header: "Copia", render: (doc) => (doc.copy !== undefined ? doc.copy : "—") },
                  {
                    header: "Modificación",
                    render: (doc) => {
                      const isMod = doc.modificated !== undefined ? doc.modificated : doc.modified;
                      const isModBool = Boolean(isMod === true || isMod === "true" || isMod === 1);
                      return isMod === undefined || isMod === null ? (
                        "—"
                      ) : isModBool ? (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-xs">
                          Sí
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      );
                    },
                  },
                  {
                    header: "Fecha",
                    render: (doc) =>
                      doc.generated_at ? new Date(doc.generated_at).toLocaleDateString("es-AR") : "—",
                  },
                  {
                    header: "",
                    className: "text-right",
                    render: (doc) => (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={async (event) => {
                            event.stopPropagation();
                            try {
                              await documentsService.download(doc.id, doc.name, () =>
                                showSuccessToast("Descarga iniciada."),
                              );
                            } catch (error) {
                              console.error("Error al descargar el documento:", error);
                              showErrorToast(error?.message || "Error al descargar el documento.");
                            }
                          }}
                        >
                          Descargar
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleValidateDocument(doc);
                          }}
                          title="Verificar autenticidad y fecha del documento"
                        >
                          <ShieldCheck className="size-4" />
                          <span>Validar</span>
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={essay?.documents || []}
                emptyMessage="No hay documentación disponible."
              />
            </div>
          )}

          {activeId === "history" && (
            <div className="space-y-4">
              <StyledTable
                columns={auditLogsColumns}
                data={essay?.auditLogs || []}
                emptyMessage="No hay historial de acciones disponible."
                onRowClick={(log) => {
                  setSelectedAuditLog(log);
                  setShowAuditLogModal(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <CreateContractModal
        show={showContractModal}
        onClose={() => setShowContractModal(false)}
        essayId={id}
        onSuccess={handleGenerateContract}
      />
      <ReceiveSamplesModal
        show={showReceiveSamplesModal}
        onClose={() => setShowReceiveSamplesModal(false)}
        onSuccess={refreshEssay}
        initialEssayId={id}
      />
      <AcceptEssayConfirmModal
        show={showAcceptConfirmModal}
        onClose={() => setShowAcceptConfirmModal(false)}
        essay={essay}
        onConfirm={handleAccept}
        loading={actionLoading}
      />
      <CancelEssayModal
        show={showCancelEssayModal}
        onClose={() => setShowCancelEssayModal(false)}
        onCancelEssay={handleCancelEssay}
        loading={actionLoading}
      />
      <RejectEssayModal
        show={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
        loading={actionLoading}
      />
      <EmitReportModal
        show={showEmitFirstReportModal}
        onClose={() => (!emittingFirstReport ? setShowEmitFirstReportModal(false) : null)}
        onConfirm={handleEmitFirstReport}
        loading={emittingFirstReport}
      />
      <ReEmitReportModal
        show={showReEmitReportModal}
        onClose={() => setShowReEmitReportModal(false)}
        emissionType={reportEmissionType}
        onConfirm={handleReEmitReport}
        loading={reEmitLoading}
      />
      <ReissueRequestModal
        show={showReissueRequestModal}
        onClose={() => setShowReissueRequestModal(false)}
        onConfirm={handleReissueRequest}
        loading={reissueRequestLoading}
      />
      <SnapshotVerificationModal
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verificationData={selectedVerification}
        loading={verifyingSnapshot}
        onDownloadOts={handleDownloadOtsProof}
        isLaboratory={isLaboratory}
      />
      <AuditLogDetailModal
        show={showAuditLogModal}
        onClose={() => {
          setShowAuditLogModal(false);
          setSelectedAuditLog(null);
        }}
        log={selectedAuditLog}
        isLaboratory={isLaboratory}
      />
    </div>
  );
}

