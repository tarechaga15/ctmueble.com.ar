import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SelectorParte({
  etiqueta,
  placeholder,
  seleccionado,
  onElegir,
  onQuitar,
  sugeridos,
  onBuscar,
  onAbrirAlta,
  creando = false,
  alta = null,
  quitarTitulo = "Quitar",
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const buscarRef = useRef(onBuscar);
  buscarRef.current = onBuscar;

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = q.trim();
      setDebounced(next);
      buscarRef.current(next);
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const coincideExacto = sugeridos.some((item) => item.nombre.toLowerCase() === debounced.toLowerCase());
  const puedeCrear = debounced.length > 0 && !coincideExacto;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Label className="mb-1.5">Buscar o crear</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={placeholder}
            className="pl-9"
            autoComplete="off"
          />
        </div>
        {debounced.length > 0 && !creando ? (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-md">
            {sugeridos.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/60"
                onClick={() => {
                  onElegir(item);
                  setQ("");
                }}
              >
                <span>{item.nombre}</span>
                <span className="text-xs text-muted-foreground">Elegir</span>
              </button>
            ))}
            {!sugeridos.length ? <p className="px-3 py-2 text-sm text-muted-foreground">No hay coincidencias.</p> : null}
            {puedeCrear ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm hover:bg-muted/60"
                onClick={() => {
                  onAbrirAlta?.(debounced);
                  setQ("");
                }}
              >
                <Plus className="h-4 w-4" />
                Crear «{debounced}»
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {seleccionado ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-primary bg-primary/5 p-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{etiqueta}</p>
            <p className="truncate leading-tight font-medium">{seleccionado.nombre}</p>
          </div>
          {onQuitar ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              title={quitarTitulo}
              onClick={onQuitar}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {creando && alta ? (
        alta
      ) : (
        <button
          type="button"
          onClick={() => onAbrirAlta?.(q.trim())}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed p-3 text-left text-sm text-muted-foreground hover:bg-muted/50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed">
            <Plus className="h-4 w-4" />
          </span>
          <span className="font-medium text-foreground">Nuevo {etiqueta.toLowerCase()}</span>
        </button>
      )}
    </div>
  );
}
