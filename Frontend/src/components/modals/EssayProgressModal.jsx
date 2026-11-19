import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../Modal";

export default function EssayProgressModal({ show, onClose, steps, activeIndex }) {
  const [view, setView] = useState(activeIndex);

  useEffect(() => {
    if (show) setView(activeIndex);
  }, [show, activeIndex]);

  const current = steps[view] || steps[0];

  return (
    <Modal show={show} onClose={onClose} bare wide>
      <div className="flex h-full min-h-0">
        <aside className="flex w-52 shrink-0 flex-col border-r bg-muted/40 p-4">
          <p className="mb-4 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Progreso</p>
          <ol className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const done = index < activeIndex;
              const active = index === activeIndex;
              const selected = index === view;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setView(index)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                      selected && "bg-background shadow-sm",
                      !selected && done && "text-foreground",
                      !selected && !done && !active && "text-muted-foreground",
                      "hover:bg-background/80",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                        active && "border-primary bg-primary text-primary-foreground",
                        done && "border-primary bg-primary/15 text-primary",
                        !active && !done && "border-border",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="block leading-tight font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b px-6 py-4 pr-12">
            <h2 className="font-heading text-base leading-none font-medium">{current?.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {view < activeIndex ? "Paso cumplido" : view === activeIndex ? "Paso actual" : "Paso siguiente"}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <p className="text-sm">{current?.hint}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
