import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefreshButton({ onClick, disabled }) {
  return (
    <Button type="button" variant="outline" size="icon" onClick={onClick} disabled={disabled} aria-label="Actualizar">
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
