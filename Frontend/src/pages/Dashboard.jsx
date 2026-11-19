import { useAuth } from "../context/AuthContext";
import LaboratoryDashboard from "./LaboratoryDashboard";
import Essays from "./Essays";

export default function Dashboard() {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";

  if (isLaboratory) {
    return <LaboratoryDashboard />;
  }

  return <Essays isClientView={true} />;
}
