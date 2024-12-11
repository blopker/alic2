import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { FaSolidXmark } from "solid-icons/fa";
import { VsAdd, VsSettings } from "solid-icons/vs";
import { type JSXElement, onCleanup } from "solid-js";
import { commands } from "./bindings";
import { FILE_TYPES } from "./constants";
import { SettingsSelect } from "./settings/SettingsUI";
import {
  getProfileActive,
  setProfileActive,
  settings,
} from "./settings/settingsData";
import { addFile, clearFiles, store } from "./store";

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
    <div class="fixed bottom-0 gap-2 left-0 right-0 flex items-center justify-between bg-secondary h-10 px-2 border-t-[1px] border-accent">
      <AddButton />
      <span class="grow" />
      <SettingsSelect
        value={getProfileActive().name}
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
      <span class="text-sm flex items-center justify-center">
        <VsAdd />
      </span>
    </Button>
  );
}

function ClearButton() {
  return (
    <Button onClick={clearFiles} disabled={store.files.length === 0}>
      <span class="px-2 text-sm flex items-center gap-1">
        <FaSolidXmark /> Clear
      </span>
    </Button>
  );
}

async function settingsWindow() {
  await commands.openSettingsWindow();
}

function SettingsButton() {
  return (
    <Button onClick={settingsWindow}>
      <span class="text-sm flex items-center justify-center">
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
      class={`${props.class} relative text-center border-[0.5px] border-accent rounded-sm min-h-6 min-w-10 enabled:hover:bg-gray-600 p-0 m-0 leading-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {props.children}
    </button>
  );
}
