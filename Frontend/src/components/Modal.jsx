import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

let openModalsCount = 0;

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Contenedor de pie de modal sticky para usar dentro de modales con scroll interno.
 */
export function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-4 -mb-4 mt-auto flex shrink-0 items-center justify-end gap-2 border-t border-border bg-popover/95 px-4 py-3 backdrop-blur-xs z-10",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Modal({
  show,
  onClose,
  children,
  title,
  footer,
  onSubmit,
  wide = false,
  bare = false,
  zIndex = 5000,
  contentClassName,
  footerClassName,
}) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueo de scroll global controlado por contador para admitir modales anidados
  useEffect(() => {
    if (!show) return;
    openModalsCount++;
    document.body.style.overflow = "hidden";

    return () => {
      openModalsCount = Math.max(0, openModalsCount - 1);
      if (openModalsCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [show]);

  // Cerrar con Escape
  useEffect(() => {
    if (!show || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  const modalMarkup = (
    <AnimatePresence>
      {show && (
        <motion.div
          key="modal-backdrop-wrapper"
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          style={{ zIndex }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={onClose}
        >
          {/* Fondo oscuro con cobertura total extendida (-inset-y-16) para que nunca quede ninguna franja descubierta */}
          <div
            className="fixed inset-0 -inset-y-16 w-full h-[calc(100%+8rem)] min-h-[100dvh] bg-black/50 backdrop-blur-[2px] pointer-events-none"
            aria-hidden="true"
          />

          {/* Tarjeta del modal */}
          <motion.div
            key="modal-card"
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10",
              "rounded-t-2xl sm:rounded-xl rounded-b-none sm:rounded-b-xl",
              wide
                ? "h-[90dvh] sm:h-[min(85vh,760px)] max-w-4xl"
                : "max-h-[90dvh] sm:max-h-[90vh] max-w-2xl",
            )}
            initial={isMobile ? { y: "100%" } : { scale: 0.96 }}
            animate={isMobile ? { y: 0 } : { scale: 1 }}
            exit={isMobile ? { y: "100%" } : { scale: 0.96 }}
            transition={
              isMobile
                ? { type: "spring", damping: 28, stiffness: 280 }
                : { duration: 0.15, ease: "easeOut" }
            }
            onClick={(event) => event.stopPropagation()}
          >
            {bare ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "absolute top-3 right-3 z-20")}
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
              </>
            ) : (
              (() => {
                const headerContent = title ? (
                  <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                    <h3 className="m-0 text-base font-medium">{title}</h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null;

                const bodyContent = (
                  <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4", contentClassName)}>
                    {children}
                  </div>
                );

                const footerContent = footer ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3 z-10",
                      footerClassName
                    )}
                  >
                    {footer}
                  </div>
                ) : null;

                return (
                  <>
                    {headerContent}
                    {onSubmit ? (
                      <form
                        onSubmit={onSubmit}
                        className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-0"
                      >
                        {bodyContent}
                        {footerContent}
                      </form>
                    ) : (
                      <>
                        {bodyContent}
                        {footerContent}
                      </>
                    )}
                  </>
                );
              })()
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(modalMarkup, document.body);
}

Modal.Footer = ModalFooter;
