import {
  type ColumnDef,
  type SortingState,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table";
import { BsArrowDownSquare } from "solid-icons/bs";
import { FaSolidCircleNotch, FaSolidXmark } from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { TbDots } from "solid-icons/tb";
import { For, Match, Switch } from "solid-js";
import { Show, createSignal } from "solid-js";
import type { FileEntry, FileEntryStatus } from "./bindings";
import { store } from "./store";
import { files } from "./testdata";

const useTestData = false;

function StatusIcons(props: { status: FileEntryStatus }) {
  return (
    <Switch>
      <Match when={props.status === "Processing"}>
        <TbDots />
      </Match>
      <Match when={props.status === "Compressing"}>
        <FaSolidCircleNotch class="animate-spin" />
      </Match>
      <Match when={props.status === "Complete"}>
        <FaSolidCheck />
      </Match>
      <Match when={props.status === "Error"}>
        <FaSolidXmark />
      </Match>
    </Switch>
  );
}

function ATable() {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const columns: ColumnDef<FileEntry>[] = [
    {
      accessorKey: "status",
      cell: (props) => (
        <StatusIcons status={props.getValue() as FileEntryStatus} />
      ),
      header: "S",
    },
    {
      accessorKey: "file",
    },
    {
      accessorKey: "savings",
    },
    {
      accessorKey: "size",
    },
  ];

  const table = createSolidTable({
    get data() {
      if (useTestData) {
        // display files 50 times
        return [...Array(50)].map(
          () => files[Math.floor(Math.random() * files.length)],
        );
      }
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
    <div class="w-full grow pb-10">
      <table class="w-full">
        <thead class="sticky top-0 bg-[#1b1b1b] border-b-[1px] border-gray-700 z-40">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th
                      class="px-2 text-left capitalize"
                      classList={{
                        "w-20": ["size", "savings"].includes(header.column.id),
                        "w-1": header.column.id === "status",
                      }}
                      colSpan={header.colSpan}
                    >
                      <Show when={!header.isPlaceholder}>
                        <div
                          classList={{
                            "cursor-pointer select-none":
                              header.column.getCanSort(),
                          }}
                          class="whitespace-nowrap"
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyPress={() => {}}
                        >
                          {{
                            asc: "↑ ",
                            desc: "↓ ",
                          }[header.column.getIsSorted() as string] ?? "  "}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody class="text-clip max-h-svh">
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

function PlaceHolder() {
  return (
    <div class="w-full grow flex items-center justify-center h-full pb-10">
      <BsArrowDownSquare size={100} class="opacity-50" />
    </div>
  );
}

function TableOrPlaceholder() {
  return (
    <Show
      when={store.files.length > 0 || useTestData}
      fallback={<PlaceHolder />}
    >
      <ATable />
    </Show>
  );
}

export default TableOrPlaceholder;
