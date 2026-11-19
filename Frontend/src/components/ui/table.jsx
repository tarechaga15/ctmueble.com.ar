import { cn } from "@/lib/utils";

function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-0", className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return (
    <tbody data-slot="table-body" className={cn("[&_tr]:border-t [&_tr]:border-border", className)} {...props} />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-auto px-4 py-3 text-left align-middle text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn("px-4 py-3 align-middle whitespace-nowrap", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
