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
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { FmeaType } from "@/lib/types";
import { useFmea, type FmeaRow } from "@/stores/useFmea";
import { useUI } from "@/stores/useUI";
import FmeaToolbar from "./FmeaToolbar";
import FmeaDialog from "./FmeaDialog";
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
  const { entries, searchQuery, setSearchQuery, createEntry, updateEntry, deleteEntry } =
    useFmea();
  const { addToast } = useUI();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Record<string, unknown> | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
  });

  const selectedCount = Object.keys(rowSelection).length;

  // ── Handlers ────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    setEditingEntry(null);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (row: FmeaRow) => {
      setEditingEntry(row as unknown as Record<string, unknown>);
      setDialogOpen(true);
    },
    []
  );

  const handleSave = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        if (editingEntry && typeof editingEntry.id === "number") {
          await updateEntry(fmeaType, editingEntry.id, data);
          addToast({ type: "success", message: "Entry updated successfully" });
        } else {
          await createEntry(fmeaType, data);
          addToast({ type: "success", message: "Entry created successfully" });
        }
        setDialogOpen(false);
        setEditingEntry(null);
      } catch (err) {
        addToast({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to save entry",
        });
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
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-y border-gray-200 bg-gray-50/80">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap select-none"
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-0.5 text-gray-400">
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
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No entries found. Click &ldquo;Add Row&rdquo; to create one.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 transition-colors cursor-pointer hover:bg-blue-50/40 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } ${row.getIsSelected() ? "bg-blue-50" : ""}`}
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
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
    </div>
  );
}
