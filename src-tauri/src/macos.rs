use tauri_plugin_shell::ShellExt;

#[tauri::command]
#[specta::specta]
pub async fn open_finder_at_path(path: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    let output = app_handle
        .shell()
        .command("open")
        .args(["-R", path.as_str()])
        .output()
        .await
        .unwrap();
    if output.status.success() {
        println!("Result: {:?}", String::from_utf8(output.stdout));
    } else {
        println!("Exit with code: {}", output.status.code().unwrap());
    }
    Ok(())
}
