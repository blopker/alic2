use serde::{self};
use serde_json::json;
use specta::Type;
use tauri::Emitter;
use tauri_plugin_store::StoreExt;

use crate::compress::ImageType;

const SETTINGS_KEY: &str = "settings";

#[derive(serde::Serialize, serde::Deserialize, Type, Debug, Clone)]
pub struct SettingsData {
    pub version: u32,
    pub theme: ThemeKind,
    pub profiles: Vec<ProfileData>,
}

#[derive(serde::Serialize, serde::Deserialize, Type, Debug, Clone)]
pub enum ThemeKind {
    Light,
    Dark,
    System,
}

impl SettingsData {
    pub fn new() -> Self {
        Self {
            version: 1,
            theme: ThemeKind::System,
            profiles: vec![ProfileData::new()],
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Type, Debug, Clone)]
pub struct ProfileData {
    pub name: String,
    pub id: u32,
    pub active: bool,
    pub should_resize: bool,
    pub should_convert: bool,
    pub should_overwrite: bool,
    #[serde(default)]
    pub add_posfix: bool,
    pub convert_extension: ImageType,
    pub postfix: String,
    pub resize_width: u32,
    pub resize_height: u32,
    pub jpeg_quality: u32,
    pub png_quality: u32,
    pub webp_quality: u32,
    pub gif_quality: u32,
}

impl ProfileData {
    pub fn new() -> Self {
        Self {
            name: "Default".to_string(),
            id: 0,
            active: true,
            should_resize: false,
            should_convert: false,
            should_overwrite: false,
            add_posfix: true,
            convert_extension: ImageType::WEBP,
            postfix: ".min".to_string(),
            resize_width: 1000,
            resize_height: 1000,
            jpeg_quality: 80,
            png_quality: 80,
            webp_quality: 80,
            gif_quality: 80,
        }
    }

    pub fn new_params(id: u32, name: String) -> Self {
        let mut this = Self::new();
        this.id = id;
        this.name = name;
        this.active = false;
        this
    }
}

#[tauri::command]
#[specta::specta]
pub async fn get_settings(app: tauri::AppHandle) -> Result<SettingsData, String> {
    let store = app
        .store("settings.json")
        .expect("Failed create settings from store");

    // set default settings if not set
    if !store.has(SETTINGS_KEY) {
        store.set(SETTINGS_KEY, json!(SettingsData::new()));
    }
    let value = store
        .get(SETTINGS_KEY)
        .expect("Failed to get value from store");

    let data: Result<SettingsData, _> = serde_json::from_value(value);

    // if error, return default settings
    let data = match data {
        Ok(data) => data,
        Err(_) => SettingsData::new(),
    };

    Ok(data)
}

#[tauri::command]
#[specta::specta]
pub async fn save_settings(app: tauri::AppHandle, settings: SettingsData) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    store.set("settings", serde_json::to_value(settings.clone()).unwrap());
    println!("Set settings: {:?}", settings);
    app.emit("settings-changed", true).unwrap();
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn reset_settings(app: tauri::AppHandle) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    store.set(SETTINGS_KEY, json!(SettingsData::new()));
    app.emit("settings-changed", true).unwrap();
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn reset_profile(app: tauri::AppHandle, profile_id: u32) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    if !store.has(SETTINGS_KEY) {
        return Ok(());
    }
    let settings_value = store
        .get(SETTINGS_KEY)
        .expect("Failed to get value from store");
    let mut settings: SettingsData = serde_json::from_value(settings_value).unwrap();
    let profile_idx = settings.profiles.iter().position(|p| p.id == profile_id);
    if profile_idx.is_none() {
        return Err("Profile not found".to_string());
    }
    let profile = settings.profiles[profile_idx.unwrap()].clone();
    settings.profiles[profile_idx.unwrap()] = ProfileData::new_params(profile_id, profile.name);
    store.set(SETTINGS_KEY, json!(settings));
    app.emit("settings-changed", true).unwrap();
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_profile(app: tauri::AppHandle, profile_id: u32) -> Result<(), String> {
    if profile_id == 0 {
        return Err("Cannot delete default profile".to_string());
    }
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    if !store.has(SETTINGS_KEY) {
        return Ok(());
    }
    let settings_value = store
        .get(SETTINGS_KEY)
        .expect("Failed to get value from store");
    let mut settings: SettingsData = serde_json::from_value(settings_value).unwrap();
    let profile_idx = settings.profiles.iter().position(|p| p.id == profile_id);
    if profile_idx.is_none() {
        return Err("Profile not found".to_string());
    }
    settings.profiles.remove(profile_idx.unwrap());
    store.set(SETTINGS_KEY, json!(settings));
    app.emit("settings-changed", true).unwrap();
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn add_profile(app: tauri::AppHandle, mut name: String) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    if !store.has(SETTINGS_KEY) {
        return Ok(());
    }
    let settings_value = store
        .get(SETTINGS_KEY)
        .expect("Failed to get value from store");
    let mut settings: SettingsData = serde_json::from_value(settings_value).unwrap();
    let profile_idx = settings.profiles.iter().position(|p| p.name == name);
    if profile_idx.is_some() {
        name = format!("{} ({})", name, profile_idx.unwrap() + 1);
    }
    let highest_id = settings.profiles.iter().max_by_key(|p| p.id).unwrap().id;
    settings
        .profiles
        .push(ProfileData::new_params(highest_id + 1, name));
    store.set(SETTINGS_KEY, json!(settings));
    app.emit("settings-changed", true).unwrap();
    Ok(())
}
