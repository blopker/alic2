import { BsArrowDown, BsArrowDownSquare, BsArrowUp } from "solid-icons/bs";
import { FaSolidCircleNotch, FaSolidXmark } from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { TbDots } from "solid-icons/tb";
import { For, type JSXElement, Match, Switch } from "solid-js";
import { Show, createSignal } from "solid-js";
import type { FileEntry, FileEntryStatus } from "./bindings";
import { commands } from "./bindings";
import { store } from "./store";
import { testStore } from "./testdata";

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

function toHumanReadableSize(size?: number | null) {
  if (!size) {
    return "?";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / 1024 ** i).toFixed(1)} ${["B", "kB", "MB", "GB"][i]}`;
}

function MyTable() {
  // Table with columns of status, file, savings, size
  const [sortField, setSortField] = createSignal<keyof FileEntry | null>();
  const [sortDirection, setSortDirection] = createSignal("asc");
  const SortIcon = (props: { field: string }) => (
    <span>
      <Switch>
        <Match when={sortField() === props.field}>
          <Show when={sortDirection() === "asc"}>
            <BsArrowUp />
          </Show>
          <Show when={sortDirection() === "desc"}>
            <BsArrowDown />
          </Show>
        </Match>
      </Switch>
    </span>
  );
  const MyTH = (props: {
    field: keyof FileEntry;
    children: JSXElement;
    class?: string;
  }) => (
    //biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <th
      colspan={1}
      onClick={() => handleSort(props.field)}
      class={`px-2 text-left capitalize ${props.class ?? ""}`}
    >
      <div class="flex align-middle items-center cursor-pointer whitespace-nowrap">
        {props.children}
        <SortIcon field={props.field} />
      </div>
    </th>
  );

  const MyTD = (props: { children: JSXElement }) => (
    <td class="px-2">{props.children}</td>
  );
  const handleSort = (field: keyof FileEntry) => {
    if (sortField() === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const sortedFiles = () => {
    const field = sortField();
    let files = [...store.files];
    if (useTestData) {
      // display files 50 times
      files = [...Array(50)].map(
        () =>
          testStore.files[Math.floor(Math.random() * testStore.files.length)],
      );
    }
    if (!field) {
      return files;
    }
    return files.sort((a, b) => {
      const aValue = a[field] ?? "";
      const bValue = b[field] ?? "";
      if (aValue < bValue) return sortDirection() === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection() === "asc" ? 1 : -1;
      return 0;
    });
  };
  return (
    <div class="w-full grow pb-10 select-none">
      <table class="min-w-full">
        <thead class="sticky top-0 bg-secondary z-40 shadow-lg">
          <tr>
            <MyTH class="w-12" field="status">
              S
            </MyTH>
            <MyTH field="file">File</MyTH>
            <MyTH class="w-28" field="savings">
              Savings
            </MyTH>
            <MyTH class="w-24" field="original_size">
              Size
            </MyTH>
          </tr>
        </thead>
        <tbody class="text-clip max-h-svh">
          <For each={sortedFiles()}>
            {(file) => (
              <tr
                onDblClick={() => {
                  console.log(commands.openFinderAtPath(file.path));
                }}
                class="even:bg-secondary hover:bg-accent cursor-default"
              >
                <MyTD>
                  <StatusIcons status={file.status} />
                </MyTD>
                <MyTD>{file.file}</MyTD>
                <MyTD>
                  <Show when={file.savings} fallback="?">
                    {(file.savings ?? 0).toFixed(1)}%
                  </Show>
                </MyTD>
                <MyTD>{toHumanReadableSize(file.original_size)}</MyTD>
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
      <MyTable />
    </Show>
  );
}

export default TableOrPlaceholder;
