import { open } from "@tauri-apps/plugin-dialog";
import { FaSolidXmark } from "solid-icons/fa";
import { VsSettings } from "solid-icons/vs";
import type { JSXElement } from "solid-js";
import { commands } from "./bindings";
import { FILE_TYPES } from "./constants";
import { SettingsSelect } from "./settings/SettingsUI";
import {
  getProfileActive,
  setProfileActive,
  settings,
} from "./settings/settingsData";
import { addFile, clearFiles, store } from "./store";

export default function BottomBar() {
  return (
    <div class="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-[#403F3F] h-10 px-2 shadow-2xl">
      <AddButton />
      <span class="grow" />
      <SettingsSelect
        value={getProfileActive().name}
        class="mr-2 w-40"
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
  return <Button onClick={openFile}>+</Button>;
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
    <button
      onClick={settingsWindow}
      type="button"
      class="relative text-center rounded-sm hover:gray-600 transition-all p-2"
    >
      <VsSettings />
    </button>
  );
}

function Button(props: {
  onClick: () => void;
  children: JSXElement;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      class="relative text-center border-[0.5px] border-gray-800 rounded-sm min-h-6 min-w-10 enabled:hover:bg-gray-600 p-0 m-0 leading-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {props.children}
    </button>
  );
}
