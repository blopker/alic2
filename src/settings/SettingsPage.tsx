import { For, type JSXElement, Show, createSignal } from "solid-js";
import "../App.css";
import type { ThemeKind } from "../bindings";
import {
  resetSettings,
  setTheme,
  settings,
  updateProfile,
} from "./settingsData";

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
          <QualitySlider
            value={data.jpeg_quality}
            onChange={(value) => {
              updateProfile(data.id, { jpeg_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="PNG Quality">
          <QualitySlider
            value={data.png_quality}
            onChange={(value) => {
              updateProfile(data.id, { png_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="WEBP Quality">
          <QualitySlider
            value={data.webp_quality}
            onChange={(value) => {
              updateProfile(data.id, { webp_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="GIF Quality">
          <QualitySlider
            value={data.gif_quality}
            onChange={(value) => {
              updateProfile(data.id, { gif_quality: value });
            }}
          />
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Resize">
        <SettingRow title="Resize Width">
          <input
            class="mr-2 bg-black"
            type="text"
            min="1"
            value={data.resize_width}
            onInput={(e) => {
              const value = Number.parseInt(e.target.value);
              if (Number.isNaN(value)) {
                return;
              }
              updateProfile(data.id, {
                resize_width: value,
              });
            }}
          />
          px
        </SettingRow>
        <SettingRow title="Resize Height">
          <input
            type="range"
            min="1"
            max="1000"
            value={data.resize_height}
            onInput={(e) => {
              updateProfile(data.id, {
                resize_height: Number.parseInt(e.target.value),
              });
            }}
          />
        </SettingRow>
      </SettingBox>
    </div>
  );
}

function QualitySlider(props: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div class="flex gap-4">
      <input
        type="range"
        min="1"
        max="100"
        value={props.value}
        onInput={(e) => {
          props.onChange(Number.parseInt(e.target.value));
        }}
      />
      <div>{props.value}</div>
    </div>
  );
}
