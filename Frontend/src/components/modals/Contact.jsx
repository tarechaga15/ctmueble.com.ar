import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import Modal from "../Modal";
import Tabs from "../Tabs";
import StyledTable from "../StyledTable";
import { contactsService } from "../../services/contactsService";

export default function ContactModal({ show, onClose, onSelect }) {
    const [contacts, setContacts] = useState([]);
    const [showModal, setShowModal] = useState(show);
    const [mode, setMode] = useState("select");
    const [contact, setContact] = useState({name: "", mail: "", phone: "", address: "", location: "", province: ""});
    useEffect(() => {
        setShowModal(show);
        setMode("select");
        setContact({name: "", mail: "", phone: "", address: "", location: "", province: ""});
        contactsService.fetch().then((response) => {
            setContacts(response);
        });
    }, [show]);
    const createContact = () => {
        contactsService.create(contact).then((response) => {
            console.log("response", response);
            onSelect(response);
        });
    };
    const handleContactChange = ({key, value}) => {
        setContact((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    return (
        <Modal show={showModal} onClose={onClose}>
            <div>
            <div className="mb-4">
                <Tabs
                    tabs={[
                        { id: "select", label: "Buscar en agenda", icon: Search },
                        { id: "create", label: "Crear nuevo", icon: Plus },
                    ]}
                    activeTab={mode === "create" ? 1 : 0}
                    setActiveTab={(index) => setMode(index === 1 ? "create" : "select")}
                />
            </div>
            {mode === "select" && (
                <>
                <div>
                    <h2 className="text-lg font-bold mb-4">Buscar contacto en agenda</h2>
                    <input type="text" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Buscar contacto" />
                    <button className="btn btn-primary w-[-webkit-fill-available]" onClick={onClose}>Buscar</button>
                </div>
                <StyledTable
                    columns={[
                        { header: "Nombre", className: "font-medium", render: (item) => item.name || "—" },
                        { header: "Correo", render: (item) => item.mail || "—" },
                        { header: "Teléfono", render: (item) => item.phone || "—" },
                    ]}
                    data={contacts}
                    onRowClick={(item) => onSelect(item)}
                    emptyMessage="No hay contactos en la agenda."
                />
                </>
            )}
            {mode === "create" && (
                <>
                <div>
                    <h2 className="text-lg font-bold mb-4">Crear nuevo contacto</h2>
                    <input type="text" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Nombre" onChange={({target}) => handleContactChange({key: "name", value: target.value})} />
                    <input type="email" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Email" onChange={({target}) => handleContactChange({key: "mail", value: target.value})} />
                    <input type="tel" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Teléfono" onChange={({target}) => handleContactChange({key: "phone", value: target.value})} />
                    <input type="text" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Dirección" onChange={({target}) => handleContactChange({key: "address", value: target.value})} />
                    <input type="text" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Localidad" onChange={({target}) => handleContactChange({key: "location", value: target.value})} />
                    <input type="text" className="input input-bordered w-[-webkit-fill-available] mb-4" placeholder="Provincia" onChange={({target}) => handleContactChange({key: "province", value: target.value})} />
                </div>
                <button className="btn btn-primary w-[-webkit-fill-available]" onClick={createContact}>Crear</button>
                </>
            )}
            </div>
        </Modal>
    );
}