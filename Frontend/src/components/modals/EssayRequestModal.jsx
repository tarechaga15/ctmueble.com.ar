import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, ClipboardCheck, FlaskConical, Package, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "../Modal";
import SelectorParte from "../shared/selector-parte";
import AltaStepper from "../shared/alta-stepper";
import CreateClientModal from "./CreateClientModal";
import { useAuth } from "../../context/AuthContext";
import { useDataCache } from "../../context/DataCacheContext";
import { useToast } from "../../context/ToastContext";
import { essaysService } from "../../services/essaysService";
import { typesService } from "../../services/typesService";
import { clientsService } from "../../services/clientsService";
import { personsService } from "../../services/personsService";
import { isLegalEntityCuit } from "../steps/client-creation/BussinessSearch";

const STEPS = [
  { id: "ensayo", label: "Ensayo", hint: "Qué ensayo necesitás", icon: FlaskConical },
  { id: "elemento", label: "Elemento", hint: "Qué se va a ensayar", icon: Package },
  { id: "solicitante", label: "Cliente y solicitante", hint: "Quién pide el ensayo", icon: Building2 },
  { id: "resumen", label: "Resumen", hint: "Revisá y confirmá", icon: ClipboardCheck },
];

export function isClientTheApplicant(client) {
  if (!client) return false;
  if (client.applicantSameAsClient) return true;
  if (client.cuit && !isLegalEntityCuit(client.cuit)) return true;
  const clientName = (client.name || "").trim().toLowerCase();
  if (client.contact?.name && clientName && client.contact.name.trim().toLowerCase() === clientName) {
    return true;
  }
  if (Array.isArray(client.contacts) && client.contacts.length > 0) {
    if (client.contacts.some((c) => c.name && c.name.trim().toLowerCase() === clientName)) {
      return true;
    }
  }
  return false;
}

const emptyForm = {
  typeId: "",
  typeName: "",
  templateId: "",
  templateLabel: "",
  date: "",
  batch_number: "",
  observations: "",
  client: null,
  contact: null,
  client_notifications_enabled: true,
};

function elementKeys(product, manufacturer, country) {
  const base = [product, manufacturer].map((value) => String(value || "").trim().toLowerCase()).join("|");
  const tokens = new Set();
  if (country && typeof country === "object") {
    if (country.id) tokens.add(String(country.id).trim().toLowerCase());
    if (country.name) tokens.add(String(country.name).trim().toLowerCase());
  } else if (country) {
    tokens.add(String(country).trim().toLowerCase());
  }
  if (!tokens.size) tokens.add("");
  return [...tokens].map((token) => `${base}|${token}`);
}

function bumpUsage(map, keys) {
  const next = keys.reduce((max, key) => Math.max(max, map.get(key) || 0), 0) + 1;
  keys.forEach((key) => map.set(key, next));
}

function cuitKey(value) {
  return String(value || "").replace(/\D/g, "");
}

