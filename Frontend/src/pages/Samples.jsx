import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { samplesService } from "../services/samplesService";
import ReceiveSamplesModal from "../components/modals/ReceiveSamplesModal";
import FilterModal from "../components/modals/FilterModal";
import CustomizeColumnsModal from "../components/modals/CustomizeColumnsModal";
import StatusFilterNav from "../components/StatusFilterNav";
import StyledTable from "../components/StyledTable";
import StatusBadge from "../components/StatusBadge";
import SearchBar from "../components/SearchBar";
import ErrorAlert from "../components/ErrorAlert";
import { PackagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import RefreshButton from "../components/buttons/Refresh";

const WORK_ORDER_STATUS = {
  ANALYZING: { text: "En análisis", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { text: "Completada", color: "#15803d", background: "#dcfce7" },
  CANCELLED: { text: "Cancelada", color: "#b91c1c", background: "#fee2e2" },
};

const WORK_ORDER_STATUS_TABS = [
  { id: null, label: "Todos" },
  { id: "ANALYZING", label: "En análisis" },
  { id: "COMPLETED", label: "Completada" },
  { id: "CANCELLED", label: "Cancelada" },
];

const SAMPLE_CONFIGURABLE_COLUMNS = [
  { id: "element", label: "Elemento", description: "Producto / elemento a ensayar", defaultVisible: true },
  { id: "type", label: "Tipo", description: "Tipo de ensayo de la orden", defaultVisible: false },
  { id: "applicant", label: "Solicitante", description: "Contacto o solicitante de la orden", defaultVisible: true },
  { id: "client", label: "Cliente", description: "Empresa o cliente titular", defaultVisible: true },
];

const DEFAULT_SAMPLE_COLUMNS = {
  element: true,
  type: false,
  applicant: true,
  client: true,
};

function getInitialSampleColumns() {
  try {
    const saved = localStorage.getItem("ctm_sample_columns");
    if (saved) {
      return { ...DEFAULT_SAMPLE_COLUMNS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading sample columns from localStorage:", e);
  }
  return DEFAULT_SAMPLE_COLUMNS;
}

function textOf(value) {
  if (!value) return "—";
  if (typeof value === "object") return value.name || "—";
  return String(value);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-AR");
}

function formatDateChip(val) {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return val;
}

export default function Samples() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(getInitialSampleColumns);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    client: "",
  });

  const isLaboratory = user?.profile === "LABORATORY";

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await samplesService.fetchWorkOrders();
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLaboratory) {
      fetchWorkOrders();
    } else if (user != null) {
      setLoading(false);
    }
  }, [isLaboratory, user, fetchWorkOrders]);

  useEffect(() => {
    if (!isLaboratory) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchWorkOrders();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isLaboratory, fetchWorkOrders]);

  const handleSaveColumns = (newCols) => {
    setVisibleColumns(newCols);
    try {
      localStorage.setItem("ctm_sample_columns", JSON.stringify(newCols));
    } catch (e) {
      console.error("Error saving sample columns to localStorage:", e);
    }
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_SAMPLE_COLUMNS);
    try {
      localStorage.removeItem("ctm_sample_columns");
    } catch (e) {
      console.error("Error resetting sample columns in localStorage:", e);
    }
  };

  // Lista de sugerencias de clientes a partir de las órdenes cargadas
  const clientSuggestions = useMemo(() => {
    const set = new Set();
    workOrders.forEach((wo) => {
      if (wo.client_name) set.add(wo.client_name);
      if (wo.client?.name) set.add(wo.client.name);
      if (wo.applicant_name) set.add(wo.applicant_name);
      if (wo.client?.representative) set.add(wo.client.representative);
      if (wo.client?.contact) set.add(wo.client.contact);
      if (wo.client?.cuit) set.add(wo.client.cuit);
    });
    return Array.from(set).filter(Boolean);
  }, [workOrders]);

  // Pestañas con conteo numérico de órdenes por estado
  const statusTabsWithCounts = useMemo(() => {
    return WORK_ORDER_STATUS_TABS.map((tab) => {
      let count;
      if (tab.id === null) {
        count = workOrders.length;
      } else {
        count = workOrders.filter((wo) => wo.status === tab.id).length;
      }
      return { ...tab, count };
    });
  }, [workOrders]);

  // Filtrado de órdenes de trabajo
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      // 1. Estado
      if (statusFilter !== null && wo.status !== statusFilter) {
        return false;
      }

      // 2. Búsqueda por texto (código OT, ensayo, cliente, solicitante, elemento, tipo)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (wo.code || "").toString().toLowerCase();
        const essayCode = (wo.essay_track_code || "").toString().toLowerCase();
        const clientName = (wo.client_name || wo.client?.name || "").toString().toLowerCase();
        const applicantName = (wo.applicant_name || wo.client?.representative || wo.client?.contact || "").toString().toLowerCase();
        const cuit = (wo.client?.cuit || "").toString().toLowerCase();
        const element = (wo.element_to_test || wo.elementToTest || "").toString().toLowerCase();
        const typeName = textOf(wo.essay_type_name || wo.essay_type || wo.type_name || wo.type).toLowerCase();

        const matches =
          code.includes(q) ||
          essayCode.includes(q) ||
          clientName.includes(q) ||
          applicantName.includes(q) ||
          cuit.includes(q) ||
          element.includes(q) ||
          typeName.includes(q);

        if (!matches) return false;
      }

      // 3. Fecha desde (generated_at)
      if (advancedFilters.dateFrom) {
        const d = wo.generated_at ? new Date(wo.generated_at).toISOString().slice(0, 10) : "";
        if (!d || d < advancedFilters.dateFrom) return false;
      }

      // 4. Fecha hasta (generated_at)
      if (advancedFilters.dateTo) {
        const d = wo.generated_at ? new Date(wo.generated_at).toISOString().slice(0, 10) : "";
        if (!d || d > advancedFilters.dateTo) return false;
      }

      // 5. Filtro de cliente / solicitante desde modal
      if (advancedFilters.client.trim()) {
        const cq = advancedFilters.client.toLowerCase().trim();
        const clientName = (wo.client_name || wo.client?.name || "").toString().toLowerCase();
        const applicantName = (wo.applicant_name || wo.client?.representative || wo.client?.contact || "").toString().toLowerCase();
        const cuit = (wo.client?.cuit || "").toString().toLowerCase();

        const matchesClient =
          clientName.includes(cq) ||
          applicantName.includes(cq) ||
          cuit.includes(cq);

        if (!matchesClient) return false;
      }

      return true;
    });
  }, [workOrders, statusFilter, searchQuery, advancedFilters]);

  // Conteo de filtros activos para el botón
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.dateFrom) count++;
    if (advancedFilters.dateTo) count++;
    if (advancedFilters.client.trim()) count++;
    if (statusFilter !== null) count++;
    return count;
  }, [advancedFilters, statusFilter]);

  const hasFilterChips =
    searchQuery.trim() !== "" ||
    advancedFilters.dateFrom !== "" ||
    advancedFilters.dateTo !== "" ||
    advancedFilters.client.trim() !== "";

  const handleApplyFilters = ({ dateFrom, dateTo, client, status }) => {
    setAdvancedFilters({
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      client: client || "",
    });
    setStatusFilter(status);
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      client: "",
    });
    setStatusFilter(null);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      client: "",
    });
  };

  // Construcción de columnas dinámicas según visibleColumns
  const columns = useMemo(() => {
    const cols = [
      { header: "Código", className: "font-medium", render: (order) => order.code || "—" },
      { header: "Estado", render: (order) => <StatusBadge status={order.status} map={WORK_ORDER_STATUS} /> },
      { header: "Ensayo", render: (order) => order.essay_track_code || "—" },
    ];

    if (visibleColumns.client) {
      cols.push({
        header: "Cliente",
        render: (order) => order.client_name || order.client?.name || "—",
      });
    }

    if (visibleColumns.applicant) {
      cols.push({
        header: "Solicitante",
        render: (order) =>
          order.applicant_name ||
          order.client?.contact ||
          order.client?.representative ||
          "—",
      });
    }

    cols.push({
      header: "Generada",
      render: (order) => formatDate(order.generated_at),
    });

    cols.push({
      header: "Muestras",
      render: (order) => order.samples_count ?? order.samplesCount ?? "—",
    });

    if (visibleColumns.element) {
      cols.push({
        header: "Elemento",
        render: (order) => textOf(order.element_to_test ?? order.elementToTest),
      });
    }

    if (visibleColumns.type) {
      cols.push({
        header: "Tipo",
        className: "whitespace-normal",
        render: (order) => textOf(order.essay_type_name || order.essay_type || order.type_name || order.type),
      });
    }

    cols.push({
      header: "Plazo",
      render: (order) => formatDate(order.report_delivery_deadline),
    });

    return cols;
  }, [visibleColumns]);

  if (user != null && !isLaboratory) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4 p-4">
        <p className="text-gray-600 text-center">
          Solo usuarios con perfil Laboratorio pueden acceder a esta sección.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Órdenes de trabajo"
        actions={
          <>
            <RefreshButton onClick={fetchWorkOrders} disabled={loading} />
            <Button onClick={() => setShowReceiveModal(true)}>
              <PackagePlus className="h-4 w-4" />
              Recibir muestras
            </Button>
          </>
        }
      />

      {/* Nav de estados con conteo numérico */}
      <StatusFilterNav
        tabs={statusTabsWithCounts}
        activeStatus={statusFilter}
        onSelectStatus={(st) => setStatusFilter(st)}
      />

      <div className="space-y-3">
        {/* Buscador de texto, botón de filtros y botón de columnas */}
        <SearchBar
          placeholder="Buscar orden por código, ensayo, cliente o solicitante..."
          initialQuery={searchQuery}
          onSearch={(query) => setSearchQuery(query)}
          onChangeQuery={(val) => setSearchQuery(val)}
          onFilterClick={() => setFilterModalOpen(true)}
          activeFilterCount={activeAdvancedFilterCount}
          onColumnsClick={() => setColumnsModalOpen(true)}
          disabled={loading}
        />

        {/* Chips de filtros activos */}
        {hasFilterChips && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
            <span className="text-muted-foreground font-medium mr-1">Filtros aplicados:</span>
            {searchQuery.trim() && (
              <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                <span>Búsqueda: <strong>{searchQuery}</strong></span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Quitar filtro de búsqueda"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.dateFrom && (
              <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                <span>Desde: <strong>{formatDateChip(advancedFilters.dateFrom)}</strong></span>
                <button
                  type="button"
                  onClick={() => setAdvancedFilters((prev) => ({ ...prev, dateFrom: "" }))}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Quitar filtro de fecha desde"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.dateTo && (
              <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                <span>Hasta: <strong>{formatDateChip(advancedFilters.dateTo)}</strong></span>
                <button
                  type="button"
                  onClick={() => setAdvancedFilters((prev) => ({ ...prev, dateTo: "" }))}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Quitar filtro de fecha hasta"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.client.trim() && (
              <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                <span>Cliente: <strong>{advancedFilters.client}</strong></span>
                <button
                  type="button"
                  onClick={() => setAdvancedFilters((prev) => ({ ...prev, client: "" }))}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Quitar filtro de cliente"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar todo
            </Button>
          </div>
        )}

        {error ? (
          <div className="max-w-md mx-auto mt-8 space-y-3">
            <ErrorAlert
              title="Error al cargar las órdenes de trabajo"
              message={
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo conectar con el servidor."
              }
            />
            <div className="flex justify-center">
              <Button onClick={fetchWorkOrders}>Reintentar</Button>
            </div>
          </div>
        ) : (
          <StyledTable
            columns={columns}
            data={filteredWorkOrders}
            isLoading={loading}
            onRowClick={(order) => order?.id && navigate(`/samples/${order.id}`)}
            emptyMessage={
              statusFilter || searchQuery || activeAdvancedFilterCount > 0
                ? "No hay órdenes de trabajo que coincidan con los filtros seleccionados."
                : "No hay órdenes de trabajo registradas."
            }
          />
        )}
      </div>

      {/* Modal para personalizar columnas */}
      <CustomizeColumnsModal
        show={columnsModalOpen}
        onClose={() => setColumnsModalOpen(false)}
        columns={SAMPLE_CONFIGURABLE_COLUMNS}
        visibleColumns={visibleColumns}
        onSave={handleSaveColumns}
        onReset={handleResetColumns}
        title="Personalizar columnas de muestras"
      />

      {/* Modal de filtros avanzados */}
      <FilterModal
        show={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        initialValues={{
          dateFrom: advancedFilters.dateFrom,
          dateTo: advancedFilters.dateTo,
          client: advancedFilters.client,
          status: statusFilter,
        }}
        statusOptions={WORK_ORDER_STATUS_TABS.map((tab) => ({
          value: tab.id,
          label: tab.label,
        }))}
        clientSuggestions={clientSuggestions}
        title="Filtros de muestras"
      />

      <ReceiveSamplesModal
        show={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        onSuccess={() => fetchWorkOrders()}
      />
    </div>
  );
}
