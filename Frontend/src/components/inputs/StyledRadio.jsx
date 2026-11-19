/**
 * Radio nativo con apariencia personalizada (anillo + punto), alineado al UI del proyecto:
 * bordes con tokens CSS, acento var(--primary), foco visible.
 */
export default function StyledRadio({
  name,
  value,
  checked,
  onChange,
  disabled = false,
  children,
  /** Elemento opcional entre el círculo del radio y la etiqueta (p. ej. badge 21×21). */
  icon = null,
  id,
  className = "",
}) {
  const inputId = id ?? `${name}-${value}`.replace(/\s+/g, "-");

  return (
    <label
      htmlFor={inputId}
      className={`group inline-flex shrink-0 cursor-pointer select-none items-start gap-2 mr-[10px] transition-opacity duration-150 ease-out active:opacity-90 motion-reduce:active:opacity-100 ${
        disabled ? "opacity-50 cursor-not-allowed active:opacity-100" : ""
      } ${className}`.trim()}
    >
      <span className="relative isolate grid h-[21px] w-[21px] min-h-[21px] min-w-[21px] shrink-0 grid-cols-1 grid-rows-1 place-items-center [transform:translateZ(0)] [contain:layout]">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer col-start-1 row-start-1 z-[3] h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className={`pointer-events-none col-start-1 row-start-1 z-0 box-border h-[18px] w-[18px] self-center justify-self-center rounded-full border-2 bg-[var(--color-alt-content-bg-alt)] transition-[border-color,box-shadow] duration-200 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-alt-content-bg)] motion-reduce:shadow-none ${
            checked
              ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(228,31,42,0.18)]"
              : "border-[var(--color-alt-content-border)] shadow-none"
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none col-start-1 row-start-1 z-[1] box-border h-[10px] w-[10px] origin-center self-center justify-self-center rounded-full bg-[var(--primary)] transition-[opacity,transform] ease-out ${
            checked
              ? "opacity-100 duration-[400ms] ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:duration-150 motion-reduce:ease-out [transform:translateZ(0)_scale(1)]"
              : "opacity-0 duration-200 ease-out [transform:translateZ(0)_scale(0.92)]"
          }`}
        />
      </span>
      <span className="ml-[8px] flex min-h-[21px] items-center gap-2 text-sm font-medium leading-none text-[var(--color-alt-content-text)]">
        {icon && <span className="mr-[8px] flex h-[21px] w-[21px] shrink-0 items-center justify-center">{icon}</span>}
        {children}
      </span>
    </label>
  );
}