function OpcionesFrecuentes({ items, selectedId, onSelect }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <Label>Más usados</Label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const selected = String(selectedId) === String(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "rounded-xl border p-3 text-left text-sm transition-colors",
                selected ? "border-primary bg-primary/10" : "hover:bg-muted/50",
              )}
            >
              <span className="block leading-tight font-medium">{item.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {item.uses} {item.uses === 1 ? "vez" : "veces"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function templateLabel(template) {
  if (!template) return "";
  return [template.product, template.manufacturer, template.country?.name ?? template.country]
    .filter(Boolean)
    .join(" · ");
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function errorMessage(err, fallback) {
  const raw = err?.response?.data?.error || err?.response?.data?.message || err?.message;
  if (!raw) return fallback;
  const str = String(raw).trim();

  if (str.includes("string violation") || str.includes("cannot be an array or an object")) {
    return "Los datos de solicitante o país poseen un formato inválido. Por favor verificá tus datos de perfil.";
  }
  if (str.includes("Sequelize") || str.includes("syntax error") || str.includes("violates") || str.includes("column")) {
    return "Ocurrió un error al procesar la solicitud. Por favor verificá los datos ingresados.";
  }
  if (str.includes("Network Error") || str.includes("Failed to fetch")) {
    return "No se pudo conectar con el servidor. Por favor comprobá tu conexión a internet.";
  }

  return str || fallback;
}

export function formatPhoneStr(phone) {
  if (!phone) return "";
  if (typeof phone === "string") return phone;
  if (typeof phone === "object") {
    const code = phone.country_code || phone.countryCode ? `+${phone.country_code || phone.countryCode} ` : "";
    return `${code}${phone.phone || ""}`.trim();
  }
  return "";
}

export function findSelfClient(agendaList, profile, currentUser) {
  if (!Array.isArray(agendaList) || !agendaList.length) return null;
  const cleanDni = profile?.dni ? String(profile.dni).replace(/\D/g, "") : (currentUser?.dni ? String(currentUser.dni).replace(/\D/g, "") : "");
  const pName = (profile?.name || currentUser?.name || "").trim().toLowerCase();

  // 1. Coincidencia por DNI en CUIT o CUIT exacto
  if (cleanDni) {
    const byDni = agendaList.find((c) => {
      const cuit = String(c.cuit || "").replace(/\D/g, "");
      return cuit === cleanDni || cuit.slice(2, -1) === cleanDni || cuit.includes(cleanDni);
    });
    if (byDni) return byDni;
  }

  // 2. Coincidencia por nombre
  if (pName) {
    const byName = agendaList.find((c) => (c.name || "").trim().toLowerCase() === pName);
    if (byName) return byName;
  }

  // 3. Coincidencia por ID de contacto
  if (profile?.id) {
    const byContact = agendaList.find((c) => {
      const cId = c.contact?.id || (typeof c.contact === "string" ? c.contact : null);
      return cId && String(cId) === String(profile.id);
    });
    if (byContact) return byContact;
  }

  // 4. Si sólo tiene 1 cliente en su cuenta
  if (agendaList.length === 1) {
    return agendaList[0];
  }

  return null;
}

function BotonNuevo({ label, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-dashed p-3 text-left text-sm transition-colors",
        activo ? "border-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50",
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed">
        <Plus className="h-4 w-4" />
      </span>
      <span className="font-medium text-foreground">{label}</span>
    </button>
  );
}

function AltaElementoForm({ product, countries, saving, onCancel, onSubmit }) {
  const [producto, setProducto] = useState(product || "");
  const [fabricante, setFabricante] = useState("");
  const [pais, setPais] = useState("AR");

  useEffect(() => {
    setProducto(product || "");
  }, [product]);

  return (
    <div className="rounded-xl border border-dashed p-4">
      <p className="text-xs font-semibold text-foreground">Nuevo elemento a ensayar</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="nuevo-producto">Producto</Label>
          <Input
            id="nuevo-producto"
            required
            placeholder="Ej. Silla de oficina"
            value={producto}
            onChange={(event) => setProducto(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="nuevo-fabricante">Fabricante</Label>
          <Input
            id="nuevo-fabricante"
            required
            placeholder="Ej. Mobel S.A."
            value={fabricante}
            onChange={(event) => setFabricante(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="nuevo-pais">País de origen</Label>
          <select
            id="nuevo-pais"
            value={pais}
            onChange={(event) => setPais(event.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!producto.trim() || !fabricante.trim() || saving}
          onClick={() =>
            onSubmit({
              product: producto.trim(),
              manufacturer: fabricante.trim(),
              country: pais,
            })
          }
        >
          {saving ? "Guardando..." : "Guardar elemento"}
        </Button>
      </div>
    </div>
  );
}

function EssayAltaStepper({ onCreated }) {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";

  const {
    essayTypes,
    elementTemplates,
    countries,
    loadEssayTypes,
    loadElementTemplates,
    loadCountries,
    addEssayType,
    addTemplate,
    upsertEssay,
    refreshEssays,
  } = useDataCache();
  const { success: toastSuccess, error: toastError } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errorPaso, setErrorPaso] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [altaEnsayo, setAltaEnsayo] = useState(false);
  const [nombreEnsayo, setNombreEnsayo] = useState("");
  const [creandoEnsayo, setCreandoEnsayo] = useState(false);
  const [busquedaElemento, setBusquedaElemento] = useState("");
  const [creandoElemento, setCreandoElemento] = useState(false);
  const [creandoPlantilla, setCreandoPlantilla] = useState(false);
  const [prefillProducto, setPrefillProducto] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [crearCliente, setCrearCliente] = useState(false);
  const [uso, setUso] = useState({ elements: new Map(), clients: new Map(), agenda: [] });
  const autoTipo = useRef(false);

  // Estados para solicitante y cliente
  const [myProfile, setMyProfile] = useState(null);
  const [requestType, setRequestType] = useState("self"); // "self" o "company"
  const [companyContacts, setCompanyContacts] = useState([]);
  const [addingNewContact, setAddingNewContact] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: "", dni: "", country_code: "54", phone: "", mail: "" });
  const [savingNewContact, setSavingNewContact] = useState(false);
  const clientIsApplicant = isClientTheApplicant(form.client);

  useEffect(() => {
    loadEssayTypes().catch(() => {});
    loadElementTemplates().catch(() => {});
    loadCountries().catch(() => {});
  }, [loadEssayTypes, loadElementTemplates, loadCountries]);

  // Cargar perfil de solicitante del usuario si es CLIENT
  useEffect(() => {
    if (!isLaboratory) {
      personsService
        .getMyProfile()
        .then((profile) => {
          if (profile) {
            setMyProfile(profile);
            setForm((current) => {
              const next = { ...current, contact: profile };
              if (requestType === "self" && !current.client && uso.agenda?.length > 0) {
                const autoClient = findSelfClient(uso.agenda, profile, user);
                if (autoClient) next.client = autoClient;
              }
              return next;
            });
          }
        })
        .catch(() => {});
    }
  }, [isLaboratory, requestType, uso.agenda, user]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([essaysService.fetch().catch(() => []), clientsService.fetch().catch(() => [])]).then(
      ([essays, agenda]) => {
        if (cancelled) return;
        const elements = new Map();
        const clients = new Map();
        for (const essay of essays || []) {
          const element = essay.elements;
          if (element?.product) {
            bumpUsage(elements, elementKeys(element.product, element.manufacturer, element.country));
          }
          const cuit = cuitKey(essay.client?.cuit);
          if (cuit) clients.set(cuit, (clients.get(cuit) || 0) + 1);
        }
        const agendaList = Array.isArray(agenda) ? agenda : [];
        setUso({ elements, clients, agenda: agendaList });
        if (!isLaboratory) {
          setForm((current) => {
            if (requestType === "self" && !current.client && agendaList.length > 0) {
              const autoClient = findSelfClient(agendaList, myProfile, user);
              if (autoClient) return { ...current, client: autoClient };
            }
            return current;
          });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isLaboratory, myProfile, requestType, user]);

  // Cargar contactos cuando cambia la empresa seleccionada
  useEffect(() => {
    if (!form.client?.id) {
      setCompanyContacts([]);
      return;
    }
    const isApplicant = isClientTheApplicant(form.client);
    let cancelled = false;
    clientsService
      .getContacts(form.client.id)
      .then((contacts) => {
        if (cancelled) return;
        const list = Array.isArray(contacts) ? contacts : [];
        setCompanyContacts(list);
        if (isApplicant) {
          const match =
            list.find((c) => c.name?.trim().toLowerCase() === form.client.name?.trim().toLowerCase()) ||
            list[0] ||
            form.client.contact;
          if (match) {
            setForm((c) => ({ ...c, contact: match }));
          } else if (form.client.contact) {
            setForm((c) => ({ ...c, contact: form.client.contact }));
          }
        } else if (isLaboratory && list.length > 0 && !form.contact) {
          setForm((c) => ({ ...c, contact: list[0] }));
        }
      })
      .catch(() => {
        if (!cancelled && Array.isArray(form.client?.contacts)) {
          setCompanyContacts(form.client.contacts);
          if (isApplicant) {
            const match =
              form.client.contacts.find((c) => c.name?.trim().toLowerCase() === form.client.name?.trim().toLowerCase()) ||
              form.client.contacts[0] ||
              form.client.contact;
            if (match) setForm((c) => ({ ...c, contact: match }));
          } else if (isLaboratory && form.client.contacts.length > 0 && !form.contact) {
            setForm((c) => ({ ...c, contact: form.client.contacts[0] }));
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [form.client?.id, isLaboratory]);

  useEffect(() => {
    if (autoTipo.current || !essayTypes || essayTypes.length !== 1) return;
    autoTipo.current = true;
    const only = essayTypes[0];
    setForm((current) =>
      current.typeId ? current : { ...current, typeId: only.id, typeName: only.name || "" },
    );
  }, [essayTypes]);

  function validarPaso(pasoId) {
    if (pasoId === "ensayo" && !form.typeId) return "Elegí un tipo de ensayo.";
    if (pasoId === "elemento") {
      if (!form.templateId) return "Elegí el elemento a ensayar.";
      if (!form.date) return "La fecha de toma de muestra es requerida.";
      if (!String(form.batch_number || "").trim()) return "El número de lote es requerido.";
    }
    if (pasoId === "solicitante") {
      if (!isLaboratory) {
        if (requestType === "company" && !form.client?.id) {
          return "Elegí la empresa a la que representás o creá una nueva.";
        }
      } else {
        if (!form.client?.id) return "Elegí la empresa cliente.";
        if (!clientIsApplicant && !form.contact?.id) {
          return "Elegí o añadí un solicitante asociado a esta empresa.";
        }
      }
    }
    return null;
  }

  function irA(destino) {
    if (destino > step) {
      const err = validarPaso(STEPS[step].id);
      if (err) {
        setErrorPaso(err);
        return;
      }
    }
    setErrorPaso(null);
    setStep(destino);
  }

  function siguiente() {
    const err = validarPaso(STEPS[step].id);
    if (err) {
      setErrorPaso(err);
      return;
    }
    setErrorPaso(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function crearEnsayo(event) {
    event.preventDefault();
    const nombre = nombreEnsayo.trim();
    if (!nombre || creandoEnsayo) return;
    setCreandoEnsayo(true);
    try {
      const created = await typesService.createEssay(nombre);
      addEssayType(created);
      setForm((current) => ({ ...current, typeId: created.id, typeName: created.name }));
      setAltaEnsayo(false);
      setNombreEnsayo("");
      toastSuccess("Tipo de ensayo creado");
    } catch (err) {
      toastError(errorMessage(err, "No se pudo crear el tipo de ensayo"));
    } finally {
      setCreandoEnsayo(false);
    }
  }

  async function crearElemento({ product, manufacturer, country }) {
    if (!product || !manufacturer || creandoPlantilla) return;
    setCreandoPlantilla(true);
    try {
      const created = await essaysService.createElementTemplate({
        product,
        manufacturer,
        country: country || null,
      });
      addTemplate(created);
      setForm((current) => ({
        ...current,
        templateId: created.id,
        templateLabel: templateLabel(created),
      }));
      setCreandoElemento(false);
      setPrefillProducto("");
      toastSuccess("Elemento creado");
    } catch (err) {
      toastError(errorMessage(err, "No se pudo crear el elemento"));
    } finally {
      setCreandoPlantilla(false);
    }
  }

  async function buscarClientes(query) {
    setBusquedaCliente(query);
    if (!query) {
      setClientesSugeridos([]);
      return;
    }
    try {
      const results = await clientsService.search(query);
      setClientesSugeridos(Array.isArray(results) ? results : []);
    } catch {
      setClientesSugeridos([]);
    }
  }

  async function confirmar() {
    const err = validarPaso("ensayo") || validarPaso("elemento") || validarPaso("solicitante");
    if (err) {
      setErrorPaso(err);
      if (!form.typeId) setStep(0);
      else if (!form.templateId || !form.date || !String(form.batch_number || "").trim()) setStep(1);
      else setStep(2);
      return;
    }
    if (guardando) return;
    setGuardando(true);
    setErrorPaso(null);
    try {
      const isSelf = !isLaboratory && requestType === "self";
      const resolvedContactId = isLaboratory
        ? (clientIsApplicant ? (form.client?.contact?.id || form.contact?.id || null) : form.contact?.id)
        : (myProfile?.id || form.contact?.id || null);
      const response = await essaysService.create({
        client: form.client?.id || null,
        contactId: resolvedContactId,
        isSelf,
        essay: form.typeId,
        elements: {
          template: form.templateId,
          date: form.date,
          batch_number: form.batch_number || undefined,
        },
        observations: form.observations ?? "",
        billing: {},
        client_notifications_enabled: form.client_notifications_enabled !== false,
      });
      if (response?.id) {
        upsertEssay(response);
        await refreshEssays().catch(() => {});
      }
      toastSuccess("Ensayo solicitado correctamente.");
      onCreated?.(response);
    } catch (err) {
      const message = errorMessage(err, "Error al solicitar el ensayo");
      setErrorPaso(message);
      toastError(message);
    } finally {
      setGuardando(false);
    }
  }

  const paso = STEPS[step].id;
  const tipos = Array.isArray(essayTypes) ? essayTypes : [];
  const plantillas = Array.isArray(elementTemplates) ? elementTemplates : [];
  const sugeridosElemento = plantillas
    .filter((item) => templateLabel(item).toLowerCase().includes(busquedaElemento.toLowerCase()))
    .filter((item) => String(item.id) !== String(form.templateId))
    .map((item) => ({ id: item.id, nombre: templateLabel(item) || String(item.id) }));
  const sugeridosCliente = clientesSugeridos
    .filter((item) => String(item.id) !== String(form.client?.id))
    .map((item) => ({
      id: item.id,
      nombre: [item.name, item.cuit ? `CUIT ${item.cuit}` : null].filter(Boolean).join(" · "),
    }));
  const elementoSeleccionado = form.templateId
    ? { id: form.templateId, nombre: form.templateLabel || "Elemento" }
    : null;
  const clienteSeleccionado = form.client
    ? {
        id: form.client.id,
        nombre: [form.client.name, form.client.cuit ? `CUIT ${form.client.cuit}` : null].filter(Boolean).join(" · "),
      }
    : null;

  const frecuentesElemento = plantillas
    .map((template) => ({
      id: template.id,
      nombre: templateLabel(template) || String(template.id),
      uses:
        elementKeys(template.product, template.manufacturer, template.country).reduce(
          (max, key) => Math.max(max, uso.elements.get(key) || 0),
          0,
        ),
      template,
    }))
    .filter((item) => item.uses > 0)
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 3);
  const frecuentesCliente = (uso.agenda || [])
    .map((client) => ({
      id: client.id,
      nombre: [client.name, client.cuit ? `CUIT ${client.cuit}` : null].filter(Boolean).join(" · "),
      uses: uso.clients.get(cuitKey(client.cuit)) || 0,
      client,
    }))
    .filter((item) => item.uses > 0)
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 3);

  return (
    <>
      <AltaStepper
        kicker="Nueva solicitud"
        steps={STEPS}
        step={step}
        onStep={irA}
        error={errorPaso}
        onBack={() => irA(step - 1)}
        onNext={step < STEPS.length - 1 ? siguiente : () => void confirmar()}
        nextLabel={
          step === STEPS.length - 1
            ? (guardando ? "Confirmando..." : "Confirmar")
            : "Siguiente"
        }
        submitting={guardando}
        nextDisabled={guardando}
        backDisabled={guardando || step === 0}
      >
        {paso === "ensayo" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de ensayo</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tipos.map((tipo) => {
                  const seleccionado = String(tipo.id) === String(form.typeId);
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, typeId: tipo.id, typeName: tipo.name }))
                      }
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        seleccionado ? "border-primary bg-primary/10" : "hover:bg-muted/50",
                      )}
                    >
                      <p className="font-medium">{tipo.name}</p>
                    </button>
                  );
                })}
                <BotonNuevo
                  label="Nuevo tipo de ensayo"
                  activo={altaEnsayo}
                  onClick={() => setAltaEnsayo((val) => !val)}
                />
              </div>
            </div>

            {altaEnsayo ? (
              <form onSubmit={crearEnsayo} className="rounded-xl border border-dashed p-4">
                <p className="text-xs font-semibold text-foreground">Crear tipo de ensayo</p>
                <div className="mt-3 flex gap-2">
                  <Input
                    required
                    placeholder="Nombre del tipo de ensayo"
                    value={nombreEnsayo}
                    onChange={(event) => setNombreEnsayo(event.target.value)}
                  />
                  <Button type="button" variant="ghost" onClick={() => setAltaEnsayo(false)} disabled={creandoEnsayo}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!nombreEnsayo.trim() || creandoEnsayo}>
                    {creandoEnsayo ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}

        {paso === "elemento" ? (
          <div className="space-y-5">
            <OpcionesFrecuentes
              items={frecuentesElemento}
              selectedId={form.templateId}
              onSelect={(item) =>
                setForm((current) => ({
                  ...current,
                  templateId: item.id,
                  templateLabel: templateLabel(item.template),
                }))
              }
            />

            <SelectorParte
              etiqueta="Elemento a ensayar"
              placeholder="Producto, fabricante o país"
              seleccionado={elementoSeleccionado}
              sugeridos={sugeridosElemento}
              onBuscar={setBusquedaElemento}
              onElegir={(item) => {
                const template = plantillas.find((row) => String(row.id) === String(item.id));
                setForm((current) => ({
                  ...current,
                  templateId: item.id,
                  templateLabel: template ? templateLabel(template) : item.nombre,
                }));
              }}
              onQuitar={() => setForm((current) => ({ ...current, templateId: "", templateLabel: "" }))}
              creando={creandoElemento}
              onAbrirAlta={(nombre) => {
                setPrefillProducto(nombre || "");
                setCreandoElemento(true);
              }}
              alta={
                <AltaElementoForm
                  key={prefillProducto}
                  product={prefillProducto}
                  countries={countries || []}
                  saving={creandoPlantilla}
                  onCancel={() => setCreandoElemento(false)}
                  onSubmit={crearElemento}
                />
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="ensayo-fecha">Fecha de toma de muestra</Label>
                <Input
                  id="ensayo-fecha"
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ensayo-lote">Número de lote</Label>
                <Input
                  id="ensayo-lote"
                  required
                  placeholder="Número de lote"
                  value={form.batch_number}
                  onChange={(event) => setForm((current) => ({ ...current, batch_number: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ensayo-obs">Observaciones</Label>
              <textarea
                id="ensayo-obs"
                className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form.observations}
                onChange={(event) => setForm((current) => ({ ...current, observations: event.target.value }))}
              />
            </div>
          </div>
        ) : null}

        {paso === "solicitante" ? (
          <div className="space-y-6">
            {!isLaboratory ? (
              /* VISTA CLIENTE */
              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span>Tu perfil de solicitante</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Los ensayos que solicites tendrán asociados tus datos como solicitante directo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Nombre: </span>
                      <span className="font-medium text-foreground">{myProfile?.name || user?.name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DNI: </span>
                      <span className="font-medium text-foreground">{myProfile?.dni || user?.dni || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium text-foreground">{myProfile?.mail || user?.mail || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teléfono: </span>
                      <span className="font-medium text-foreground">
                        {formatPhoneStr(myProfile?.phone) || (typeof myProfile?.phone === "string" ? myProfile.phone : "—")}
                      </span>
                    </div>
                    {(myProfile?.address || myProfile?.location) && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Domicilio: </span>
                        <span className="font-medium text-foreground">
                          {[myProfile?.address, myProfile?.location, myProfile?.district?.name || myProfile?.district].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">¿A nombre de quién solicitás el ensayo?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestType("self");
                        const autoCl = findSelfClient(uso.agenda, myProfile, user);
                        setForm((c) => ({
                          ...c,
                          client: autoCl || null,
                          contact: myProfile || c.contact,
                        }));
                      }}
                      className={cn(
                        "flex flex-col text-left p-4 rounded-xl border transition-all",
                        requestType === "self"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <span className="font-semibold text-sm text-foreground">A mí mismo (Particular)</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        El ensayo y la solicitud quedarán a tu nombre personal.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRequestType("company");
                        setForm((c) => ({ ...c, client: null }));
                      }}
                      className={cn(
                        "flex flex-col text-left p-4 rounded-xl border transition-all",
                        requestType === "company"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <span className="font-semibold text-sm text-foreground">Representando a una empresa</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        El ensayo se gestionará y facturará a nombre de la empresa que elijas.
                      </span>
                    </button>
                  </div>
                </div>

                {requestType === "self" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Building2 className="h-4 w-4" />
                      <span>Datos del cliente / titular (Particular)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El ensayo se registrará y facturará a tu nombre como titular particular.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Titular: </span>
                        <span className="font-medium text-foreground">
                          {form.client?.name || myProfile?.name || user?.name || "Particular"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Identificación: </span>
                        <span className="font-medium text-foreground">
                          {form.client?.cuit
                            ? `CUIT ${form.client.cuit}`
                            : (myProfile?.dni ? `DNI ${myProfile.dni}` : (user?.dni ? `DNI ${user.dni}` : "—"))}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Domicilio fiscal: </span>
                        <span className="font-medium text-foreground">
                          {[
                            form.client?.address?.address || myProfile?.address,
                            form.client?.address?.location || myProfile?.location,
                            form.client?.address?.province || (typeof form.client?.address?.district === "object" ? form.client?.address?.district?.name : form.client?.address?.district) || myProfile?.district?.name || myProfile?.district
                          ].filter(Boolean).join(", ") || "Domicilio del solicitante"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {requestType === "company" && (
                  <div className="space-y-4 pt-2 border-t border-border">
                    <OpcionesFrecuentes
                      items={frecuentesCliente}
                      selectedId={form.client?.id}
                      onSelect={(item) => setForm((current) => ({ ...current, client: item.client }))}
                    />
                    <SelectorParte
                      etiqueta="Empresa a representar"
                      placeholder="Nombre o CUIT de la empresa"
                      seleccionado={clienteSeleccionado}
                      sugeridos={sugeridosCliente}
                      onBuscar={buscarClientes}
                      onElegir={(item) => {
                        const client = clientesSugeridos.find((row) => String(row.id) === String(item.id));
                        if (client) setForm((current) => ({ ...current, client }));
                      }}
                      onQuitar={() => setForm((current) => ({ ...current, client: null }))}
                      onAbrirAlta={() => setCrearCliente(true)}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* VISTA LABORATORIO */
              <div className="space-y-5">
                <OpcionesFrecuentes
                  items={frecuentesCliente}
                  selectedId={form.client?.id}
                  onSelect={(item) => {
                    const client = item.client;
                    const isApplicant = isClientTheApplicant(client);
                    setForm((current) => ({
                      ...current,
                      client,
                      contact: isApplicant ? (client?.contact || client) : null,
                    }));
                  }}
                />
                <SelectorParte
                  etiqueta="Empresa / Cliente"
                  placeholder="Nombre o CUIT del cliente"
                  seleccionado={clienteSeleccionado}
                  sugeridos={sugeridosCliente}
                  onBuscar={buscarClientes}
                  onElegir={(item) => {
                    const client = clientesSugeridos.find((row) => String(row.id) === String(item.id));
                    if (client) {
                      const isApplicant = isClientTheApplicant(client);
                      setForm((current) => ({
                        ...current,
                        client,
                        contact: isApplicant ? (client?.contact || client) : null,
                      }));
                    }
                  }}
                  onQuitar={() => setForm((current) => ({ ...current, client: null, contact: null }))}
                  onAbrirAlta={() => setCrearCliente(true)}
                />

                {form.client?.id && (
                  clientIsApplicant ? (
                    <div className="pt-3 border-t border-border">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            El cliente es el solicitante
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {form.client.name} {form.client.cuit ? `(CUIT ${form.client.cuit})` : ""} figura directamente como el solicitante del ensayo. No es necesario asociar un solicitante adicional.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Solicitante asociado para este ensayo
                        </Label>
                        {!addingNewContact && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingNewContact(true)}
                            className="gap-1.5 h-8 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Nuevo solicitante
                          </Button>
                        )}
                      </div>

                      {/* Formulario para nuevo solicitante */}
                      {addingNewContact && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                          <p className="text-xs font-semibold text-foreground">
                            Añadir nuevo solicitante a {form.client.name || "la empresa"}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nombre completo *</Label>
                              <Input
                                placeholder="Nombre del solicitante"
                                value={newContactForm.name}
                                onChange={(e) => setNewContactForm((f) => ({ ...f, name: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">DNI</Label>
                              <Input
                                placeholder="Número de DNI"
                                value={newContactForm.dni}
                                onChange={(e) => setNewContactForm((f) => ({ ...f, dni: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Email</Label>
                              <Input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={newContactForm.mail}
                                onChange={(e) => setNewContactForm((f) => ({ ...f, mail: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Teléfono</Label>
                              <div className="flex gap-2">
                                <select
                                  value={newContactForm.country_code || "54"}
                                  onChange={(e) =>
                                    setNewContactForm((f) => ({ ...f, country_code: e.target.value }))
                                  }
                                  className="flex h-9 w-24 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                  {(countries || [])
                                    .filter((c) => c.country_code)
                                    .map((c) => (
                                      <option key={c.id || c.country_code} value={String(c.country_code).trim()}>
                                        +{String(c.country_code).trim()}
                                      </option>
                                    ))}
                                  {(!countries || countries.length === 0) && <option value="54">+54</option>}
                                </select>
                                <Input
                                  placeholder="Ej: 11 2345-6789"
                                  value={newContactForm.phone}
                                  onChange={(e) =>
                                    setNewContactForm((f) => ({
                                      ...f,
                                      phone: e.target.value.replace(/[^\d\s-]/g, ""),
                                    }))
                                  }
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAddingNewContact(false);
                                setNewContactForm({ name: "", dni: "", country_code: "54", phone: "", mail: "" });
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={!newContactForm.name.trim() || savingNewContact}
                              onClick={async () => {
                                setSavingNewContact(true);
                                try {
                                  const payload = {
                                    name: newContactForm.name.trim(),
                                    dni: newContactForm.dni?.trim() || undefined,
                                    mail: newContactForm.mail?.trim() || undefined,
                                    phone: newContactForm.phone?.trim()
                                      ? {
                                          country_code: (newContactForm.country_code || "54").trim(),
                                          phone: newContactForm.phone.trim(),
                                        }
                                      : undefined,
                                    countryCode: (newContactForm.country_code || "54").trim(),
                                  };
                                  await clientsService.addContact(form.client.id, payload);
                                  const freshContacts = await clientsService.getContacts(form.client.id);
                                  setCompanyContacts(freshContacts);
                                  const created =
                                    freshContacts.find((c) => c.name === newContactForm.name.trim()) ||
                                    freshContacts[freshContacts.length - 1];
                                  if (created) {
                                    setForm((c) => ({ ...c, contact: created }));
                                  }
                                  setAddingNewContact(false);
                                  setNewContactForm({ name: "", dni: "", country_code: "54", phone: "", mail: "" });
                                  toastSuccess("Solicitante añadido y asociado a la empresa.");
                                } catch (err) {
                                  toastError("Error al añadir solicitante");
                                } finally {
                                  setSavingNewContact(false);
                                }
                              }}
                            >
                              {savingNewContact ? "Guardando..." : "Guardar y asociar"}
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* Lista de solicitantes asociados */}
                    {companyContacts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {companyContacts.map((contact) => {
                          const isSelected = String(form.contact?.id) === String(contact.id);
                          return (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => setForm((c) => ({ ...c, contact }))}
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition-all flex flex-col justify-between",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                                  : "border-border hover:bg-muted/50"
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-foreground">{contact.name}</span>
                                  {isSelected && (
                                    <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
                                      Seleccionado
                                    </span>
                                  )}
                                </div>
                                {contact.dni && (
                                  <p className="text-xs text-muted-foreground mt-0.5">DNI: {contact.dni}</p>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                                {contact.mail && <span>✉ {contact.mail}</span>}
                                {(contact.phone?.phone || (typeof contact.phone === "string" && contact.phone)) && (
                                  <span>📞 {contact.phone?.phone || contact.phone}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      !addingNewContact && (
                        <div className="text-center py-4 border border-dashed rounded-xl text-xs text-muted-foreground">
                          No hay solicitantes asociados a esta empresa.{" "}
                          <button
                            type="button"
                            className="text-primary underline font-medium"
                            onClick={() => setAddingNewContact(true)}
                          >
                            Añadí uno nuevo
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          )}
          </div>
        ) : null}

        {paso === "resumen" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  Ensayo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{form.typeName || "—"}</p>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Elemento a ensayar
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Elemento</p>
                  <p className="font-medium">{form.templateLabel || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Toma de muestra</p>
                  <p className="font-medium">{formatDate(form.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lote</p>
                  <p className="font-medium">{form.batch_number || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="font-medium">{form.observations || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card size="sm" className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Cliente y solicitante
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Empresa / Titular</p>
                  <p className="font-medium">
                    {!isLaboratory && requestType === "self"
                      ? `${form.client?.name || myProfile?.name || user?.name || "Particular"} (A nombre propio)`
                      : form.client?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CUIT / DNI</p>
                  <p className="font-medium">
                    {form.client?.cuit
                      ? `CUIT ${form.client.cuit}`
                      : (!isLaboratory && requestType === "self"
                          ? (myProfile?.dni ? `DNI ${myProfile.dni}` : (user?.dni ? `DNI ${user.dni}` : "—"))
                          : "—")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="font-medium">
                    {!isLaboratory
                      ? `${myProfile?.name || user?.name || "—"}${myProfile?.dni || user?.dni ? ` (DNI: ${myProfile?.dni || user?.dni})` : ""}`
                      : clientIsApplicant
                        ? `${form.client?.name || "—"} (El cliente es el solicitante)`
                        : `${form.contact?.name || "—"}${form.contact?.dni ? ` (DNI: ${form.contact.dni})` : ""}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contacto del solicitante</p>
                  <p className="font-medium">
                    {!isLaboratory
                      ? [
                          myProfile?.mail || user?.mail,
                          formatPhoneStr(myProfile?.phone)
                        ].filter(Boolean).join(" · ") || "—"
                      : clientIsApplicant
                        ? [
                            form.client?.contact?.mail || form.contact?.mail,
                            formatPhoneStr(form.client?.contact?.phone || form.contact?.phone)
                          ].filter(Boolean).join(" · ") || "—"
                        : [
                            form.contact?.mail,
                            formatPhoneStr(form.contact?.phone)
                          ].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Domicilio</p>
                  <p className="font-medium">
                    {[
                      form.client?.address?.address || myProfile?.address,
                      form.client?.address?.location || myProfile?.location,
                      form.client?.address?.province || (typeof form.client?.address?.district === "object" ? form.client?.address?.district?.name : form.client?.address?.district) || myProfile?.district?.name || myProfile?.district
                    ].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="sm:col-span-2 rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-start gap-3 transition-colors hover:bg-muted/50">
              <input
                id="client_notifications_enabled"
                type="checkbox"
                checked={form.client_notifications_enabled !== false}
                onChange={(e) =>
                  setForm((c) => ({
                    ...c,
                    client_notifications_enabled: e.target.checked,
                  }))
                }
                className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary/30 accent-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <label
                  htmlFor="client_notifications_enabled"
                  className="font-medium text-foreground cursor-pointer select-none"
                >
                  Recibir notificaciones por correo sobre el estado de la solicitud
                </label>
                <p className="text-muted-foreground leading-relaxed">
                  Te avisaremos por email en cada cambio de estado (aprobación, recepción de muestras, emisión de informe, etc.). Podés darte de baja en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </AltaStepper>

      {crearCliente
        ? createPortal(
            <Modal show bare wide zIndex={6200} onClose={() => setCrearCliente(false)}>
              <CreateClientModal
                onCancel={() => setCrearCliente(false)}
                onCreated={(client) => {
                  const isApplicant = isClientTheApplicant(client);
                  setForm((current) => ({
                    ...current,
                    client,
                    contact: isApplicant ? (client?.contact || client) : null,
                  }));
                  setCrearCliente(false);
                }}
              />
            </Modal>,
            document.body,
          )
        : null}
    </>
  );
}

export default function EssayRequestModal({ show, onClose, onCreated }) {
  return (
    <Modal show={show} onClose={onClose} bare wide>
      {show ? <EssayAltaStepper onCreated={onCreated} /> : null}
    </Modal>
  );
}
