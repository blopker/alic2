mod compress;
use specta_typescript;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Manager,
};
use tauri_specta::{collect_commands, Builder};

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}? You've been greeted from Rust??!", name)
// }

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
    let builder = Builder::<tauri::Wry>::new()
        // Then register them (separated by a comma)
        .commands(collect_commands![
            open_settings_window,
            compress::process_img,
            compress::get_file_info
        ]);

    #[cfg(debug_assertions)] // <- Only export on non-release builds
    builder
        .export(
            specta_typescript::Typescript::default(),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .menu(|handle| {
            Menu::with_items(
                handle,
                &[&Submenu::with_items(
                    handle,
                    "File",
                    true,
                    &[
                        &PredefinedMenuItem::close_window(handle, None)?,
                        #[cfg(target_os = "macos")]
                        &MenuItem::new(handle, "H&ello", true, None::<&str>)?,
                    ],
                )?],
            )
        })
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            // This is also required if you want to use events
            builder.mount_events(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
