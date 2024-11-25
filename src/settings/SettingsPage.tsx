import { For, Show, createSignal } from "solid-js";
import "../App.css";
import type { ThemeKind } from "../bindings";
import { ProfilePage } from "./ProfilePage";
import { SettingBox, SettingRow, SettingsSelect } from "./SettingsUI";
import { resetSettings, setTheme, settings } from "./settingsData";

interface SettingsPageData {
  kind: string;
  title: string;
}

const [settingsPages, _] = createSignal<SettingsPageData[]>([
  { kind: "general", title: "General" },
]);

const themeKinds: ThemeKind[] = ["System", "Light", "Dark"];

const [activePage, setActivePage] = createSignal<string>("general");

export function Settings() {
  return (
    <main class="h-screen justify-between w-full flex">
      <div class="w-40 border-r-[1px] border-black">
        <SettingsSideBar />
      </div>
      <div class="grow p-4 overflow-scroll">
        <Show when={activePage() === "general"}>
          <GeneralPage />
        </Show>
        <Show when={activePage().startsWith("profile:")}>
          <ProfilePage name={activePage().split(":")[1]} />
        </Show>
      </div>
    </main>
  );
}

function SettingsSideBar() {
  return (
    <div class="flex flex-col items-start p-4 gap-2">
      <For each={settingsPages()}>
        {(p) => (
          <button
            classList={{
              "font-bold": p.kind === activePage(),
            }}
            onClick={() => setActivePage(p.kind)}
            type="button"
          >
            {p.title}
          </button>
        )}
      </For>
      <div class="text-sm pt-2">Profiles</div>
      <For each={settings.profiles}>
        {(p) => (
          <button
            classList={{
              "font-bold": `profile:${p.name}` === activePage(),
            }}
            onClick={() => setActivePage(`profile:${p.name}`)}
            type="button"
          >
            {p.name}
          </button>
        )}
      </For>
      <button type="button">New Profile...</button>
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
        <SettingRow title="Reset Settings">
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
