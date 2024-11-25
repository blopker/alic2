import { For, type JSXElement, Show, createSignal } from "solid-js";
import "../App.css";
import type { ThemeKind } from "../bindings";
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
      <div class="grow p-4">
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

function SettingBox(props: { title: string; children: JSXElement }) {
  return (
    <div>
      <div>{props.title}</div>
      <div class="border-2 rounded-xl border-gray-700 p-4 gap-2">
        <div>{props.children}</div>
      </div>
    </div>
  );
}

function SettingRow(props: { title: string; children: JSXElement }) {
  return (
    <div class="flex gap-2 justify-between">
      <div>{props.title}</div>
      <div>{props.children}</div>
    </div>
  );
}

function GeneralPage() {
  return (
    <div>
      <h1 class="text-left text-xl font-bold pb-4">General</h1>
      <SettingBox title="Interface">
        <SettingRow title="Theme">
          <select
            onChange={(e) => {
              setTheme(e.target.value as ThemeKind);
            }}
            name="theme"
            id="theme"
            class="w-40 bg-black"
          >
            <For each={themeKinds}>
              {(kind) => (
                <option selected={kind === settings.theme}>{kind}</option>
              )}
            </For>
          </select>
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Settings">
        <SettingRow title="Reset Settings">
          <button
            onClick={resetSettings}
            type="button"
            class="bg-red-500 hover:bg-red-700 text-white font-bold px-4 rounded"
          >
            Reset
          </button>
        </SettingRow>
      </SettingBox>
    </div>
  );
}

function ProfilePage(props: { name: string }) {
  const data = settings.profiles.find((p) => p.name === props.name);
  if (!data) {
    return <div>Profile not found</div>;
  }
  return (
    <div>
      <h1 class="text-left text-xl font-bold pb-4">{props.name}</h1>
      <SettingBox title="Quality">
        <SettingRow title="JPEG Quality">
          <input
            type="range"
            min="1"
            max="100"
            value={data.jpeg_quality}
            onInput={(e) => {
              data.jpeg_quality = Number.parseInt(e.target.value);
            }}
          />
        </SettingRow>
        <SettingRow title="PNG Quality">
          <input
            type="range"
            min="1"
            max="100"
            value={data.png_quality}
            onInput={(e) => {
              data.png_quality = Number.parseInt(e.target.value);
            }}
          />
        </SettingRow>
        <SettingRow title="WEBP Quality">
          <input
            type="range"
            min="1"
            max="100"
            value={data.webp_quality}
            onInput={(e) => {
              data.webp_quality = Number.parseInt(e.target.value);
            }}
          />
        </SettingRow>
        <SettingRow title="GIF Quality">
          <input
            type="range"
            min="1"
            max="100"
            value={data.gif_quality}
            onInput={(e) => {
              data.gif_quality = Number.parseInt(e.target.value);
            }}
          />
        </SettingRow>
      </SettingBox>
    </div>
  );
}
