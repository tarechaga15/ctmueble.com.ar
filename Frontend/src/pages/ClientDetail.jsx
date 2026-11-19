import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataCache } from "../context/DataCacheContext";
import { useToast } from "../context/ToastContext";
import { clientsService } from "../services/clientsService";
import { personsService } from "../services/personsService";
import { bussinessService } from "../services/bussinessService";
import Back from "../components/buttons/Back";
import Tabs from "../components/Tabs";
import StyledTable from "../components/StyledTable";
import Modal from "../components/Modal";
import ClientCard from "../components/ClientCard";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card as UiCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Receipt,
  UserCheck,
  Users,
  Plus,
  Trash2,
  Search,
  Check,
  Pencil,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { formatCuit, formatDni, isLegalEntityCuit } from "../components/steps/client-creation/BussinessSearch";
import { getDistrictDisplay, mapProvinceCodeToDistrictId } from "@/lib/districtUtils";
import { cn } from "@/lib/utils";

function getPhoneValueForForm(person) {
  if (!person) return { country_code: "54", phone: "" };
  const phone = person.phone;
  const cc = person.country_code ?? person.countryCode;
  if (phone != null && typeof phone === "object") {
    return { country_code: phone.country_code ?? "54", phone: phone.phone ?? "" };
  }
  return { country_code: cc ?? "54", phone: phone ?? "" };
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshClients, countries, loadCountries, districts, loadDistricts } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estados de edición y formularios
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [generalNameForm, setGeneralNameForm] = useState("");
  const [saveGeneralLoading, setSaveGeneralLoading] = useState(false);

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ address: "", location: "", district: "" });
  const [saveAddressLoading, setSaveAddressLoading] = useState(false);
  const [addressShowValidation, setAddressShowValidation] = useState(false);

  const [editingBilling, setEditingBilling] = useState(false);
  const [billingForm, setBillingForm] = useState({
    cuit: "",
    address: "",
    location: "",
    district: "",
    paysIva: false,
  });
  const [saveBillingLoading, setSaveBillingLoading] = useState(false);
  const [billingShowValidation, setBillingShowValidation] = useState(false);

  const [editingRep, setEditingRep] = useState(false);
  const [repForm, setRepForm] = useState({
    name: "",
    dni: "",
    mail: "",
    address: "",
    location: "",
    district: "",
    phone: { country_code: "54", phone: "" },
  });
  const [saveRepLoading, setSaveRepLoading] = useState(false);
  const [repShowValidation, setRepShowValidation] = useState(false);

  // Gestión de múltiples solicitantes vinculados
  const [contactsList, setContactsList] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [addContactTab, setAddContactTab] = useState("search");
  const [personSearchQuery, setPersonSearchQuery] = useState("");
  const [personSearchResults, setPersonSearchResults] = useState([]);
  const [searchingPersons, setSearchingPersons] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [linkingPerson, setLinkingPerson] = useState(false);
  const [newPersonForm, setNewPersonForm] = useState({
    name: "",
    dni: "",
    mail: "",
    country_code: "54",
    phone: "",
  });
  const [savingNewPerson, setSavingNewPerson] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingContactForm, setEditingContactForm] = useState({
    name: "",
    dni: "",
    mail: "",
    phone: { country_code: "54", phone: "" },
    address: "",
    location: "",
    district: "",
  });
  const [savingEditContact, setSavingEditContact] = useState(false);

  const isLaboratory = user?.profile === "LABORATORY";
  const clientUserId = client?.user ?? client?.userId;

  const canEdit =
    client != null &&
    ((client.origin === "LABORATORY" && isLaboratory) ||
      (client.origin === "CLIENT" && clientUserId === user?.id)) &&
    client.origin !== "PUBLIC";

  const canDeleteFromAgenda = client?.origin === "LABORATORY" && isLaboratory;

  useEffect(() => {
    if (!countries) loadCountries?.().catch(() => {});
    if (!districts) loadDistricts?.().catch(() => {});
  }, [countries, loadCountries, districts, loadDistricts]);

  const refreshClient = useCallback(async () => {
    try {
      const data = await clientsService.get(id);
      setClient(data);
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    clientsService
      .get(id)
      .then((data) => {
        if (!cancelled) setClient(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Sincronizar formularios locales al cargar el cliente o cuando cargan los distritos
  useEffect(() => {
    if (client) {
      setGeneralNameForm(client.name || "");

      if (client.address) {
        const rawDistrict =
          client.address.district?.id ??
          client.address.district ??
          client.address.province ??
          "";
        const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
        setAddressForm({
          address: client.address.address ?? client.address.address_address ?? "",
          location: client.address.location ?? client.address.address_location ?? "",
          district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
        });
      }

      if (client.billing) {
        const rawDistrict = client.billing.province ?? client.billing.district ?? "";
        const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
        setBillingForm({
          cuit: client.billing.cuit
            ? formatCuit(client.billing.cuit)
            : client.cuit
            ? formatCuit(client.cuit)
            : "",
          address: client.billing.address ?? "",
          location: client.billing.location ?? "",
          district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
          paysIva: Boolean(client.billing.paysIva),
        });
      }

      if (client.representative) {
        const r = client.representative;
        const rawDistrict = r.district?.id ?? r.district ?? r.province ?? "";
        const mapped = mapProvinceCodeToDistrictId(rawDistrict, districts);
        setRepForm({
          name: r.name ?? "",
          dni: r.dni ?? "",
          mail: r.mail ?? "",
          address: r.address ?? "",
          location: r.location ?? "",
          district: mapped || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
          phone: getPhoneValueForForm(r),
        });
      }
    }
  }, [client, districts]);

  const loadContacts = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingContacts(true);
      const list = await clientsService.getContacts(id);
      if (Array.isArray(list) && list.length > 0) {
        setContactsList(list);
      } else if (client?.contacts?.length > 0) {
        setContactsList(client.contacts);
      } else if (client?.contact) {
        setContactsList([client.contact]);
      } else {
        setContactsList([]);
      }
    } catch (err) {
      console.error(err);
      if (client?.contacts?.length > 0) {
        setContactsList(client.contacts);
      } else if (client?.contact) {
        setContactsList([client.contact]);
      }
    } finally {
      setLoadingContacts(false);
    }
  }, [id, client?.contacts, client?.contact]);

  useEffect(() => {
    if (client) {
      loadContacts();
    }
  }, [client, loadContacts]);

  const handleSearchAvailablePersons = async (query) => {
    setSearchingPersons(true);
    try {
      const results = await personsService.searchAvailable(query);
      const existingIds = new Set(contactsList.map((c) => c.id));
      setPersonSearchResults(results.filter((p) => !existingIds.has(p.id)));
    } catch (err) {
      console.error(err);
      showErrorToast?.("Error al buscar solicitantes");
    } finally {
      setSearchingPersons(false);
    }
  };

  const handleLinkPerson = async () => {
    if (!selectedPersonId) return;
    setLinkingPerson(true);
    try {
      await clientsService.addContact(id, selectedPersonId);
      showSuccessToast?.("Solicitante vinculado correctamente a la empresa");
      setShowAddContactModal(false);
      setSelectedPersonId(null);
      await loadContacts();
      await refreshClient();
    } catch (err) {
      console.error(err);
      showErrorToast?.(err?.response?.data?.error || "Error al vincular solicitante");
    } finally {
      setLinkingPerson(false);
    }
  };

  const handleCreateAndLinkPerson = async () => {
    if (!newPersonForm.name?.trim()) {
      showErrorToast?.("El nombre es requerido");
      return;
    }
    setSavingNewPerson(true);
    try {
      const payload = {
        name: newPersonForm.name.trim(),
        dni: newPersonForm.dni?.trim() || undefined,
        mail: newPersonForm.mail?.trim() || undefined,
        phone: newPersonForm.phone?.trim()
          ? {
              country_code: (newPersonForm.country_code || "54").trim(),
              phone: newPersonForm.phone.trim(),
            }
          : undefined,
        countryCode: (newPersonForm.country_code || "54").trim(),
      };
      await clientsService.addContact(id, payload);
      showSuccessToast?.("Nuevo solicitante creado y vinculado");
      setShowAddContactModal(false);
      setNewPersonForm({ name: "", dni: "", mail: "", country_code: "54", phone: "" });
      await loadContacts();
      await refreshClient();
    } catch (err) {
      console.error(err);
      showErrorToast?.(err?.response?.data?.error || "Error al crear solicitante");
    } finally {
      setSavingNewPerson(false);
    }
  };

  const handleUnlinkContact = async (contactId) => {
    if (!window.confirm("¿Seguro que deseas desvincular este solicitante de la empresa?")) return;
    try {
      await clientsService.removeContact(id, contactId);
      showSuccessToast?.("Solicitante desvinculado");
      await loadContacts();
      await refreshClient();
    } catch (err) {
      console.error(err);
      showErrorToast?.(err?.response?.data?.error || "Error al desvincular solicitante");
    }
  };

  const startEditSingleContact = (contactItem) => {
    setEditingContactId(contactItem.id);
    const rawDistrict = contactItem.district ?? contactItem.province ?? "";
    const mapped = mapProvinceCodeToDistrictId(rawDistrict, districts);
    setEditingContactForm({
      name: contactItem.name || "",
      dni: contactItem.dni || "",
      mail: contactItem.mail || "",
      phone: getPhoneValueForForm(contactItem),
      address: contactItem.address || "",
      location: contactItem.location || "",
      district: mapped || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
    });
  };

  const handleSaveSingleContact = async (contactId) => {
    setSavingEditContact(true);
    try {
      await personsService.update(contactId, {
        name: editingContactForm.name.trim(),
        dni: editingContactForm.dni.trim(),
        mail: editingContactForm.mail.trim(),
        phone: editingContactForm.phone,
        address: editingContactForm.address.trim(),
        location: editingContactForm.location.trim(),
        district: editingContactForm.district,
      });
      showSuccessToast?.("Datos del solicitante actualizados");
      setEditingContactId(null);
      await loadContacts();
    } catch (err) {
      console.error(err);
      showErrorToast?.(err?.response?.data?.error || "Error al actualizar solicitante");
    } finally {
      setSavingEditContact(false);
    }
  };

  const getPhoneValue = (contactOrRep) => {
    if (!contactOrRep) return null;
    const phone = contactOrRep.phone;
    const cc = contactOrRep.country_code ?? contactOrRep.countryCode;
    if (phone != null && typeof phone === "object") return phone;
    if (cc != null || phone != null) return { country_code: cc ?? "54", phone: phone ?? "" };
    return null;
  };

  // --- Handlers para General ---
  const startEditGeneral = () => {
    setGeneralNameForm(client?.name ?? "");
    setEditingGeneral(true);
  };

  const handleCancelGeneral = () => {
    setGeneralNameForm(client?.name ?? "");
    setEditingGeneral(false);
  };

  const handleSaveGeneral = async () => {
    if (!generalNameForm.trim()) {
      showErrorToast?.("El nombre o razón social no puede estar vacío.");
      return;
    }
    try {
      setSaveGeneralLoading(true);
      await clientsService.update(id, { name: generalNameForm.trim() });
      setEditingGeneral(false);
      showSuccessToast?.("Datos generales actualizados");
      await refreshClient();
      refreshClients().catch(() => {});
    } catch (err) {
      showErrorToast?.(err?.response?.data?.error || err?.message || "Error al actualizar");
      setError(err);
    } finally {
      setSaveGeneralLoading(false);
    }
  };

  // --- Handlers para Representante Legal ---
  const rep = client?.representative;
  const address = client?.address;
  const billing = client?.billing;
  const isLegal = isLegalEntityCuit(client?.cuit);

  const canEditByOrigin = (origin, entityUserId) => {
    if (!origin) return false;
    const currentUserId = user?.id;
    const profile = user?.profile;
    if (origin === "PUBLIC") return false;
    if (origin === "LABORATORY") {
      return profile === "LABORATORY";
    }
    if (origin === "CLIENT") {
      if (!entityUserId || !currentUserId) return false;
      return String(entityUserId) === String(currentUserId);
    }
    return false;
  };

  const repUserId = rep?.userId ?? rep?.user;
  const repIsThirdParty = rep?.isThirdParty ?? false;
  const canEditRepresentative = !!rep && repIsThirdParty && canEditByOrigin(rep.origin, repUserId);
  const canEditAddress = !!address && canEditByOrigin(address.origin, address.user ?? address.userId);
  const canEditBilling = true;

  const startEditRep = () => {
    if (rep) {
      const rawDistrict = rep.district?.id ?? rep.district ?? rep.province ?? "";
      const mapped = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setRepForm({
        name: rep.name ?? "",
        dni: rep.dni ?? "",
        mail: rep.mail ?? "",
        address: rep.address ?? "",
        location: rep.location ?? "",
        district: mapped || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
        phone: getPhoneValueForForm(rep),
      });
    }
    setRepShowValidation(false);
    setEditingRep(true);
  };

  const handleCancelRep = () => {
    if (rep) {
      const rawDistrict = rep.district?.id ?? rep.district ?? rep.province ?? "";
      const mapped = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setRepForm({
        name: rep.name ?? "",
        dni: rep.dni ?? "",
        mail: rep.mail ?? "",
        address: rep.address ?? "",
        location: rep.location ?? "",
        district: mapped || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
        phone: getPhoneValueForForm(rep),
      });
    }
    setRepShowValidation(false);
    setEditingRep(false);
  };

  const validateRepForm = () => {
    const nameOk = (repForm.name ?? "").trim() !== "";
    const mailOk = (repForm.mail ?? "").trim() !== "";
    const phone = repForm.phone;
    const phoneFilled = phone?.phone != null && String(phone.phone).trim() !== "";
    const phoneOk =
      !phoneFilled ||
      (/^\d{1,4}$/.test((phone?.country_code ?? "").trim()) &&
        /^\d{6,15}$/.test(String(phone?.phone ?? "").replace(/\D/g, "")));
    return nameOk && mailOk && phoneOk;
  };

  const handleSaveRep = async () => {
    if (!client?.representative?.id) return;
    if (!validateRepForm()) {
      setRepShowValidation(true);
      showErrorToast?.("Por favor completá los campos requeridos (nombre y email).");
      return;
    }
    setRepShowValidation(false);
    setSaveRepLoading(true);
    try {
      const payload = {
        name: repForm.name.trim() || undefined,
        dni: repForm.dni.trim() || undefined,
        mail: repForm.mail.trim() || undefined,
        address: repForm.address.trim() || undefined,
        location: repForm.location.trim() || undefined,
        districtId: repForm.district ? String(repForm.district).trim() || undefined : undefined,
        phone: repForm.phone?.phone
          ? { country_code: repForm.phone.country_code || "54", phone: repForm.phone.phone }
          : undefined,
      };
      await personsService.update(client.representative.id, payload);
      setEditingRep(false);
      showSuccessToast?.("Representante legal actualizado");
      await refreshClient();
      refreshClients().catch(() => {});
    } catch (err) {
      showErrorToast?.(err?.response?.data?.error || err?.message || "Error al actualizar");
    } finally {
      setSaveRepLoading(false);
    }
  };

  // --- Handlers para Domicilio ---
  const startEditAddress = () => {
    if (address) {
      const rawDistrict =
        address.district?.id ?? address.district ?? address.province ?? "";
      const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setAddressForm({
        address: address.address ?? address.address_address ?? "",
        location: address.location ?? address.address_location ?? "",
        district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
      });
    }
    setAddressShowValidation(false);
    setEditingAddress(true);
  };

  const handleCancelAddress = () => {
    if (address) {
      const rawDistrict =
        address.district?.id ?? address.district ?? address.province ?? "";
      const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setAddressForm({
        address: address.address ?? address.address_address ?? "",
        location: address.location ?? address.address_location ?? "",
        district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
      });
    }
    setAddressShowValidation(false);
    setEditingAddress(false);
  };

  const validateAddressForm = () => {
    const addrOk = (addressForm.address ?? "").trim() !== "";
    const locOk = (addressForm.location ?? "").trim() !== "";
    const distOk = (addressForm.district ?? "").toString().trim() !== "";
    return addrOk && locOk && distOk;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) {
      setAddressShowValidation(true);
      showErrorToast?.("Por favor completá los campos de domicilio.");
      return;
    }
    setAddressShowValidation(false);
    try {
      setSaveAddressLoading(true);
      const districtStr = (addressForm.district ?? "").toString().trim();
      if (address?.id && address.origin === "PUBLIC") {
        await bussinessService.updateAddress(address.id, {
          address: (addressForm.address ?? "").trim(),
          location: (addressForm.location ?? "").trim(),
          district: districtStr,
        });
      } else {
        await clientsService.update(id, {
          address: {
            address: (addressForm.address ?? "").trim(),
            location: (addressForm.location ?? "").trim(),
            province: districtStr,
            district: districtStr,
          },
        });
      }
      setEditingAddress(false);
      showSuccessToast?.("Domicilio actualizado correctamente");
      await refreshClient();
      refreshClients().catch(() => {});
    } catch (err) {
      showErrorToast?.(err?.response?.data?.error || err?.message || "Error al actualizar");
      setError(err);
    } finally {
      setSaveAddressLoading(false);
    }
  };

  // --- Handlers para Facturación ---
  const startEditBilling = () => {
    if (billing) {
      const rawDistrict = billing.province ?? billing.district ?? "";
      const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setBillingForm({
        cuit: billing.cuit
          ? formatCuit(billing.cuit)
          : client?.cuit
          ? formatCuit(client.cuit)
          : "",
        address: billing.address ?? "",
        location: billing.location ?? "",
        district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
        paysIva: Boolean(billing.paysIva),
      });
    }
    setBillingShowValidation(false);
    setEditingBilling(true);
  };

  const handleCancelBilling = () => {
    if (billing) {
      const rawDistrict = billing.province ?? billing.district ?? "";
      const mappedId = mapProvinceCodeToDistrictId(rawDistrict, districts);
      setBillingForm({
        cuit: billing.cuit
          ? formatCuit(billing.cuit)
          : client?.cuit
          ? formatCuit(client.cuit)
          : "",
        address: billing.address ?? "",
        location: billing.location ?? "",
        district: mappedId || (typeof rawDistrict === "string" ? rawDistrict.trim() : ""),
        paysIva: Boolean(billing.paysIva),
      });
    }
    setBillingShowValidation(false);
    setEditingBilling(false);
  };

  const validateBillingForm = () => {
    const addrOk = (billingForm.address ?? "").trim() !== "";
    const locOk = (billingForm.location ?? "").trim() !== "";
    const distOk = (billingForm.district ?? "").toString().trim() !== "";
    const cuitDigits = String(billingForm.cuit || "").replace(/\D/g, "");
    const cuitOk = cuitDigits.length === 11;
    return addrOk && locOk && distOk && cuitOk;
  };

  const handleSaveBilling = async () => {
    if (!validateBillingForm()) {
      setBillingShowValidation(true);
      showErrorToast?.("Verificá que el CUIT tenga 11 dígitos y completá los campos fiscales.");
      return;
    }
    setBillingShowValidation(false);
    try {
      setSaveBillingLoading(true);
      const rawCuit = (billingForm.cuit ?? billing?.cuit ?? client.cuit ?? "").toString();
      const digits = rawCuit.replace(/\D/g, "");
      const cuit = digits.slice(0, 11);
      const addressVal = (billingForm.address ?? "").trim();
      const locationVal = (billingForm.location ?? "").trim();
      const provinceVal = (billingForm.district ?? "").toString().trim();

      const payload = {
        cuit: cuit || undefined,
        address: addressVal || undefined,
        location: locationVal || undefined,
        province: provinceVal || undefined,
        paysIva: !!billingForm.paysIva,
      };

      await clientsService.update(id, { billing: payload });
      setEditingBilling(false);
      showSuccessToast?.("Datos de facturación actualizados correctamente");
      await refreshClient();
      refreshClients().catch(() => {});
    } catch (err) {
      showErrorToast?.(err?.response?.data?.error || err?.message || "Error al actualizar");
      setError(err);
    } finally {
      setSaveBillingLoading(false);
    }
  };

  const handleDeleteFromAgenda = () => {
    const confirmed = window.confirm(
      "¿Eliminar este cliente de la agenda?\n\nEsta acción no se puede deshacer. El cliente dejará de aparecer en tu listado."
    );
    if (!confirmed) return;
    setDeleteLoading(true);
    clientsService
      .delete(id)
      .then(() => {
        showSuccessToast?.("Cliente eliminado de la agenda");
        refreshClients().catch(() => {});
        navigate("/clients");
      })
      .catch((err) => {
        showErrorToast?.(err?.response?.data?.error || err?.message || "Error al eliminar");
        setError(err);
      })
      .finally(() => setDeleteLoading(false));
  };

  const tabs = [
    { label: "General", id: "general", icon: Building2 },
    { label: "Domicilio", id: "address", icon: MapPin },
    { label: "Solicitantes", id: "contact", icon: Users },
    { label: "Facturación", id: "billing", icon: Receipt },
  ];

  const contactColumns = [
    {
      header: "Nombre",
      className: "font-medium whitespace-normal",
      render: (c) => c.name || "—",
    },
    {
      header: "DNI",
      render: (c) => c.dni || "—",
    },
    {
      header: "Teléfono",
      render: (c) => {
        const p = getPhoneValue(c);
        return p?.phone ? `+${p.country_code || "54"} ${p.phone}` : "—";
      },
    },
    {
      header: "Mail",
      render: (c) => c.mail || "—",
    },
    {
      header: "Domicilio",
      className: "whitespace-normal",
      render: (c) => {
        const prov = getDistrictDisplay(c.district ?? c.districtData ?? c.province, districts);
        const parts = [c.address, c.location, prov].filter((v) => v && v !== "—" && v !== "N/A");
        return parts.length > 0 ? parts.join(", ") : "—";
      },
    },
    ...(canEdit
      ? [
          {
            header: "Acciones",
            className: "text-right whitespace-nowrap",
            render: (c) => (
              <div
                className="flex items-center justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <UiButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => startEditSingleContact(c)}
                  title="Editar solicitante"
                >
                  <Pencil className="h-4 w-4" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleUnlinkContact(c.id)}
                  title="Desvincular de la empresa"
                >
                  <Trash2 className="h-4 w-4" />
                </UiButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-muted-foreground">Cargando cliente...</p>
      </div>
    );
  }

  if (error || !client) {
    const message =
      error?.response?.data?.message || error?.message || "No se pudo cargar el cliente.";
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <p className="text-red-700 font-medium mb-1">Error al cargar el cliente</p>
          <p className="text-red-600 text-sm mb-4">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                setError(null);
                setLoading(true);
                clientsService
                  .get(id)
                  .then(setClient)
                  .catch(setError)
                  .finally(() => setLoading(false));
              }}
            >
              Reintentar
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/clients")}>
              Volver a clientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTabId = tabs[activeTab]?.id || "general";

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-4 mb-2">
        <Back size="50px" navigateTo="/clients" />
      </div>

      {/* Card inicial simplificada para cliente */}
      <ClientCard
        client={client}
        variant="detail"
        canDelete={canDeleteFromAgenda}
        onDelete={handleDeleteFromAgenda}
        deleteLoading={deleteLoading}
      />

      {/* Tabs Navigation */}
      <div className="pt-2">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="space-y-6">
        {/* PESTAÑA 1: GENERAL */}
        {currentTabId === "general" && (
          <div className="space-y-6">
            {/* 1. Datos de la Empresa / Cliente */}
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
                      Identificación fiscal y nombre oficial de la empresa o cliente particular.
                    </CardDescription>
                  </div>
                </div>

                {canEdit && (
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
                          disabled={saveGeneralLoading}
                          className="h-8 text-xs font-medium"
                        >
                          <X className="size-3.5 mr-1.5" />
                          Cancelar
                        </UiButton>
                        <UiButton
                          type="button"
                          size="sm"
                          onClick={handleSaveGeneral}
                          disabled={saveGeneralLoading}
                          className="h-8 text-xs font-medium"
                        >
                          {saveGeneralLoading ? (
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
                    <Label htmlFor="clientCuitInput" className="text-xs font-medium text-muted-foreground">
                      CUIT / Identificación Tributaria
                    </Label>
                    <div className="text-xs font-mono font-medium text-foreground min-h-[36px] flex items-center">
                      {client.cuit ? formatCuit(client.cuit) : "—"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Identificador fiscal validado en el sistema.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clientNameInput" className="text-xs font-medium text-muted-foreground">
                      {isLegal ? "Razón Social *" : "Nombre Completo *"}
                    </Label>
                    {!editingGeneral ? (
                      <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                        {client.name || "—"}
                      </div>
                    ) : (
                      <Input
                        id="clientNameInput"
                        value={generalNameForm}
                        onChange={(e) => setGeneralNameForm(e.target.value)}
                        disabled={saveGeneralLoading}
                        placeholder={isLegal ? "Razón social de la empresa" : "Nombre del cliente"}
                        className="text-xs h-9 font-medium border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Nombre oficial que figurará en los certificados y facturación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </UiCard>

            {/* 2. Representante Legal (si es persona jurídica o tiene representante) */}
            {isLegal && (
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

                  {canEditRepresentative && (
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
                            disabled={saveRepLoading}
                            className="h-8 text-xs font-medium"
                          >
                            <X className="size-3.5 mr-1.5" />
                            Cancelar
                          </UiButton>
                          <UiButton
                            type="button"
                            size="sm"
                            onClick={handleSaveRep}
                            disabled={saveRepLoading}
                            className="h-8 text-xs font-medium"
                          >
                            {saveRepLoading ? (
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
                  {rep ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Nombre Completo *</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {rep.name || "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.name}
                            disabled={saveRepLoading}
                            onChange={(e) => setRepForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Nombre y apellido"
                            className={cn(
                              "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                              repShowValidation && !repForm.name.trim() && "border-destructive ring-1 ring-destructive"
                            )}
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {rep.dni ? formatDni(rep.dni) : "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.dni}
                            disabled={saveRepLoading}
                            onChange={(e) => setRepForm((p) => ({ ...p, dni: e.target.value }))}
                            placeholder="Documento nacional de identidad"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Email de Contacto *</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {rep.mail || "—"}
                          </div>
                        ) : (
                          <Input
                            type="email"
                            value={repForm.mail}
                            disabled={saveRepLoading}
                            onChange={(e) => setRepForm((p) => ({ ...p, mail: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                            className={cn(
                              "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                              repShowValidation && !repForm.mail.trim() && "border-destructive ring-1 ring-destructive"
                            )}
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Teléfono</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {getPhoneValue(rep)?.phone
                              ? `+${getPhoneValue(rep).country_code} ${getPhoneValue(rep).phone}`
                              : "—"}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={repForm.phone?.country_code || "54"}
                              disabled={saveRepLoading}
                              onChange={(e) =>
                                setRepForm((p) => ({
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
                              value={repForm.phone?.phone || ""}
                              onChange={(e) =>
                                setRepForm((p) => ({
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
                        <Label className="text-xs font-medium text-muted-foreground">Dirección</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {rep.address || "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.address}
                            disabled={saveRepLoading}
                            onChange={(e) => setRepForm((p) => ({ ...p, address: e.target.value }))}
                            placeholder="Calle y número"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Localidad</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {rep.location || "—"}
                          </div>
                        ) : (
                          <Input
                            value={repForm.location}
                            disabled={saveRepLoading}
                            onChange={(e) => setRepForm((p) => ({ ...p, location: e.target.value }))}
                            placeholder="Ciudad / Localidad"
                            className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                        <Label className="text-xs font-medium text-muted-foreground">Provincia</Label>
                        {!editingRep ? (
                          <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                            {getDistrictDisplay(rep.district ?? rep.districtData, districts)}
                          </div>
                        ) : (
                          <select
                            value={mapProvinceCodeToDistrictId(repForm.district, districts) || ""}
                            onChange={(e) => setRepForm((p) => ({ ...p, district: e.target.value.trim() }))}
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
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No se encuentra registrado ningún representante legal para esta empresa.
                    </p>
                  )}
                </CardContent>
              </UiCard>
            )}
          </div>
        )}

        {/* PESTAÑA 2: DOMICILIO */}
        {currentTabId === "address" && (
          <UiCard className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Domicilio Legal y Sede
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Ubicación geográfica, radicación de planta y dirección legal del cliente.
                  </CardDescription>
                </div>
              </div>

              {canEditAddress && (
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
                        disabled={saveAddressLoading}
                        className="h-8 text-xs font-medium"
                      >
                        <X className="size-3.5 mr-1.5" />
                        Cancelar
                      </UiButton>
                      <UiButton
                        type="button"
                        size="sm"
                        onClick={handleSaveAddress}
                        disabled={saveAddressLoading}
                        className="h-8 text-xs font-medium"
                      >
                        {saveAddressLoading ? (
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
                  <Label htmlFor="addressInput" className="text-xs font-medium text-muted-foreground">
                    Dirección (Calle y Número) *
                  </Label>
                  {!editingAddress ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {address?.address ?? address?.address_address ?? "—"}
                    </div>
                  ) : (
                    <Input
                      id="addressInput"
                      value={addressForm.address}
                      disabled={saveAddressLoading}
                      onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="ej. Sarmiento 123"
                      className={cn(
                        "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                        addressShowValidation && !addressForm.address.trim() && "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="locationInput" className="text-xs font-medium text-muted-foreground">
                    Localidad / Ciudad *
                  </Label>
                  {!editingAddress ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {address?.location ?? address?.address_location ?? "—"}
                    </div>
                  ) : (
                    <Input
                      id="locationInput"
                      value={addressForm.location}
                      disabled={saveAddressLoading}
                      onChange={(e) => setAddressForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="ej. Rosario"
                      className={cn(
                        "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                        addressShowValidation && !addressForm.location.trim() && "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="districtSelect" className="text-xs font-medium text-muted-foreground">
                    Provincia *
                  </Label>
                  {!editingAddress ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {address
                        ? getDistrictDisplay(
                            address.district ?? address.districtData ?? address.province,
                            districts
                          )
                        : "—"}
                    </div>
                  ) : (
                    <select
                      id="districtSelect"
                      value={mapProvinceCodeToDistrictId(addressForm.district, districts) || ""}
                      onChange={(e) => setAddressForm((p) => ({ ...p, district: e.target.value.trim() }))}
                      className={cn(
                        "h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring",
                        addressShowValidation && !addressForm.district && "border-destructive ring-1 ring-destructive"
                      )}
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
        )}

        {/* PESTAÑA 3: SOLICITANTES */}
        {currentTabId === "contact" && (
          <UiCard className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <Users className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Solicitantes Autorizados ({contactsList.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Personas de contacto autorizadas para gestionar ensayos y solicitudes a nombre de la empresa.
                  </CardDescription>
                </div>
              </div>

              {canEdit && (
                <UiButton
                  size="sm"
                  onClick={() => {
                    setShowAddContactModal(true);
                    handleSearchAvailablePersons("");
                  }}
                  className="h-8 text-xs font-medium shrink-0"
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Vincular solicitante
                </UiButton>
              )}
            </CardHeader>
            <CardContent className="pt-3">
              <StyledTable
                columns={contactColumns}
                data={contactsList}
                isLoading={loadingContacts}
                emptyMessage="No hay solicitantes vinculados a esta empresa."
              />
            </CardContent>
          </UiCard>
        )}

        {/* PESTAÑA 4: FACTURACIÓN */}
        {currentTabId === "billing" && (
          <UiCard className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <Receipt className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Datos Fiscales y de Facturación
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Información impositiva y domicilio legal para la facturación de servicios.
                  </CardDescription>
                </div>
              </div>

              {canEditBilling && (
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
                        disabled={saveBillingLoading}
                        className="h-8 text-xs font-medium"
                      >
                        <X className="size-3.5 mr-1.5" />
                        Cancelar
                      </UiButton>
                      <UiButton
                        type="button"
                        size="sm"
                        onClick={handleSaveBilling}
                        disabled={saveBillingLoading}
                        className="h-8 text-xs font-medium"
                      >
                        {saveBillingLoading ? (
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
                  <Label htmlFor="billingCuitInput" className="text-xs font-medium text-muted-foreground">
                    CUIT de Facturación *
                  </Label>
                  {!editingBilling ? (
                    <div className="text-xs font-mono font-medium text-foreground min-h-[36px] flex items-center">
                      {billing?.cuit
                        ? formatCuit(billing.cuit)
                        : client.cuit
                        ? formatCuit(client.cuit)
                        : "—"}
                    </div>
                  ) : (
                    <Input
                      id="billingCuitInput"
                      value={billingForm.cuit}
                      disabled={saveBillingLoading}
                      onChange={(e) => setBillingForm((p) => ({ ...p, cuit: e.target.value }))}
                      placeholder="XX-XXXXXXXX-X"
                      className={cn(
                        "text-xs h-9 font-mono border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                        billingShowValidation &&
                          String(billingForm.cuit || "").replace(/\D/g, "").length !== 11 &&
                          "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="billingAddressInput" className="text-xs font-medium text-muted-foreground">
                    Dirección Fiscal *
                  </Label>
                  {!editingBilling ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {billing?.address || "—"}
                    </div>
                  ) : (
                    <Input
                      id="billingAddressInput"
                      value={billingForm.address}
                      disabled={saveBillingLoading}
                      onChange={(e) => setBillingForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Calle y número de facturación"
                      className={cn(
                        "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                        billingShowValidation && !billingForm.address.trim() && "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="billingLocationInput" className="text-xs font-medium text-muted-foreground">
                    Localidad Fiscal *
                  </Label>
                  {!editingBilling ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {billing?.location || "—"}
                    </div>
                  ) : (
                    <Input
                      id="billingLocationInput"
                      value={billingForm.location}
                      disabled={saveBillingLoading}
                      onChange={(e) => setBillingForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ciudad / Localidad"
                      className={cn(
                        "text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring",
                        billingShowValidation && !billingForm.location.trim() && "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="billingProvinceSelect" className="text-xs font-medium text-muted-foreground">
                    Provincia Fiscal *
                  </Label>
                  {!editingBilling ? (
                    <div className="text-xs font-medium text-foreground min-h-[36px] flex items-center">
                      {getDistrictDisplay(billing?.province, districts)}
                    </div>
                  ) : (
                    <select
                      id="billingProvinceSelect"
                      value={mapProvinceCodeToDistrictId(billingForm.district, districts) || ""}
                      onChange={(e) => setBillingForm((p) => ({ ...p, district: e.target.value.trim() }))}
                      className={cn(
                        "h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring",
                        billingShowValidation && !billingForm.district && "border-destructive ring-1 ring-destructive"
                      )}
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
                      {billing?.paysIva ? "Responsable Inscripto (Paga IVA)" : "Consumidor Final / Exento"}
                    </div>
                  ) : (
                    <div className="min-h-[36px] flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="billingPaysIvaCheck"
                        checked={!!billingForm.paysIva}
                        disabled={saveBillingLoading}
                        onChange={(e) => setBillingForm((p) => ({ ...p, paysIva: e.target.checked }))}
                        className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      />
                      <Label
                        htmlFor="billingPaysIvaCheck"
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

      {/* Modal para vincular / crear solicitante */}
      {showAddContactModal && (
        <Modal
          show={showAddContactModal}
          onClose={() => {
            setShowAddContactModal(false);
            setSelectedPersonId(null);
            setPersonSearchQuery("");
          }}
          title="Vincular solicitante a la empresa"
        >
          <div className="space-y-4 pt-1">
            <div className="flex border-b">
              <button
                type="button"
                className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${addContactTab === "search" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setAddContactTab("search")}
              >
                Buscar solicitante existente
              </button>
              <button
                type="button"
                className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${addContactTab === "create" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setAddContactTab("create")}
              >
                Crear nuevo solicitante
              </button>
            </div>

            {addContactTab === "search" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={personSearchQuery}
                    onChange={(e) => {
                      setPersonSearchQuery(e.target.value);
                      handleSearchAvailablePersons(e.target.value);
                    }}
                    placeholder="Buscar por nombre, DNI o email..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y border rounded-lg">
                  {searchingPersons ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">Buscando...</div>
                  ) : personSearchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No se encontraron solicitantes disponibles.
                    </div>
                  ) : (
                    personSearchResults.map((p) => {
                      const isSelected = selectedPersonId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPersonId(p.id)}
                          className={`p-3 text-sm flex items-center justify-between cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
                        >
                          <div>
                            <p className="font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.dni ? `DNI: ${p.dni}` : ""} {p.mail ? `• ${p.mail}` : ""}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <UiButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddContactModal(false)}
                  >
                    Cancelar
                  </UiButton>
                  <UiButton
                    size="sm"
                    disabled={!selectedPersonId || linkingPerson}
                    onClick={handleLinkPerson}
                  >
                    {linkingPerson ? "Vinculando..." : "Vincular"}
                  </UiButton>
                </div>
              </div>
            )}

            {addContactTab === "create" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nombre completo *</label>
                  <input
                    type="text"
                    value={newPersonForm.name}
                    onChange={(e) => setNewPersonForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">DNI</label>
                  <input
                    type="text"
                    value={newPersonForm.dni}
                    onChange={(e) => setNewPersonForm((f) => ({ ...f, dni: e.target.value }))}
                    placeholder="Ej. 12345678"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                  <div className="flex gap-2">
                    <select
                      value={newPersonForm.country_code || "54"}
                      onChange={(e) =>
                        setNewPersonForm((f) => ({ ...f, country_code: e.target.value }))
                      }
                      className="w-24 mt-1 px-2 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {(countries || [])
                        .filter((c) => c.country_code)
                        .map((c) => (
                          <option
                            key={c.id || c.country_code}
                            value={String(c.country_code).trim()}
                          >
                            +{String(c.country_code).trim()}
                          </option>
                        ))}
                      {(!countries || countries.length === 0) && <option value="54">+54</option>}
                    </select>
                    <input
                      type="tel"
                      value={newPersonForm.phone}
                      onChange={(e) =>
                        setNewPersonForm((f) => ({
                          ...f,
                          phone: e.target.value.replace(/[^\d\s-]/g, ""),
                        }))
                      }
                      placeholder="Ej. 11 2345-6789"
                      className="flex-1 mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={newPersonForm.mail}
                    onChange={(e) => setNewPersonForm((f) => ({ ...f, mail: e.target.value }))}
                    placeholder="Ej. juan@empresa.com"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <UiButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddContactModal(false)}
                  >
                    Cancelar
                  </UiButton>
                  <UiButton
                    size="sm"
                    disabled={!newPersonForm.name?.trim() || savingNewPerson}
                    onClick={handleCreateAndLinkPerson}
                  >
                    {savingNewPerson ? "Guardando..." : "Crear y vincular"}
                  </UiButton>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal para editar solicitante */}
      {editingContactId && (
        <Modal
          show={!!editingContactId}
          onClose={() => setEditingContactId(null)}
          title="Editar solicitante"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSingleContact(editingContactId);
            }}
            className="space-y-4 pt-1"
          >
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre completo *</label>
              <input
                type="text"
                value={editingContactForm.name}
                onChange={(e) => setEditingContactForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">DNI</label>
                <input
                  type="text"
                  value={editingContactForm.dni}
                  onChange={(e) => setEditingContactForm((f) => ({ ...f, dni: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={editingContactForm.mail}
                  onChange={(e) => setEditingContactForm((f) => ({ ...f, mail: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
              <div className="flex gap-2">
                <select
                  value={editingContactForm.phone?.country_code || "54"}
                  onChange={(e) =>
                    setEditingContactForm((f) => ({
                      ...f,
                      phone: { ...f.phone, country_code: e.target.value },
                    }))
                  }
                  className="w-24 mt-1 px-2 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {(countries || [])
                    .filter((c) => c.country_code)
                    .map((c) => (
                      <option key={c.id || c.country_code} value={c.country_code}>
                        +{c.country_code}
                      </option>
                    ))}
                  {(!countries || countries.length === 0) && <option value="54">+54</option>}
                </select>
                <input
                  type="tel"
                  value={editingContactForm.phone?.phone || ""}
                  onChange={(e) =>
                    setEditingContactForm((f) => ({
                      ...f,
                      phone: { ...f.phone, phone: e.target.value.replace(/[^\d\s-]/g, "") },
                    }))
                  }
                  placeholder="Ej: 11 2345-6789"
                  className="flex-1 mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Dirección</label>
              <input
                type="text"
                value={editingContactForm.address}
                onChange={(e) => setEditingContactForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Localidad</label>
                <input
                  type="text"
                  value={editingContactForm.location}
                  onChange={(e) =>
                    setEditingContactForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Provincia</label>
                <select
                  value={mapProvinceCodeToDistrictId(editingContactForm.district, districts) || ""}
                  onChange={(e) =>
                    setEditingContactForm((f) => ({ ...f, district: e.target.value.trim() }))
                  }
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <UiButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingContactId(null)}
              >
                Cancelar
              </UiButton>
              <UiButton
                type="submit"
                size="sm"
                disabled={!editingContactForm.name?.trim() || savingEditContact}
              >
                {savingEditContact ? "Guardando..." : "Guardar cambios"}
              </UiButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
