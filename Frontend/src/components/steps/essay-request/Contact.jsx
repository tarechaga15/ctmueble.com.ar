import { useState, useEffect } from "react";
import ContactModal from "../../modals/Contact";
import { bussinessService } from "../../../services/bussinessService";
export default function Contact({ data, onChange }) {
    const [localData, setLocalData] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setLocalData(data);
    }, [data]);


    const handleSelect = (contact) => {
        setLocalData(contact);
        onChange({key: "contact", data: contact});
        setShowModal(false);
    };
    const handleChange = ({key, value}) => {
        setLocalData((prev) => ({
            ...prev,
            [key]: value,
        }));
        onChange({key: "contact", data: { ...localData, [key]: value }});
    };

    const [billingAddresses, setBillingAddresses] = useState([]);
    useEffect(() => {
        if(localData.billing_cuit != null) {
            if(localData.billing_cuit.length == 11) {
                bussinessService.getPadron(localData.billing_cuit).then((response) => {
                    setBillingAddresses(response.addresses);
                });
                
            }
        }
    }, [localData.billing_cuit]);
    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Contacto</h3>
            <button className="btn btn-primary w-[-webkit-fill-available]" onClick={() => setShowModal(true)}>Buscar contacto en agenda</button>
            <ContactModal show={showModal} onClose={() => setShowModal(false)} onSelect={handleSelect} />
            <div className="grid grid-cols-2 gap-[10px]">
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Nombre</label>
                    <input type="text" name="name" className="input input-bordered w-[-webkit-fill-available]" value={localData.name || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Email</label>
                    <input type="email" name="mail" className="input input-bordered w-[-webkit-fill-available]" value={localData.mail || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Teléfono</label>
                    <input type="tel" name="phone" className="input input-bordered w-[-webkit-fill-available]" value={localData.phone || ""} onChange={handleChange} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Dirección</label>
                    <input type="text" placeholder="Dirección" name="address" className="input input-bordered w-[-webkit-fill-available]" value={localData.address || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Localidad</label>
                    <input type="text" placeholder="Localidad" name="location" className="input input-bordered w-[-webkit-fill-available]" value={localData.location || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Provincia</label>
                    <input type="text" placeholder="Provincia" name="province" className="input input-bordered w-[-webkit-fill-available]" value={localData.province || ""} onChange={handleChange} />
                </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Datos de facturación</h3>
            <div className="grid grid-cols-2 gap-[10px]">
                <div className="mb-3">
                    <label className="block mb-2 font-bold">CUIT</label>
                    <input type="text" placeholder="CUIT" name="cuit" className="input input-bordered w-[-webkit-fill-available]" value={localData.billing_cuit} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="block mb-2 font-bold">Domicilio</label>
                    <select type="text" placeholder="CUIT" name="cuit" className="input input-bordered w-[-webkit-fill-available]" value={localData.billing_address} onChange={handleChange} >
                        <option value="">Seleccione un domicilio</option>
                        {billingAddresses.map((address) => (
                            <option value={address.id} key={address.id}>{address.address}, {address.location}, {address.province}</option>
                        ))}
                    </select>
                </div>
            </div>


        </div>
    );
}