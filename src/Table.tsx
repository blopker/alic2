import { For } from "solid-js";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  createSolidTable,
} from "@tanstack/solid-table";
import { createSignal, Show } from "solid-js";
import { useFiles } from "./contexts";
import type { FileEntry } from "./files";

export function Table() {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [files] = useFiles();
  const columns: ColumnDef<FileEntry>[] = [
    {
      accessorKey: "file",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "status",
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
      return files();
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
    debugTable: true,
  });

  return (
    <div class="w-full">
      <table class="w-full">
        <thead class="sticky top-0 bg-gray-500">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th colSpan={header.colSpan}>
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
                            asc: " 🔼",
                            desc: " 🔽",
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
              <tr class="even:bg-gray-800 hover:bg-gray-700 cursor-default">
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <td>
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
      <div>{table.getRowModel().rows.length} Rows</div>
      <pre>{JSON.stringify(sorting(), null, 2)}</pre>
    </div>
  );
}

export default Table;
