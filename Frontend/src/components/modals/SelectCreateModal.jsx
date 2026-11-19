import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import Modal from "../Modal";
import Tabs from "../Tabs";

/**
 * Modal genérico con dos pestañas: seleccionar y crear.
 * Se reutiliza para clientes y para plantillas de elementos.
 */
export default function SelectCreateModal({
  show,
  onClose,
  initialMode = "select",
  selectTabLabel = "Buscar",
  createTabLabel = "Crear nuevo",
  renderSelect,
  renderCreate,
}) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (show) {
      setMode(initialMode);
    }
  }, [show, initialMode]);

  return (
    <Modal show={show} onClose={onClose}>
      <div>
        <div className="mb-4">
          <Tabs
            tabs={[
              { id: "select", label: selectTabLabel, icon: Search },
              { id: "create", label: createTabLabel, icon: Plus },
            ]}
            activeTab={mode === "create" ? 1 : 0}
            setActiveTab={(index) => setMode(index === 1 ? "create" : "select")}
          />
        </div>

        {mode === "select"
          ? typeof renderSelect === "function"
            ? renderSelect()
            : null
          : typeof renderCreate === "function"
          ? renderCreate()
          : null}
      </div>
    </Modal>
  );
}

