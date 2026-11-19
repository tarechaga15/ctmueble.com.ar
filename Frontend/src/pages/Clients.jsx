import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataCache } from "../context/DataCacheContext";
import { clientsService } from "../services/clientsService";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import ErrorAlert from "../components/ErrorAlert";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import Modal from "../components/Modal";
import CreateClientModal from "../components/modals/CreateClientModal";
import { formatCuit } from "../components/steps/client-creation/BussinessSearch";
import { getDistrictDisplay } from "@/lib/districtUtils";

function clientAddress(client, districts) {
  const address = client?.address;
  if (!address) return "—";
  const province = getDistrictDisplay(address.province ?? address.district, districts);
  return [address.address, address.location, province].filter((v) => v && v !== "—" && v !== "N/A").join(", ") || "—";
}

function clientContact(client) {
  if (Array.isArray(client?.contacts) && client.contacts.length > 0) {
    const names = client.contacts.map((c) => c.name).filter(Boolean);
    if (names.length > 0) {
      return names.join(", ");
    }
  }
  const contact = client?.contact;
  if (!contact?.name) return "—";
  return contact.mail ? `${contact.name} (${contact.mail})` : contact.name;
}

const getClientColumns = (districts) => [
  { header: "Nombre", className: "font-medium whitespace-normal", render: (client) => client.name || "—" },
  { header: "CUIT", render: (client) => (client.cuit ? formatCuit(client.cuit) : "—") },
  { header: "Domicilio", className: "whitespace-normal", render: (client) => clientAddress(client, districts) },
  { header: "Solicitantes", className: "whitespace-normal", render: clientContact },
];

export default function Clients() {
  const { user } = useAuth();
  const { clients, loadClients, refreshClients, districts, loadDistricts } = useDataCache();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const isLaboratory = user?.profile === "LABORATORY";

  useEffect(() => {
    const load = async () => {
      if (user != null) {
        try {
          setLoading(true);
          setError(null);
          await Promise.all([loadClients(), !districts ? loadDistricts?.() : Promise.resolve()]);
        } catch (err) {
          console.error(err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [user, loadClients]);

  const listToRender = searchResults ?? clients ?? [];

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title={isLaboratory ? "Clientes agendados" : "Clientes representados"}
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            {isLaboratory ? "Crear cliente" : "Nuevo cliente representado"}
          </Button>
        }
      />

      {isLaboratory && (
        <div className="mb-4">
          <SearchBar
            placeholder="Buscar cliente por nombre o CUIT..."
            statusOptions={[]}
            onSearch={async (text) => {
              const term = (text || "").trim();
              if (!term) {
                setSearchResults(null);
                return;
              }
              try {
                setSearchLoading(true);
                setError(null);
                const results = await clientsService.search(term);
                setSearchResults(results);
              } catch (err) {
                console.error(err);
                setError("No se pudo buscar el cliente.");
              } finally {
                setSearchLoading(false);
              }
            }}
            disabled={searchLoading || loading}
          />
        </div>
      )}

      {error && !loading ? (
        <ErrorAlert
          message={
            error?.response?.data?.error ||
            error?.message ||
            (typeof error === "string" ? error : "Error al cargar clientes.")
          }
        />
      ) : (
        <StyledTable
          columns={getClientColumns(districts)}
          data={listToRender}
          isLoading={loading || searchLoading}
          onRowClick={(client) => client?.id && navigate(`/clients/${client.id}`)}
          emptyMessage={isLaboratory ? "No tenés clientes agendados" : "No tenés clientes representados"}
        />
      )}

      {showCreateModal && (
        <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} bare wide>
          <CreateClientModal onCancel={() => setShowCreateModal(false)} onCreated={() => {
            setShowCreateModal(false);
            refreshClients().then(() => {}).catch(() => {});
          }} />
        </Modal>
      )}
    </div>
  );
}
