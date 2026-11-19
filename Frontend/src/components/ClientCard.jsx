import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Receipt, Users, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button as UiButton } from "@/components/ui/button";
import { formatCuit, isLegalEntityCuit } from "./steps/client-creation/BussinessSearch";

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ClientCard({
  client,
  variant = "list",
  onClick,
  canDelete = false,
  onDelete,
  deleteLoading = false,
}) {
  const navigate = useNavigate();
  const isDetail = variant === "detail";

  if (!client) return null;

  const isLegal = isLegalEntityCuit(client.cuit);
  const cuitFormatted = client.cuit ? formatCuit(client.cuit) : "—";
  const name = client.name || "Cliente";

  const rawAddress = client.address;
  const addressFormatted = rawAddress
    ? [
        rawAddress.address || rawAddress.address_address,
        rawAddress.location || rawAddress.address_location,
        rawAddress.province || rawAddress.district?.name || rawAddress.district,
      ]
        .filter(Boolean)
        .join(", ") || "—"
    : "—";

  let contactFormatted = "—";
  if (Array.isArray(client.contacts) && client.contacts.length > 0) {
    const first = client.contacts[0]?.name;
    const extra = client.contacts.length - 1;
    contactFormatted = extra > 0 ? `${first} (+${extra})` : first || "—";
  } else if (client.contact?.name) {
    contactFormatted = client.contact.name;
  }

  const handleCardClick = () => {
    if (!isDetail) {
      if (onClick) {
        onClick();
      } else if (client.id) {
        navigate(`/clients/${client.id}`);
      }
    }
  };

  return (
    <Card
      className={
        !isDetail
          ? "cursor-pointer transition-colors hover:bg-muted/40 shadow-xs"
          : "shadow-xs"
      }
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="font-heading text-lg font-semibold text-foreground">
            {name}
          </CardTitle>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
            {isLegal ? "Persona Jurídica" : "Persona Física"}
          </span>
          {client.origin === "LABORATORY" && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Agenda local
            </span>
          )}
        </div>

        {isDetail && canDelete && onDelete && (
          <UiButton
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={deleteLoading}
            className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            {deleteLoading ? "Eliminando..." : "Eliminar de la agenda"}
          </UiButton>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            icon={<Building2 className="size-4" />}
            label={isLegal ? "Razón Social" : "Nombre"}
            value={name}
          />
          <Field
            icon={<Receipt className="size-4" />}
            label="CUIT"
            value={cuitFormatted}
          />
          <Field
            icon={<MapPin className="size-4" />}
            label="Domicilio"
            value={addressFormatted}
          />
          <Field
            icon={<Users className="size-4" />}
            label="Contacto / Solicitante"
            value={contactFormatted}
          />
        </div>
      </CardContent>
    </Card>
  );
}
