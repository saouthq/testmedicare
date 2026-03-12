/**
 * AdminDataTable — Reusable data table for all admin pages.
 * Handles: configurable columns, search, filters, pagination, CSV export,
 * row selection, bulk actions, detail drawer trigger, empty states.
 *
 * Reduces each admin page from ~300-500 lines to ~80-120 lines of config.
 */
import { useState, useMemo, useCallback } from "react";
import { Search, Download, ArrowUpDown, X, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface AdminColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  hideOnMobile?: boolean;
}

export interface AdminFilter {
  key: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
}

export interface AdminBulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: (selectedIds: Set<string>) => void;
}

export interface AdminDataTableProps<T extends { id: string }> {
  data: T[];
  columns: AdminColumn<T>[];
  filters?: AdminFilter[];
  searchPlaceholder?: string;
  searchFn?: (item: T, query: string) => boolean;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  bulkActions?: AdminBulkAction[];
  exportCsv?: {
    filename: string;
    headers: string[];
    rowFn: (item: T) => string[];
  };
  pageSize?: number;
  emptyIcon?: any;
  emptyTitle?: string;
  emptyDescription?: string;
  headerActions?: React.ReactNode;
  stats?: { label: string; value: string | number; color?: string }[];
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function AdminDataTable<T extends { id: string }>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Rechercher...",
  searchFn,
  onRowClick,
  selectable = false,
  bulkActions = [],
  exportCsv,
  pageSize = 25,
  emptyIcon = Inbox,
  emptyTitle = "Aucun résultat",
  emptyDescription = "Aucune donnée ne correspond à vos critères.",
  headerActions,
  stats,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.key, "all"]))
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  // Filtering
  const filtered = useMemo(() => {
    let result = data;

    // Search
    if (search && searchFn) {
      const q = search.toLowerCase();
      result = result.filter(item => searchFn(item, q));
    }

    // Filters
    for (const filter of filters) {
      const val = filterValues[filter.key];
      if (val && val !== "all") {
        result = result.filter(item => (item as any)[filter.key] === val);
      }
    }

    // Sort
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      if (col?.sortFn) {
        result = [...result].sort((a, b) => sortDir === "asc" ? col.sortFn!(a, b) : col.sortFn!(b, a));
      }
    }

    return result;
  }, [data, search, searchFn, filterValues, filters, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => filtered.slice(page * pageSize, (page + 1) * pageSize), [filtered, page, pageSize]);

  // Reset page on filter change
  const setFilter = useCallback((key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setPage(0);
  }, []);

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(item => item.id)));
    }
  };

  // Sort toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // CSV export
  const handleExport = () => {
    if (!exportCsv) return;
    const csv = [exportCsv.headers.join(",")]
      .concat(filtered.map(item => exportCsv.rowFn(item).map(v => `"${v}"`).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportCsv.filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-lg border bg-card p-3 text-center">
              <p className={`text-lg font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        {filters.map(f => (
          <div key={f.key} className="flex gap-1 rounded-lg border bg-card p-0.5 overflow-x-auto">
            {f.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(f.key, opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterValues[f.key] === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
                {opt.count !== undefined && <span className="opacity-70 ml-1">({opt.count})</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selectable && selectedIds.size > 0 && (
        <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} sélectionné(s)</span>
          <div className="flex gap-2">
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className={`text-xs ${action.variant === "destructive" ? "text-destructive border-destructive/30" : ""}`}
                onClick={() => action.onClick(selectedIds)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedIds(new Set())}>
              <X className="h-3.5 w-3.5 mr-1" />Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar: count + sort + export */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{filtered.length} résultat(s)</span>
        <div className="flex items-center gap-2">
          {headerActions}
          {exportCsv && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" />Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {selectable && (
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`text-left px-4 py-3 font-medium text-muted-foreground ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${col.className || ""}`}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {col.label}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(item => (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${selectedIds.has(item.id) ? "bg-primary/5" : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-border"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${col.className || ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)}>
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} compact />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} / {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
