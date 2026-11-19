import { createContext, useContext, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { useTheme } from "./ThemeContext";

const ToastContext = createContext(null);

function ToastViewport() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors position="top-right" closeButton theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}

export function ToastProvider({ children }) {
  const value = useMemo(
    () => ({
      success: (message) => {
        if (message) toast.success(message);
      },
      error: (message) => {
        if (message) toast.error(message);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
