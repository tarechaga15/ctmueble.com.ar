import { Inbox } from "lucide-react";

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
      <h3 className="text-lg font-medium">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
