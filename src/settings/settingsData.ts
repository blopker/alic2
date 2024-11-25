import { createStore, produce } from "solid-js/store";
import { type ProfileData, type SettingsData, commands } from "../bindings";

const [settings, setSettings] = createStore<SettingsData>(await getSettings());

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

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

const debounceSaveSettings = debounce(saveSettings, 1000);

function setTheme(theme: SettingsData["theme"]) {
  setSettings("theme", theme);
  saveSettings();
}

function updateProfile(profileid: number, update: Partial<ProfileData>) {
  const profileIdx = settings.profiles.findIndex((p) => p.id === profileid);
  if (profileIdx === -1) {
    return;
  }
  const profile = settings.profiles[profileIdx];
  if (profile.id !== profileid) {
    return;
  }
  setSettings("profiles", profileIdx, {
    ...profile,
    ...update,
  });
  debounceSaveSettings();
}

export { settings, setTheme, resetSettings, updateProfile };
