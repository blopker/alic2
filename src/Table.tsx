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
// export default function Table(props: { data: string[] }) {
//   return (
//     <table class="table-auto w-full">
//       {/* <thead>
//         <tr>
//           {props.data.map((d) => (
//             <th>{d}</th>
//           ))}
//         </tr>
//       </thead> */}
//       <tbody>
//         <For each={props.data}>
//           {(d) => (
//             <tr>
//               <td>{d}</td>
//             </tr>
//           )}
//         </For>
//       </tbody>
//     </table>
//   );
// }

export type FileEntry = {
  file: string;
  status: string;
  size: number;
  savings: number;
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (d: number): FileEntry => {
  return {
    file: "bob",
    status: "relationship",
    size: d,
    savings: d,
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): FileEntry[] => {
    const len = lens[depth] ?? 0;
    return range(len).map((d): FileEntry => {
      return {
        ...newPerson(d),
      };
    });
  };

  return makeDataLevel();
}

export function Table() {
  const [data, setData] = createSignal(makeData(1000));
  const [sorting, setSorting] = createSignal<SortingState>([]);

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
      return data();
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
