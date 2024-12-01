mod compress;
mod macos;
mod settings;

use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tauri_specta::{collect_commands, Builder};

#[tauri::command]
#[specta::specta]
async fn open_settings_window(app: tauri::AppHandle) {
    let window_label = "settings";
    let config = &app
        .config()
        .app
        .windows
        .iter()
        .find(|w| w.label == window_label)
        .unwrap();
    if let Some(window) = app.get_webview_window(window_label) {
        // If the window already exists, bring it to the front
        window.show().unwrap();
    } else {
        // If the window does not exist, create it
        tauri::WebviewWindowBuilder::from_config(&app, config)
            .unwrap()
            .build()
            .unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        open_settings_window,
        compress::process_img,
        compress::get_file_info,
        settings::get_settings,
        settings::save_settings,
        settings::reset_settings,
        settings::reset_profile,
        settings::delete_profile,
        settings::add_profile,
        macos::open_finder_at_path,
    ]);

    #[cfg(debug_assertions)] // <- Only export on non-release builds
    builder
        .export(
            specta_typescript::Typescript::default(),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_app, args, cwd| {
            println!("Second instance detected:");
            // println!("App: {:?}", app.cli().matches());
            println!("CWD: {:?}", cwd);
            println!("Args: {:?}", args);
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            // This is also required for events
            builder.mount_events(app);
            // Store setup
            app.store("settings.json")?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
