import { Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AltaStepper({
  kicker,
  steps,
  step,
  onStep,
  children,
  error,
  onBack,
  onNext,
  nextLabel = "Siguiente",
  backDisabled = false,
  nextDisabled = false,
  submitting = false,
}) {
  const current = steps[step];

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-52 shrink-0 flex-col border-r bg-muted/40 p-4">
        <p className="mb-4 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{kicker}</p>
        <ol className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const done = index < step;
            const active = index === step;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={submitting || index > step}
                  onClick={() => onStep(index)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    active && "bg-background shadow-sm",
                    done && "text-foreground",
                    !active && !done && "text-muted-foreground",
                    index <= step && !submitting && "hover:bg-background/80",
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
                  <span>
                    <span className="block leading-tight font-medium">{item.label}</span>
                    {item.hint ? (
                      <span className="block text-[11px] leading-snug text-muted-foreground">{item.hint}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b px-6 py-4 pr-12">
          <h2 className="font-heading text-base leading-none font-medium">{current?.label}</h2>
          {current?.hint ? <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
          {error ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive animate-in fade-in duration-200">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
              <div className="text-xs leading-relaxed space-y-0.5 min-w-0">
                <span className="font-semibold block text-destructive">No se pudo continuar</span>
                <p className="text-destructive/90">{error}</p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t px-6 py-3 bg-background">
          <Button
            type="button"
            variant="ghost"
            disabled={backDisabled || submitting}
            onClick={onBack}
          >
            Atrás
          </Button>
          <Button
            type="button"
            disabled={nextDisabled || submitting}
            onClick={onNext}
            className="min-w-28 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>{nextLabel || "Guardando..."}</span>
              </>
            ) : (
              <span>{nextLabel}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
