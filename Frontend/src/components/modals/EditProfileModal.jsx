import { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, Loader2, Check, AlertCircle, ShieldCheck } from "lucide-react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { useDataCache } from "../../context/DataCacheContext";
import { useToast } from "../../context/ToastContext";
import { personsService } from "../../services/personsService";
import { usersService } from "../../services/usersService";

const FALLBACK_PROVINCES = [
  { id: "AR-C", name: "Ciudad Autónoma de Buenos Aires" },
  { id: "AR-B", name: "Buenos Aires" },
  { id: "AR-K", name: "Catamarca" },
  { id: "AR-H", name: "Chaco" },
  { id: "AR-U", name: "Chubut" },
  { id: "AR-X", name: "Córdoba" },
  { id: "AR-W", name: "Corrientes" },
  { id: "AR-E", name: "Entre Ríos" },
  { id: "AR-P", name: "Formosa" },
  { id: "AR-Y", name: "Jujuy" },
  { id: "AR-L", name: "La Pampa" },
  { id: "AR-F", name: "La Rioja" },
  { id: "AR-M", name: "Mendoza" },
  { id: "AR-N", name: "Misiones" },
  { id: "AR-Q", name: "Neuquén" },
  { id: "AR-R", name: "Río Negro" },
  { id: "AR-A", name: "Salta" },
  { id: "AR-J", name: "San Juan" },
  { id: "AR-D", name: "San Luis" },
  { id: "AR-Z", name: "Santa Cruz" },
  { id: "AR-S", name: "Santa Fe" },
  { id: "AR-G", name: "Santiago del Estero" },
  { id: "AR-V", name: "Tierra del Fuego" },
  { id: "AR-T", name: "Tucumán" },
];

