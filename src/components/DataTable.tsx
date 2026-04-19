import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  empty?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  empty = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className={`px-4 py-3 font-medium ${c.className || ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-t border-border/70 transition-colors hover:bg-secondary/40">
                  {columns.map((c) => (
                    <td key={String(c.key)} className={`px-4 py-3 ${c.className || ""}`}>
                      {c.render ? c.render(row) : (row as any)[c.key as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
