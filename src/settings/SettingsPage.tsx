import { type Component, For, Show, createMemo, createSignal } from "solid-js";
import "../App.css";
import { Dynamic } from "solid-js/web";
import type { ThemeKind } from "../bindings";
import { NewProfileModal } from "./NewProfileModal";
import { ProfilePage } from "./ProfilePage";
import { SettingBox, SettingRow, SettingsSelect } from "./SettingsUI";
import {
  createProfile,
  resetSettings,
  setTheme,
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

const [showNewProfileModal, setShowNewProfileModal] = createSignal(false);

const themeKinds: ThemeKind[] = ["System", "Light", "Dark"];

const [activePage, setActivePage] = createSignal<SettingsPageData>(
  settingsPages()[0],
);

export function Settings() {
  return (
    <main class="h-screen justify-between w-full flex bg-secondary">
      <div class="w-40 border-r-[1px] border-accent">
        <SettingsSideBar />
      </div>
      <div class="grow p-4 overflow-scroll">
        <Show when={activePage().page}>
          <Dynamic component={activePage().page} />
        </Show>
        <Show when={activePage().id !== undefined}>
          <ProfilePage
            id={activePage().id || 0}
            onDelete={() => {
              setActivePage(settingsPages()[0]);
            }}
          />
        </Show>
      </div>
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
    <div class="flex flex-col items-start p-4 gap-2">
      <Show when={showNewProfileModal()}>
        <NewProfileModal
          onClose={() => setShowNewProfileModal(false)}
          onCreate={async (name: string) => {
            await createProfile(name);
            const newProfile = settings.profiles.find((p) => p.name === name);
            if (newProfile) {
              // get last profilepage
              const profi = profilePages().length - 1;
              setActivePage(profilePages()[profi]);
            }
          }}
        />
      </Show>
      <For each={settingsPages()}>
        {(p) => (
          <button
            classList={{
              "font-bold": p.kind === activePage().kind,
            }}
            onClick={() => setActivePage(p)}
            type="button"
          >
            {p.title}
          </button>
        )}
      </For>
      <div class="text-sm pt-2">Profiles</div>
      <For each={profilePages()}>
        {(p) => (
          <button
            classList={{
              "font-bold": p.kind === activePage().kind,
            }}
            onClick={() => setActivePage(p)}
            type="button"
          >
            {p.title}
          </button>
        )}
      </For>
      <button onClick={() => setShowNewProfileModal(true)} type="button">
        New Profile...
      </button>
    </div>
  );
}

function GeneralPage() {
  return (
    <div>
      <h1 class="text-left text-xl font-bold pb-4">General</h1>
      <SettingBox title="Interface">
        <SettingRow title="Theme">
          <SettingsSelect
            class="w-40"
            value={settings.theme}
            onChange={(theme) => setTheme(theme as ThemeKind)}
            options={themeKinds}
          />
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Settings">
        <SettingRow title="Reset All Settings">
          <button
            onClick={resetSettings}
            type="button"
            class="bg-red-500 hover:bg-red-700 text-white font-bold px-4 rounded-sm"
          >
            Reset
          </button>
        </SettingRow>
      </SettingBox>
    </div>
  );
}