export default function EditProfileModal({ show, onClose, onUpdated }) {
  const { user, refreshUser } = useAuth();
  const { districts, loadDistricts, countries, loadCountries } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState(null);

  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [mail, setMail] = useState("");
  const [countryCode, setCountryCode] = useState("54");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("AR-C");

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!show) return;

    if (!districts) {
      loadDistricts?.().catch(() => {});
    }
    if (!countries) {
      loadCountries?.().catch(() => {});
    }

    let isMounted = true;
    setLoading(true);
    setFieldErrors({});

    async function fetchProfile() {
      try {
        const myProfile = await personsService.getMyProfile().catch(() => null);
        if (!isMounted) return;

        if (myProfile) {
          setProfileId(myProfile.id || null);
          setName(myProfile.name || user?.name || "");
          setDni(myProfile.dni || user?.dni || "");
          setMail(myProfile.mail || user?.mail || "");

          const pCountry =
            myProfile.phone?.country_code ||
            myProfile.country_code ||
            myProfile.countryCode ||
            "54";
          setCountryCode(String(pCountry).trim());

          const pPhone =
            myProfile.phone?.phone ||
            (typeof myProfile.phone === "string" ? myProfile.phone : "") ||
            "";
          setPhone(pPhone);

          setAddress(myProfile.address || "");
          setLocation(myProfile.location || "");

          const distId = myProfile.district?.id || myProfile.district || "AR-C";
          setDistrict(distId);
        } else {
          // Fallback a los datos del usuario autenticado
          setProfileId(null);
          setName(user?.name || "");
          setDni(user?.dni || "");
          setMail(user?.mail || "");
          setCountryCode("54");
          setPhone("");
          setAddress("");
          setLocation("");
          setDistrict("AR-C");
        }
      } catch (err) {
        if (!isMounted) return;
        setName(user?.name || "");
        setDni(user?.dni || "");
        setMail(user?.mail || "");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [show, user, districts, loadDistricts, countries, loadCountries]);

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "El nombre es obligatorio";
    if (!dni.trim()) {
      errors.dni = "El DNI es obligatorio";
    } else if (dni.replace(/\D/g, "").length < 7) {
      errors.dni = "El DNI debe tener entre 7 y 8 dígitos";
    }
    if (!mail.trim()) {
      errors.mail = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) {
      errors.mail = "Formato de correo no válido";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const cleanCountry = (countryCode || "54").replace(/\D/g, "").slice(0, 3);
      const cleanPhone = phone.trim();

      const payload = {
        name: name.trim(),
        dni: dni.replace(/\D/g, "").slice(0, 8),
        mail: mail.trim().toLowerCase(),
        phone: cleanPhone
          ? {
              country_code: cleanCountry,
              phone: cleanPhone,
            }
          : undefined,
        country_code: cleanCountry,
        countryCode: cleanCountry,
        address: address.trim() || undefined,
        location: location.trim() || undefined,
        district: district || undefined,
        province: district || undefined,
      };

      if (user?.profile === "CLIENT") {
        // En usuarios cliente, updateClientData actualiza person y sincroniza users
        await usersService.updateClientData(payload);
      } else if (profileId) {
        await personsService.update(profileId, payload);
      }

      await refreshUser?.();
      showSuccessToast("Tus datos personales y de solicitante fueron actualizados.");
      onUpdated?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Error al actualizar los datos";
      showErrorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const provinceOptions =
    Array.isArray(districts) && districts.length > 0
      ? districts
      : FALLBACK_PROVINCES;

  const isClient = user?.profile === "CLIENT";

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Editar Perfil"
      wide={false}
      onSubmit={handleSave}
      footer={
        !loading ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="rounded-lg h-9 gap-1.5 px-4"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </>
        ) : null
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Cargando tus datos de perfil...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {isClient && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="size-4" />
              </div>
              <div className="text-xs leading-relaxed space-y-1">
                <span className="font-semibold text-foreground block">
                  Datos del Solicitante
                </span>
                <p className="text-muted-foreground">
                  Estos datos corresponden a tu ficha de solicitante. Cualquier cambio se reflejará automáticamente en las solicitudes de ensayo que realices.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <User className="size-3.5 text-primary" />
              Datos Personales
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="profile-name" className={fieldErrors.name ? "text-destructive" : ""}>
                  Nombre y Apellido *
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Ej. Juan Pérez"
                  className={`h-10 rounded-lg bg-card transition-colors ${
                    fieldErrors.name
                      ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                      : "border-input"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile-dni" className={fieldErrors.dni ? "text-destructive" : ""}>
                  DNI *
                </Label>
                <Input
                  id="profile-dni"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                    if (fieldErrors.dni) setFieldErrors((p) => ({ ...p, dni: undefined }));
                  }}
                  placeholder="Ej. 30123456"
                  className={`h-10 rounded-lg bg-card transition-colors ${
                    fieldErrors.dni
                      ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                      : "border-input"
                  }`}
                />
                {fieldErrors.dni && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.dni}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile-mail" className={fieldErrors.mail ? "text-destructive" : ""}>
                  Correo Electrónico *
                </Label>
                <Input
                  id="profile-mail"
                  value={mail}
                  onChange={(e) => {
                    setMail(e.target.value);
                    if (fieldErrors.mail) setFieldErrors((p) => ({ ...p, mail: undefined }));
                  }}
                  placeholder="correo@ejemplo.com"
                  className={`h-10 rounded-lg bg-card transition-colors ${
                    fieldErrors.mail
                      ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                      : "border-input"
                  }`}
                />
                {fieldErrors.mail && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.mail}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTACTO TELEFÓNICO */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Phone className="size-3.5 text-primary" />
              Teléfono de Contacto
            </div>
            <div className="space-y-1">
              <Label htmlFor="profile-phone">Número de contacto</Label>
              <div className="flex gap-2">
                <select
                  value={countryCode || "54"}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-10 w-24 rounded-lg border border-input bg-card px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 11 4455-6677"
                  className="h-10 flex-1 rounded-lg bg-card border-input"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Prefijo de país y teléfono para notificaciones de ensayos.
              </p>
            </div>
          </div>

          {/* SECCIÓN 3: DOMICILIO */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <MapPin className="size-3.5 text-primary" />
              Domicilio
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="profile-address">Dirección</Label>
                <Input
                  id="profile-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, piso/depto"
                  className="h-10 rounded-lg bg-card border-input"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile-location">Localidad</Label>
                <Input
                  id="profile-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad o localidad"
                  className="h-10 rounded-lg bg-card border-input"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile-district">Provincia</Label>
                <select
                  id="profile-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {provinceOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
