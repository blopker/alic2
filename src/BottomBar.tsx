import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { FaSolidXmark } from "solid-icons/fa";
import { VsAdd, VsSettings } from "solid-icons/vs";
import { type JSXElement, Show, onCleanup } from "solid-js";
import { commands } from "./bindings";
import { FILE_TYPES } from "./constants";
import { SettingsSelect } from "./settings/SettingsUI";
import {
  getProfileActive,
  setProfileActive,
  settings,
} from "./settings/settingsData";
import { addFile, clearFiles, store } from "./store";
import { toHumanReadableSize } from "./utils";

async function openFile() {
  console.log("open file");
  const file = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: "Images",
        extensions: FILE_TYPES,
      },
    ],
  });
  console.log(file);
  if (!file) {
    return;
  }
  for (const f of file) {
    addFile(f);
  }
}

export default function BottomBar() {
  const unlisten = listen("open-file", async () => {
    await openFile();
  });
  onCleanup(async () => {
    (await unlisten)();
  });
  return (
    <div class="right-0 left-0 flex h-10 items-center justify-between gap-2 border-accent border-t-[1px] bg-secondary px-2">
      <AddButton />
      <StatusText />
      <span class="grow" />
      <SettingsSelect
        value={getProfileActive().name}
        bgColor="bg-primary"
        class="w-40"
        onChange={(value) => {
          const profile = settings.profiles.find((p) => p.name === value);
          if (profile) {
            setProfileActive(profile.id);
          }
        }}
        options={settings.profiles.map((p) => p.name)}
      />
      <SettingsButton />
      <ClearButton />
    </div>
  );
}

function AddButton() {
  return (
    <Button onClick={openFile}>
      <span class="flex items-center justify-center text-sm">
        <VsAdd />
      </span>
    </Button>
  );
}

function ClearButton() {
  return (
    <Button onClick={clearFiles} disabled={store.files.length === 0}>
      <span class="flex items-center gap-1 px-2 text-sm">
        <FaSolidXmark /> Clear
      </span>
    </Button>
  );
}

async function settingsWindow() {
  await commands.openSettingsWindow();
}

function StatusText() {
  const doneFiles = () => store.files.filter((f) => f.status === "Complete");
  const dataSaved = () =>
    doneFiles()
      .map((f) => f.originalSize ?? 0 - (f.size ?? 0))
      .reduce((a, b) => a + b, 0);
  const dataSavedPercent = () =>
    doneFiles()
      .filter((f) => f.savings)
      .map((f) => f.savings ?? 0)
      .reduce((a, b) => a + b, 0) / doneFiles().length;
  return (
    <Show when={doneFiles().length > 0}>
      {toHumanReadableSize(dataSaved())} saved, average{" "}
      {dataSavedPercent().toFixed(1)}%
    </Show>
  );
}

function SettingsButton() {
  return (
    <Button onClick={settingsWindow}>
      <span class="flex items-center justify-center text-sm">
        <VsSettings />
      </span>
    </Button>
  );
}

function Button(props: {
  onClick: () => void;
  children: JSXElement;
  class?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      class={`${props.class} relative m-0 min-h-6 min-w-10 rounded-sm border-[0.5px] border-accent p-0 text-center leading-none transition-all enabled:hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {props.children}
    </button>
  );
}
