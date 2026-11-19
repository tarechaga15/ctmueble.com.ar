import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataCache } from "../context/DataCacheContext";
import { Download, Plus, X } from "lucide-react";
import SearchBar from "../components/SearchBar";
import StatusFilterNav from "../components/StatusFilterNav";
import FilterModal from "../components/modals/FilterModal";
import CustomizeColumnsModal from "../components/modals/CustomizeColumnsModal";
import StyledTable from "../components/StyledTable";
import StatusBadge from "../components/StatusBadge";
import ErrorAlert from "../components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { essaysService } from "../services/essaysService";
import RefreshButton from "../components/buttons/Refresh";
import ExportEssaysModal from "../components/modals/ExportEssaysModal";
import EssayRequestModal from "../components/modals/EssayRequestModal";

const ESSAY_STATUS = {
  REQUESTED: { text: "Solicitado", color: "#a16207", background: "#fef3c7" },
  ACCEPTED: { text: "Aceptado", color: "#1d4ed8", background: "#dbeafe" },
  REJECTED: { text: "Rechazado", color: "#b91c1c", background: "#fee2e2" },
  SERVICE_AGREEMENT_MADED: { text: "Contrato generado", color: "#7e22ce", background: "#f3e8ff" },
  IN_WORK: { text: "En proceso", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { text: "Completado", color: "#15803d", background: "#dcfce7" },
  CANCELLED: { text: "Cancelado", color: "#b91c1c", background: "#fee2e2" },
};

const STATUS_TABS = [
  { id: null, label: "Todos" },
  { id: "REQUESTED", label: "Solicitado" },
  { id: "ACCEPTED", label: "Aceptado" },
  { id: "REJECTED", label: "Rechazado" },
  { id: "SERVICE_AGREEMENT_MADED", label: "Contrato generado" },
  { id: "IN_WORK", label: "En proceso" },
  { id: "COMPLETED", label: "Completado" },
  { id: "CANCELLED", label: "Cancelado" },
];

const ESSAY_CONFIGURABLE_COLUMNS = [
  { id: "element", label: "Elemento", description: "Producto / elemento a ensayar", defaultVisible: true },
  { id: "type", label: "Tipo", description: "Tipo de ensayo solicitado", defaultVisible: false },
  { id: "applicant", label: "Solicitante", description: "Persona física o contacto solicitante", defaultVisible: true },
  { id: "client", label: "Cliente", description: "Empresa o titular del ensayo", defaultVisible: true },
];

const DEFAULT_ESSAY_COLUMNS = {
  element: true,
  type: false,
  applicant: true,
  client: true,
};

function getInitialEssayColumns() {
  try {
    const saved = localStorage.getItem("ctm_essay_columns");
    if (saved) {
      return { ...DEFAULT_ESSAY_COLUMNS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading essay columns from localStorage:", e);
  }
  return DEFAULT_ESSAY_COLUMNS;
}

function formatDateChip(val) {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return val;
}

export default function Essays({ isClientView = false }) {
  const { user } = useAuth();
  const { refreshEssays } = useDataCache();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar estado desde query string si existe (ej. ?status=REQUESTED)
  const initialStatusFromUrl = searchParams.get("status");

  // Filtros
  const [statusFilter, setStatusFilter] = useState(initialStatusFromUrl || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    client: "",
  });

  // Columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(getInitialEssayColumns);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [altaOpen, setAltaOpen] = useState(false);

  const isLaboratory = user?.profile === "LABORATORY";

  // Actualizar filtro si cambia en URL
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus !== null) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await essaysService.fetch();
      setEssays(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveColumns = (newCols) => {
    setVisibleColumns(newCols);
    try {
      localStorage.setItem("ctm_essay_columns", JSON.stringify(newCols));
    } catch (e) {
      console.error("Error saving essay columns to localStorage:", e);
    }
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_ESSAY_COLUMNS);
    try {
      localStorage.removeItem("ctm_essay_columns");
    } catch (e) {
      console.error("Error resetting essay columns in localStorage:", e);
    }
  };

  // Lista de sugerencias para clientes / solicitantes a partir de los datos cargados
  const clientSuggestions = useMemo(() => {
    const set = new Set();
    essays.forEach((e) => {
      if (e.client?.name) set.add(e.client.name);
      if (e.client?.contact?.name) set.add(e.client.contact.name);
      if (e.client?.representative?.name) set.add(e.client.representative.name);
      if (e.contact?.name) set.add(e.contact.name);
      if (e.client?.cuit) set.add(e.client.cuit);
    });
    return Array.from(set).filter(Boolean);
  }, [essays]);

  // Pestañas con conteo numérico de ensayos por estado
  const statusTabsWithCounts = useMemo(() => {
    return STATUS_TABS.map((tab) => {
      let count;
      if (tab.id === null) {
        count = essays.length;
      } else {
        count = essays.filter((e) => e.status === tab.id).length;
      }
      return { ...tab, count };
    });
  }, [essays]);

  // Filtrado de ensayos
  const filteredEssays = useMemo(() => {
    return essays.filter((e) => {
      // 1. Estado
      if (statusFilter !== null && e.status !== statusFilter) {
        return false;
      }

      // 2. Búsqueda por texto (código, cliente, solicitante, cuit, elemento, tipo)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (e.code || "").toString().toLowerCase();
        const clientName = (e.client?.name || "").toString().toLowerCase();
        const contactName = (e.client?.contact?.name || e.contact?.name || "").toString().toLowerCase();
        const repName = (e.client?.representative?.name || "").toString().toLowerCase();
        const cuit = (e.client?.cuit || "").toString().toLowerCase();
        const element = (e.elements?.product || "").toString().toLowerCase();
        const typeName = (e.type?.name || (typeof e.type === "string" ? e.type : "")).toString().toLowerCase();

        const matches =
          code.includes(q) ||
          clientName.includes(q) ||
          contactName.includes(q) ||
          repName.includes(q) ||
          cuit.includes(q) ||
          element.includes(q) ||
          typeName.includes(q);

        if (!matches) return false;
      }

      // 3. Fecha desde
      if (advancedFilters.dateFrom) {
        const d = e.requestDate ? new Date(e.requestDate).toISOString().slice(0, 10) : "";
        if (!d || d < advancedFilters.dateFrom) return false;
      }

      // 4. Fecha hasta
      if (advancedFilters.dateTo) {
        const d = e.requestDate ? new Date(e.requestDate).toISOString().slice(0, 10) : "";
        if (!d || d > advancedFilters.dateTo) return false;
      }

      // 5. Filtro de cliente / solicitante desde modal
      if (advancedFilters.client.trim()) {
        const cq = advancedFilters.client.toLowerCase().trim();
        const clientName = (e.client?.name || "").toString().toLowerCase();
        const contactName = (e.client?.contact?.name || e.contact?.name || "").toString().toLowerCase();
        const repName = (e.client?.representative?.name || "").toString().toLowerCase();
        const cuit = (e.client?.cuit || "").toString().toLowerCase();

        const matchesClient =
          clientName.includes(cq) ||
          contactName.includes(cq) ||
          repName.includes(cq) ||
          cuit.includes(cq);

        if (!matchesClient) return false;
      }

      return true;
    });
  }, [essays, statusFilter, searchQuery, advancedFilters]);

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

  // Columnas dinámicas de acuerdo con la personalización
  const columns = useMemo(() => {
    const cols = [
      { header: "Código", className: "font-medium", render: (essay) => essay.code || "—" },
      { header: "Estado", render: (essay) => <StatusBadge status={essay.status} map={ESSAY_STATUS} /> },
    ];

    if (visibleColumns.client) {
      cols.push({
        header: "Cliente",
        render: (essay) => essay.client?.name || "—",
      });
    }

    if (visibleColumns.applicant) {
      cols.push({
        header: "Solicitante",
        render: (essay) =>
          essay.contact?.name ||
          essay.client?.contact?.name ||
          essay.client?.representative?.name ||
          "—",
      });
    }

    if (visibleColumns.type) {
      cols.push({
        header: "Tipo",
        render: (essay) => essay.type?.name || (typeof essay.type === "string" ? essay.type : "—"),
      });
    }

    if (visibleColumns.element) {
      cols.push({
        header: "Elemento",
        render: (essay) => essay.elements?.product || "—",
      });
    }

    cols.push({
      header: "Fecha",
      render: (essay) => (essay.requestDate ? new Date(essay.requestDate).toLocaleDateString("es-AR") : "—"),
    });

    return cols;
  }, [visibleColumns]);

  const pageTitle = isLaboratory && !isClientView ? "Solicitudes de ensayo" : "Mis solicitudes";

  return (
    <div className="space-y-4">
      <PageHeader
        title={pageTitle}
        subtitle={
          isLaboratory && !isClientView
            ? "Gestión y seguimiento de todas las solicitudes de ensayo del laboratorio"
            : "Consulta el estado y seguimiento de tus solicitudes"
        }
        actions={
          <>
            <Button variant="outline" disabled={loading} onClick={() => setExportModalOpen(true)}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <RefreshButton onClick={fetchData} disabled={loading} />
            <Button onClick={() => setAltaOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear solicitud
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
          placeholder="Buscar por código, cliente o solicitante..."
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
              title="Error al cargar las solicitudes"
              message={
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo conectar con el servidor."
              }
            />
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  refreshEssays()
                    .then(setEssays)
                    .catch((err) => {
                      setError(err);
                    })
                    .finally(() => setLoading(false));
                }}
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          <StyledTable
            columns={columns}
            data={filteredEssays}
            isLoading={loading}
            onRowClick={(essay) => essay?.id && navigate(`/essay/${essay.id}`)}
            emptyMessage={
              statusFilter || searchQuery || activeAdvancedFilterCount > 0
                ? "No hay solicitudes que coincidan con los filtros seleccionados."
                : "No tenés solicitudes de ensayo aún."
            }
          />
        )}
      </div>

      {/* Modal para personalizar columnas */}
      <CustomizeColumnsModal
        show={columnsModalOpen}
        onClose={() => setColumnsModalOpen(false)}
        columns={ESSAY_CONFIGURABLE_COLUMNS}
        visibleColumns={visibleColumns}
        onSave={handleSaveColumns}
        onReset={handleResetColumns}
        title="Personalizar columnas de solicitudes"
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
        statusOptions={STATUS_TABS.map((tab) => ({
          value: tab.id,
          label: tab.label,
        }))}
        clientSuggestions={clientSuggestions}
        title="Filtros de solicitudes"
      />

      <ExportEssaysModal
        show={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        initialCode={searchQuery}
        initialStatus={statusFilter}
        statusOptions={STATUS_TABS.map((tab) => ({
          value: tab.id,
          label: tab.label,
        }))}
      />

      <EssayRequestModal
        show={altaOpen}
        onClose={() => setAltaOpen(false)}
        onCreated={(essay) => {
          setAltaOpen(false);
          if (essay?.id) navigate(`/essay/${essay.id}`);
        }}
      />
    </div>
  );
}
