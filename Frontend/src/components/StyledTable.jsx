import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export default function StyledTable({
  columns,
  data,
  emptyMessage = "No hay datos disponibles.",
  isLoading = false,
  onRowClick,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 overflow-hidden rounded-3xl border border-border bg-card p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row?.id ?? rowIndex}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {column.render ? column.render(row, rowIndex) : row[column.accessor] || "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
