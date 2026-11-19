export default function StatusBadge({ status, map, onClick }) {
  const item = map?.[status] || {
    text: status || "Sin estado",
    color: "#6b6b5a",
    background: "#f0f0db",
  };

  const badge = (
    <span
      className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap"
      style={{ color: item.color, backgroundColor: item.background }}
    >
      {item.text}
    </span>
  );

  if (!onClick) return badge;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className="cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label={`Ver progreso: ${item.text}`}
    >
      {badge}
    </button>
  );
}
