import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SearchBar({
  placeholder = "Buscar...",
  statusOptions = [],
  onSearch,
  onChangeQuery,
  initialQuery = "",
  initialStatus = null,
  disabled = false,
  onFilterClick,
  activeFilterCount = 0,
  onColumnsClick,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus ?? "");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setStatus(initialStatus ?? "");
  }, [initialStatus]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onSearch) {
      onSearch(query.trim(), status || null);
    }
  };

  const handleClear = () => {
    setQuery("");
    setStatus("");
    if (onChangeQuery) onChangeQuery("");
    if (onSearch) onSearch("", null);
  };

  const handleChangeText = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChangeQuery) {
      onChangeQuery(val);
    }
  };

  const showStatusSelect = Array.isArray(statusOptions) && statusOptions.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1 md:max-w-md">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChangeText}
          disabled={disabled}
          className="w-full pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar texto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showStatusSelect && (
        <select
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm md:w-44"
          value={status ?? ""}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatus(nextStatus);
            if (onSearch) onSearch(query.trim(), nextStatus || null);
          }}
          disabled={disabled}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={disabled}
          className="gap-1.5"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>

        {onFilterClick && (
          <Button
            type="button"
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={onFilterClick}
            disabled={disabled}
            className="gap-1.5"
            title="Abrir filtros avanzados"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <Badge
                variant={activeFilterCount > 0 ? "secondary" : "outline"}
                className="ml-0.5 h-4 px-1 text-[10px] font-bold"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {onColumnsClick && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onColumnsClick}
            disabled={disabled}
            className="gap-1.5"
            title="Personalizar columnas visibles"
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Columnas</span>
          </Button>
        )}
      </div>
    </form>
  );
}
