import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataCacheProvider } from "./context/DataCacheContext";
import { EssayDraftProvider } from "./context/EssayDraftContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Essays from "./pages/Essays";
import PrivateLayout from "./layouts/PrivateLayout";
import EssayRequest from "./pages/EssayRequest";
import EssayDetail from "./pages/EssayDetail";
import Samples from "./pages/Samples";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import Config from "./pages/Config";
import AccountSettings from "./pages/AccountSettings";
import Unsubscribe from "./pages/Unsubscribe";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DataCacheProvider>
          <AuthProvider>
            <EssayDraftProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/notificaciones/baja" element={<Unsubscribe />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateLayout>
                        <Dashboard />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/essays"
                    element={
                      <PrivateLayout>
                        <Essays />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/solicitudes"
                    element={
                      <PrivateLayout>
                        <Essays />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/essay-request"
                    element={
                      <PrivateLayout>
                        <EssayRequest />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/essay/:id"
                    element={
                      <PrivateLayout>
                        <EssayDetail />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/samples"
                    element={
                      <PrivateLayout>
                        <Samples />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <PrivateLayout>
                        <Clients />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/clients/:id"
                    element={
                      <PrivateLayout>
                        <ClientDetail />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/samples/:id"
                    element={
                      <PrivateLayout>
                        <WorkOrderDetail />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/config"
                    element={
                      <PrivateLayout>
                        <Config />
                      </PrivateLayout>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <PrivateLayout>
                        <AccountSettings />
                      </PrivateLayout>
                    }
                  />
                  {/* Redirección por defecto */}
                  <Route path="*" element={<Login />} />
                </Routes>
              </BrowserRouter>
            </EssayDraftProvider>
          </AuthProvider>
        </DataCacheProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
