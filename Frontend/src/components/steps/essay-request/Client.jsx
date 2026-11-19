import { Building2, UserRound, Phone, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../../Modal";
import CreateClientModal from "../../modals/CreateClientModal";
import ClientModal from "../../modals/Client";
import TemplateSelector from "../../TemplateSelector";
import { useDataCache } from "../../../context/DataCacheContext";
import { getDistrictDisplay } from "@/lib/districtUtils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Client({ data, onChange }) {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { districts, loadDistricts } = useDataCache();
  const selectedClient = data ?? null;

  useEffect(() => {
    if (!districts) loadDistricts?.().catch(() => {});
  }, [districts, loadDistricts]);

  const handleClientSelected = (client) => {
    onChange({ key: "client", data: client });
    setShowClientModal(false);
  };

  const handleClientCreated = (created) => {
    onChange({ key: "client", data: created });
    setShowCreateModal(false);
  };

  const selectorLabel = selectedClient
    ? `${selectedClient.name} — CUIT ${selectedClient.cuit}`
    : "Seleccionar cliente de la agenda";

  const contactPhone = selectedClient?.contact?.phone
    ? typeof selectedClient.contact.phone === "object"
      ? `+${selectedClient.contact.phone.country_code || "54"} ${selectedClient.contact.phone.phone || ""}`
      : String(selectedClient.contact.phone)
    : "—";

  return (
    <>
      <div className="space-y-4">
        {/* Selector de Cliente */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <Building2 className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Empresa o Titular Solicitante
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Seleccioná una empresa agendada o registrá una nueva en el sistema.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Empresa (Cliente)</Label>
              <TemplateSelector
                onClickSelect={() => setShowClientModal(true)}
                onClickCreate={() => setShowCreateModal(true)}
                label={selectorLabel}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ficha del Solicitante Vinculado */}
        {selectedClient && (
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <UserRound className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Ficha de Contacto y Solicitante
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Datos de contacto vinculados a la empresa seleccionada.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nombre y Apellido</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedClient?.contact?.name || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium text-foreground">
                    {contactPhone}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedClient?.contact?.mail || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Domicilio</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedClient?.contact?.address || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Localidad</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedClient?.contact?.location || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Provincia</p>
                  <p className="text-sm font-medium text-foreground">
                    {getDistrictDisplay(
                      selectedClient?.contact?.district ??
                        selectedClient?.contact?.province,
                      districts
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ClientModal
        show={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelect={handleClientSelected}
      />

      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        bare
        wide
      >
        <CreateClientModal
          onCancel={() => setShowCreateModal(false)}
          onCreated={handleClientCreated}
        />
      </Modal>
    </>
  );
}
