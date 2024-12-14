import { useKeyDownEvent } from "@solid-primitives/keyboard";
import { A, useNavigate } from "@solidjs/router";
import {
  type Component,
  For,
  type JSXElement,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { ConfirmModal, confirmModal } from "./ConfirmModal";
import {
  SettingBox,
  SettingRow,
  SettingsButton,
  SettingsInput,
  SettingsNumberInput,
} from "./SettingsUI";
import {
  createProfile,
  resetSettings,
  setThreads,
  settings,
} from "./settingsData";

interface SettingsPageData {
  kind: string;
  title: string;
  id?: number;
  page?: Component;
}

const [settingsPages, _] = createSignal<SettingsPageData[]>([
  { kind: "general", title: "General", page: GeneralPage },
]);

// const themeKinds: ThemeKind[] = ["System", "Light", "Dark"];

function Settings(props: { children?: JSXElement }) {
  return (
    <main class="flex h-screen w-full justify-between bg-secondary">
      <ConfirmModal />
      <div class="w-40 border-accent border-r-[1px]">
        <SettingsSideBar />
      </div>
      <div class="grow overflow-scroll bg-primary p-4">{props.children}</div>
    </main>
  );
}

function SettingsSideBar() {
  const profilePages = createMemo<SettingsPageData[]>(() => {
    return settings.profiles.map((p) => ({
      kind: `profile:${p.name}`,
      title: p.name,
      id: p.id,
    }));
  });
  return (
    <div class="flex flex-col items-start gap-2 p-4">
      <For each={settingsPages()}>
        {(p) => (
          <A activeClass="font-bold" href="/settings" end>
            {p.title}
          </A>
        )}
      </For>
      <div class="pt-2 text-sm">Profiles</div>
      <For each={profilePages()}>
        {(p) => (
          <A activeClass="font-bold" href={`/settings/profile/${p.id}`}>
            {p.title}
          </A>
        )}
      </For>
      <A activeClass="font-bold" href="/settings/newprofile">
        New Profile...
      </A>
    </div>
  );
}

function GeneralPage() {
  return (
    <div>
      <h1 class="pb-4 text-left font-bold text-xl">General</h1>
      <SettingBox title="">
        <SettingRow
          title="Threads"
          helpText="Number of images to process in parallel. Setting this to 0 will use all available cores."
        >
          <SettingsNumberInput
            value={settings.threads || 0}
            onChange={(value) => {
              setThreads(value);
            }}
          />
        </SettingRow>
        <SettingRow title="Reset All Settings">
          <SettingsButton
            onClick={async () => {
              confirmModal({
                text: "Are you sure you want to reset all settings?",
                onConfirm: resetSettings,
              });
            }}
            style="danger"
          >
            Reset
          </SettingsButton>
        </SettingRow>
      </SettingBox>
    </div>
  );
}

function NewProfilePage() {
  const [newProfileName, setNewProfileName] = createSignal("");
  const navigate = useNavigate();
  const event = useKeyDownEvent();
  createEffect(() => {
    const e = event();
    if (e && e.key === "Enter") {
      onOK();
    }
  });
  async function onOK() {
    const name = newProfileName().substring(0, 30);
    if (name === "") {
      return;
    }
    await createProfile(name);
    setNewProfileName("");
    const newProfile = settings.profiles.find((p) => p.name === name);
    if (newProfile) {
      navigate(`/settings/profile/${newProfile.id}`);
    }
  }
  return (
    <>
      <h1 class="pb-4 text-left font-bold text-xl">Create New Profile</h1>
      <SettingBox title="">
        <SettingRow title="Profile Name">
          <SettingsInput
            autoFocus={true}
            placeholder="Name"
            label="Name"
            value=""
            onChange={async (value) => {
              setNewProfileName(value);
            }}
          />
        </SettingRow>
        <button
          disabled={newProfileName() === ""}
          onClick={onOK}
          type="button"
          class="col-start-2 inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 font-semibold text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
        >
          Create
        </button>
      </SettingBox>
    </>
  );
}

export { Settings, GeneralPage, NewProfilePage };
