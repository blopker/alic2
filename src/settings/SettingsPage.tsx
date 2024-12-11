import { type Component, For, Show, createMemo, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import "../App.css";
import { NewProfileModal } from "./NewProfileModal";
import { ProfilePage } from "./ProfilePage";
import { SettingBox, SettingRow } from "./SettingsUI";
import { createProfile, resetSettings, settings } from "./settingsData";

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

// const themeKinds: ThemeKind[] = ["System", "Light", "Dark"];

const [activePage, setActivePage] = createSignal<SettingsPageData>(
  settingsPages()[0],
);

export function Settings() {
  return (
    <main class="flex h-screen w-full justify-between bg-secondary">
      <div class="w-40 border-accent border-r-[1px]">
        <SettingsSideBar />
      </div>
      <div class="grow overflow-scroll bg-primary p-4">
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
    <div class="flex flex-col items-start gap-2 p-4">
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
      <div class="pt-2 text-sm">Profiles</div>
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
      <h1 class="pb-4 text-left font-bold text-xl">General</h1>
      {/* <SettingBox title="Interface">
        <SettingRow title="Theme">
          <SettingsSelect
            class="w-40"
            value={settings.theme}
            onChange={(theme) => setTheme(theme as ThemeKind)}
            options={themeKinds}
          />
        </SettingRow>
      </SettingBox>
      <div class="pt-8" /> */}
      <SettingBox title="Settings">
        <SettingRow title="Reset All Settings">
          <button
            onClick={resetSettings}
            type="button"
            class="rounded-sm bg-red-500 px-4 font-bold text-white hover:bg-red-700"
          >
            Reset
          </button>
        </SettingRow>
      </SettingBox>
    </div>
  );
}
