import { useNavigate } from "react-router-dom";
import EssayRequestModal from "../components/modals/EssayRequestModal";

export default function EssayRequest() {
  const navigate = useNavigate();

  return (
    <EssayRequestModal
      show
      onClose={() => navigate("/dashboard")}
      onCreated={(essay) => navigate(essay?.id ? `/essay/${essay.id}` : "/dashboard")}
    />
  );
}
