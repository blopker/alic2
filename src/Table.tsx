import { createEffect, For } from "solid-js";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  createSolidTable,
} from "@tanstack/solid-table";
import { createSignal, Show } from "solid-js";
import { store } from "./store";
import type { FileEntry } from "./bindings";

export function Table() {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [files, setFiles] = createSignal<FileEntry[]>([]);
  const columns: ColumnDef<FileEntry>[] = [
    {
      accessorKey: "status",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "file",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "savings",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "size",
      cell: (info) => info.getValue(),
    },
  ];

  const table = createSolidTable({
    get data() {
      return store.files;
    },
    columns,
    state: {
      get sorting() {
        return sorting();
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // debugTable: true,
  });

  return (
    <div class="w-full grow">
      <table class="w-full">
        <thead class="sticky top-0 bg-[#1b1b1b] border-b-[1px] border-gray-700">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th class="px-2" colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        <div
                          class={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : undefined
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyPress={() => {}}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {(row) => (
              <tr class="even:bg-[#262626] hover:bg-gray-700 cursor-default">
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <td class="px-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

export default Table;
