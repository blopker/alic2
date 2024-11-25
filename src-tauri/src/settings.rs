use serde::{self};
use serde_json::json;
use specta::Type;
use tauri_plugin_store::StoreExt;

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
            profiles: vec![ProfileData {
                name: "Default".to_string(),
                id: 0,
                should_resize: false,
                should_convert: false,
                should_overwrite: false,
                postfix: ".min".to_string(),
                resize_width: 1000,
                resize_height: 1000,
                jpeg_quality: 80,
                png_quality: 80,
                webp_quality: 80,
                gif_quality: 80,
            }],
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Type, Debug, Clone)]
pub struct ProfileData {
    pub name: String,
    pub id: u32,
    pub should_resize: bool,
    pub should_convert: bool,
    pub should_overwrite: bool,
    pub postfix: String,
    pub resize_width: u32,
    pub resize_height: u32,
    pub jpeg_quality: u32,
    pub png_quality: u32,
    pub webp_quality: u32,
    pub gif_quality: u32,
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
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn reset_settings(app: tauri::AppHandle) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .expect("Failed to get settings from store");
    store.set(SETTINGS_KEY, json!(SettingsData::new()));
    Ok(())
}
