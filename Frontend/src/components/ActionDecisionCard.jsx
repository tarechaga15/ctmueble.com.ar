import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionDecisionCard({ label, onConfirm, onCancel = () => {}, disabled = false, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10 ${className}`}
    >
      <p className="m-0 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <Button type="button" size="icon" disabled={disabled} aria-label="Confirmar" onClick={onConfirm}>
          <Check />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          disabled={disabled}
          aria-label="Cancelar"
          onClick={onCancel}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
