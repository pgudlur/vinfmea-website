"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
  type ColumnDef,
  type ColumnResizeMode,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { FmeaType } from "@/lib/types";
import { useFmea, type FmeaRow } from "@/stores/useFmea";
import { useUI } from "@/stores/useUI";
import { CRITICALITY_ROW_COLORS, SPECIAL_CHAR_ROW_COLORS } from "@/lib/constants";
import FmeaToolbar from "./FmeaToolbar";
import FmeaDialog from "./FmeaDialog";
import TraceabilityDialog from "./TraceabilityDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  getDfmeaColumns,
  getPfmeaColumns,
  getSfmeaColumns,
  getControlPlanColumns,
} from "./ColumnDefs";

interface FmeaSpreadsheetProps {
  fmeaType: FmeaType;
}

function getColumns(type: FmeaType): ColumnDef<FmeaRow>[] {
  switch (type) {
    case "dfmea":
      return getDfmeaColumns() as ColumnDef<FmeaRow>[];
    case "pfmea":
      return getPfmeaColumns() as ColumnDef<FmeaRow>[];
    case "sfmea":
      return getSfmeaColumns() as ColumnDef<FmeaRow>[];
    case "control-plan":
      return getControlPlanColumns() as ColumnDef<FmeaRow>[];
  }
}

export default function FmeaSpreadsheet({ fmeaType }: FmeaSpreadsheetProps) {
  const { entries, searchQuery, setSearchQuery, createEntry, updateEntry, deleteEntry, fetchEntries } =
    useFmea();
  const { addToast } = useUI();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Record<string, unknown> | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceabilityEntryId, setTraceabilityEntryId] = useState<number | null>(null);
  const [lastClickedRowId, setLastClickedRowId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [zoom, setZoom] = useState(100);
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const columns = useMemo(() => getColumns(fmeaType), [fmeaType]);

  const table = useReactTable({
    data: entries,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    columnResizeMode,
    enableColumnResizing: true,
  });

  const selectedCount = Object.keys(rowSelection).length;

  // ── Handlers ────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    setEditingEntry(null);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (row: FmeaRow) => {
      setLastClickedRowId(row.id);
      setEditingEntry(row as unknown as Record<string, unknown>);
      setDialogOpen(true);
    },
    []
  );

  const handleTraceability = useCallback(() => {
    if (lastClickedRowId) {
      setTraceabilityEntryId(lastClickedRowId);
      setTraceabilityOpen(true);
    }
  }, [lastClickedRowId]);

  const handleRefresh = useCallback(async () => {
    await fetchEntries(fmeaType);
    addToast({ type: "success", message: "Data refreshed from server" });
  }, [fmeaType, fetchEntries, addToast]);

  const handleSave = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        setIsSaving(true);
        if (editingEntry && typeof editingEntry.id === "number") {
          await updateEntry(fmeaType, editingEntry.id, data);
          addToast({ type: "success", message: "Entry updated successfully" });
        } else {
          await createEntry(fmeaType, data);
          addToast({ type: "success", message: "Entry created successfully" });
        }
        setLastSavedAt(new Date());
        setDialogOpen(false);
        setEditingEntry(null);
      } catch (err) {
        addToast({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to save entry",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [fmeaType, editingEntry, createEntry, updateEntry, addToast]
  );

  const handleDeleteClick = useCallback(() => {
    if (selectedCount > 0) {
      setConfirmDeleteOpen(true);
    }
  }, [selectedCount]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const selectedIds = Object.keys(rowSelection).map(Number);
      for (const id of selectedIds) {
        await deleteEntry(fmeaType, id);
      }
      addToast({
        type: "success",
        message: `${selectedIds.length} ${selectedIds.length === 1 ? "entry" : "entries"} deleted`,
      });
      setRowSelection({});
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete entries",
      });
    } finally {
      setConfirmDeleteOpen(false);
    }
  }, [fmeaType, rowSelection, deleteEntry, addToast]);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Toolbar */}
      <FmeaToolbar
        fmeaType={fmeaType}
        onAdd={handleAdd}
        onDelete={handleDeleteClick}
        selectedCount={selectedCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTraceability={handleTraceability}
        hasSelectedRow={lastClickedRowId !== null}
        entries={entries as unknown as Record<string, unknown>[]}
        onRefresh={handleRefresh}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setZoom((z) => Math.max(50, z - 10))}
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-medium text-gray-500 w-8 text-center">{zoom}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(150, z + 10))}
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        {zoom !== 100 && (
          <button
            onClick={() => setZoom(100)}
            className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw size={12} />
          </button>
        )}
        <span className="ml-2 text-[10px] text-gray-400">Drag column borders to resize</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto">
        <table
          className="border-collapse"
          style={{
            fontSize: `${zoom / 100 * 14}px`,
            width: table.getCenterTotalSize(),
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-y border-gray-200 bg-gray-50/80">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-gray-500 select-none relative"
                    style={{
                      width: header.getSize(),
                      fontSize: `${Math.max(9, zoom / 100 * 11)}px`,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${
                          header.column.getCanSort()
                            ? "cursor-pointer hover:text-gray-800"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="ml-0.5 text-gray-400 shrink-0">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Column resize handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-400 active:bg-blue-500 ${
                          header.column.getIsResizing() ? "bg-blue-500" : "bg-transparent"
                        }`}
                        style={{ userSelect: "none" }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  No entries found. Click &ldquo;Add Row&rdquo; to create one.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => {
                // Compute row background color based on FMEA type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = row.original as any;
                let rowBgColor: string | undefined;
                if (fmeaType === "control-plan") {
                  const charClass = (data.special_char_class as string) ?? "";
                  rowBgColor = SPECIAL_CHAR_ROW_COLORS[charClass];
                } else {
                  const crit = (data.criticality as string) ?? "";
                  rowBgColor = CRITICALITY_ROW_COLORS[crit];
                }
                const fallbackBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";

                return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 transition-colors cursor-pointer hover:bg-blue-50/40 ${
                    row.getIsSelected() ? "bg-blue-50" : rowBgColor ? "" : fallbackBg
                  }`}
                  style={
                    !row.getIsSelected() && rowBgColor
                      ? { backgroundColor: rowBgColor }
                      : undefined
                  }
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-gray-700"
                      style={{
                        width: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/80 px-4 py-2 text-xs text-gray-500">
        <span>
          {table.getFilteredRowModel().rows.length} of {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"}
        </span>
        {selectedCount > 0 && (
          <span className="font-medium text-[#2563EB]">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Dialog */}
      <FmeaDialog
        open={dialogOpen}
        fmeaType={fmeaType}
        entry={editingEntry}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Entries"
        message={`Are you sure you want to delete ${selectedCount} selected ${
          selectedCount === 1 ? "entry" : "entries"
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Traceability dialog */}
      <TraceabilityDialog
        open={traceabilityOpen}
        entryType={fmeaType}
        entryId={traceabilityEntryId}
        onClose={() => {
          setTraceabilityOpen(false);
          setTraceabilityEntryId(null);
        }}
      />
    </div>
  );
}
