import { useState, useEffect } from "react";
import { clientsService } from "../../services/clientsService";
import Modal from "../Modal";
import SearchBar from "../SearchBar";
import StyledTable from "../StyledTable";

/**
 * Modal exclusivo para seleccionar un cliente de la agenda (sin pestaña de creación).
 */
export default function ClientModal({ show, onClose, onSelect }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setSearchResults(null);
    setError(null);
    setLoading(true);
    clientsService
      .fetch()
      .then((response) => {
        setClients(response);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los clientes.");
      })
      .finally(() => setLoading(false));
  }, [show]);

  const listToRender = searchResults ?? clients ?? [];

  return (
    <Modal show={show} onClose={onClose} title="Seleccionar cliente">
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Elige un cliente de la agenda para asociar al ensayo.
          </p>
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
            disabled={searchLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {typeof error === "string"
                ? error
                : "Ocurrió un error al buscar clientes."}
            </p>
          )}
        </div>
        <StyledTable
          columns={[
            { header: "Nombre", className: "font-medium whitespace-normal", render: (client) => client.name || "—" },
            { header: "CUIT", render: (client) => client.cuit || "—" },
            {
              header: "Contacto",
              className: "whitespace-normal",
              render: (client) => client.contact?.name || "—",
            },
          ]}
          data={listToRender}
          isLoading={loading || searchLoading}
          onRowClick={(client) => onSelect(client)}
          emptyMessage={
            searchResults != null ? "Ningún cliente coincide con la búsqueda." : "No hay clientes en la agenda."
          }
        />
      </div>
    </Modal>
  );
}