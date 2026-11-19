import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Back({ navigateTo = "/dashboard" }) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => navigate(navigateTo)}
      aria-label="Volver"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
