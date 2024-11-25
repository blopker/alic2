import { createStore, produce } from "solid-js/store";
import { type SettingsData, commands } from "../bindings";

const [settings, setSettings] = createStore<SettingsData>(await getSettings());

async function getSettings() {
  const opt = await commands.getSettings();
  if (opt.status === "error") {
    throw new Error(opt.error);
  }
  console.log(opt.data);
  return opt.data;
}

async function resetSettings() {
  await commands.resetSettings();
  setSettings(await getSettings());
}

async function saveSettings() {
  await commands.saveSettings(settings);
}

function setTheme(theme: SettingsData["theme"]) {
  setSettings("theme", theme);
  saveSettings();
}

function setQuality(profileid: number, quality: number) {
  setSettings(
    "profiles",
    profileid,
    produce((p) => {
      p.gif_quality = quality;
    }),
  );
}

export { settings, setTheme, resetSettings, setQuality };
