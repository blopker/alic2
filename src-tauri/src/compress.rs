use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::{fs, io};

use caesium;
use caesium::parameters::CSParameters;
use image;
use image::DynamicImage;
use serde;
use specta::Type;

use crate::settings::ProfileData;

#[derive(Debug, Eq, PartialEq, Clone, serde::Serialize, serde::Deserialize, Type)]
pub struct FileEntry {
    pub path: String,
    pub file: Option<String>,
    pub status: FileEntryStatus,
    pub size: Option<u32>,
    pub original_size: Option<u32>,
    pub ext: Option<String>,
    pub savings: Option<u32>,
    pub error: Option<String>,
}

#[derive(Debug, Eq, PartialEq, Clone, serde::Serialize, serde::Deserialize, Type)]
pub struct FileInfoResult {
    pub size: u32,
    pub extension: String,
    pub filename: String,
}

#[derive(Debug, Eq, PartialEq, Clone, Copy, serde::Serialize, serde::Deserialize, Type)]
pub enum FileEntryStatus {
    Processing,
    Compressing,
    Complete,
    AlreadySmaller,
    Error,
}

#[derive(Debug, Eq, PartialEq, Clone, Copy, serde::Serialize, serde::Deserialize, Type)]
pub enum ImageType {
    JPEG,
    PNG,
    WEBP,
    GIF,
    TIFF,
}

#[derive(serde::Serialize, serde::Deserialize, Type)]
pub struct CompressResult {
    pub path: String,
    pub out_size: u32,
    pub out_path: String,
    pub result: String,
}

#[derive(serde::Serialize, serde::Deserialize, Type)]
pub struct CompressError {
    pub error: String,
    pub error_type: CompressErrorType,
}

#[derive(serde::Serialize, serde::Deserialize, Type)]
pub enum CompressErrorType {
    Unknown,
    FileTooLarge,
    FileNotFound,
    UnsupportedFileType,
    WontOverwrite,
    NotSmaller,
}

#[tauri::command]
#[specta::specta]
pub async fn get_file_info(path: &str) -> Result<FileInfoResult, String> {
    let metadata_result = std::fs::metadata(&path);
    let size: u32;
    match metadata_result {
        Ok(metadata) => {
            if let Ok(_size) = metadata.len().try_into() {
                size = _size;
            } else {
                return Err("File too large".to_string());
            }
        }
        Err(err) => {
            return Err(format!("Error getting file size: {}", err));
        }
    }

    let _path = Path::new(&path);

    let extension = _path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let filename = _path.file_name().unwrap().to_string_lossy().to_string();

    Ok(FileInfoResult {
        size,
        extension,
        filename,
    })
}

#[tauri::command]
#[specta::specta]
pub async fn process_img(
    parameters: ProfileData,
    file: FileEntry,
) -> Result<CompressResult, CompressError> {
    // check file exists,
    // get type,
    // need conversion?,
    // calculate out path,
    // calculate temp path,
    // compress image to temp path,
    // calculate savings,
    // if not savings, delete temp file, return
    // if out path is same as original, delete original
    // move temp file to out path
    let out_path = get_out_path(&parameters, &file.path);

    if file.path == out_path && !parameters.should_overwrite {
        return Err(CompressError {
            error: "Image would be overwritten. Enable Overwrite in settings to allow this."
                .to_string(),
            error_type: CompressErrorType::WontOverwrite,
        });
    }

    let original_img = match read_image(&file.path) {
        Ok(img) => img,
        Err(err) => {
            return Err(CompressError {
                error: err,
                error_type: CompressErrorType::UnsupportedFileType,
            })
        }
    };

    let csparams = create_csparameters(&parameters, original_img.width(), original_img.height());
    drop(original_img);

    let original_image_type = match guess_image_type(&file.path) {
        Ok(img) => img,
        Err(err) => {
            return Err(CompressError {
                error: err,
                error_type: CompressErrorType::UnsupportedFileType,
            })
        }
    };
    let should_convert =
        parameters.should_convert && parameters.convert_extension != original_image_type;

    let temp_path = get_temp_path(&out_path);
    let result = if should_convert {
        convert_image(
            &file.path,
            &temp_path,
            csparams,
            parameters.convert_extension,
        )
    } else {
        compress_image(&file.path, &temp_path, csparams)
    };

    if result.is_err() {
        return Err(CompressError {
            error: result.err().unwrap().to_string(),
            error_type: CompressErrorType::Unknown,
        });
    }

    let temp_metadata_result = std::fs::metadata(&temp_path);
    let temp_size: f64 = match temp_metadata_result {
        Ok(result) => result.size() as f64,
        Err(e) => {
            return Err(CompressError {
                error: e.to_string(),
                error_type: CompressErrorType::FileNotFound,
            })
        }
    };
    let original_size = file.original_size.expect("Image size needs to be set") as f64;

    if !parameters.should_convert && temp_size > original_size * 0.95 {
        fs::remove_file(temp_path).expect("Cannot delete temp file");
        return Err(CompressError {
            error: "Image cannot be compressed further.".to_string(),
            error_type: CompressErrorType::NotSmaller,
        });
    }

    if out_path == file.path {
        let res = fs::remove_file(&file.path);
        if res.is_err() {
            return Err(CompressError {
                error: res.err().unwrap().to_string(),
                error_type: CompressErrorType::Unknown,
            });
        }
    }

    let rename_result = fs::rename(temp_path, &out_path);
    match rename_result {
        Ok(_) => {}
        Err(e) => {
            return Err(CompressError {
                error: e.to_string(),
                error_type: CompressErrorType::Unknown,
            })
        }
    };
    let out_size = temp_size as u32;
    Ok(CompressResult {
        path: file.path,
        out_size,
        out_path,
        result: "Success".to_string(),
    })
}

fn get_temp_path(path: &str) -> String {
    // /original/path/test.png -> /original/path/.test.png
    let path = Path::new(&path);
    let filename = path.file_name().unwrap().to_string_lossy().to_string();
    let directory = path.parent().unwrap().to_string_lossy().to_string();
    Path::new(&directory)
        .join(format!(".{}", filename))
        .to_string_lossy()
        .to_string()
}

fn read_image(path: &str) -> Result<DynamicImage, String> {
    let image = image::open(&path);
    match image {
        Ok(image) => Ok(image),
        Err(err) => Err(format!("Error: {}", err)),
    }
}

fn guess_image_type(path: &str) -> Result<ImageType, String> {
    let kind =
        infer::get_from_path(path).map_err(|e| format!("Error determining file type: {}", e))?;
    match kind {
        Some(kind) => match kind.mime_type() {
            "image/jpeg" => Ok(ImageType::JPEG),
            "image/png" => Ok(ImageType::PNG),
            "image/webp" => Ok(ImageType::WEBP),
            "image/gif" => Ok(ImageType::GIF),
            "image/tiff" => Ok(ImageType::TIFF),
            _ => Err(format!(
                "Error: Unsupported image type: {}",
                kind.mime_type()
            )),
        },
        None => Err("Error: Could not determine image type.".to_string()),
    }
}

fn get_out_path(parameters: &ProfileData, path: &str) -> String {
    let path = Path::new(&path);
    let extension = match parameters.should_convert {
        true => image_type_to_extension(parameters.convert_extension),
        false => path
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
    };
    let posfix = match parameters.add_posfix {
        true => parameters.postfix.clone(),
        false => "".to_string(),
    };
    format!("{}{}.{}", remove_extension(&path), posfix, extension)
}

fn image_type_to_extension(image_type: ImageType) -> String {
    match image_type {
        ImageType::JPEG => "jpg".to_string(),
        ImageType::PNG => "png".to_string(),
        ImageType::WEBP => "webp".to_string(),
        ImageType::GIF => "gif".to_string(),
        ImageType::TIFF => "tiff".to_string(),
    }
}

fn create_csparameters(parameters: &ProfileData, width: u32, height: u32) -> CSParameters {
    let mut new_height = 0;
    let mut new_width = 0;

    // set the largest dimension to the resize value,
    // only if the image size is larger than the resize value
    if parameters.should_resize {
        if width > parameters.resize_width || height > parameters.resize_height {
            if width > height {
                new_width = parameters.resize_width;
            } else {
                new_height = parameters.resize_height;
            }
        }
    }

    let mut cspars = CSParameters::new();
    cspars.jpeg.quality = parameters.jpeg_quality;
    cspars.png.quality = parameters.png_quality;
    cspars.webp.quality = parameters.webp_quality;
    cspars.gif.quality = parameters.gif_quality;
    cspars.width = new_width;
    cspars.height = new_height;
    cspars
}

fn compress_image(path: &str, out_path: &str, mut params: CSParameters) -> Result<String, String> {
    let result = caesium::compress(path.to_string(), out_path.to_string(), &mut params);
    match result {
        Ok(_) => Ok("Success".to_string()),
        Err(err) => Err(format!("Error: {}", err)),
    }
}

fn convert_image(
    path: &str,
    out_path: &str,
    mut params: CSParameters,
    image_type: ImageType,
) -> Result<String, String> {
    let supported_type = match image_type {
        ImageType::JPEG => caesium::SupportedFileTypes::Jpeg,
        ImageType::PNG => caesium::SupportedFileTypes::Png,
        ImageType::WEBP => caesium::SupportedFileTypes::WebP,
        ImageType::GIF => caesium::SupportedFileTypes::Gif,
        ImageType::TIFF => caesium::SupportedFileTypes::Tiff,
    };
    let result = caesium::convert(
        path.to_string(),
        out_path.to_string(),
        &mut params,
        supported_type,
    );

    match result {
        Ok(_) => Ok("Success".to_string()),
        Err(err) => Err(format!("Error: {}", err)),
    }
}

fn remove_extension(path: &Path) -> String {
    let result = match path.file_stem() {
        Some(stem) => {
            // Get the parent directory and append the stem to it
            if let Some(parent) = path.parent() {
                parent.join(stem)
            } else {
                PathBuf::from(stem)
            }
        }
        None => path.to_path_buf(),
    };
    result.to_string_lossy().to_string()
}

#[tauri::command]
#[specta::specta]
pub async fn get_all_images(path: String) -> Result<Vec<String>, String> {
    let file = Path::new(&path);
    if !file.exists() {
        return Err("File not found".to_string());
    }
    if file.is_file() {
        if !is_image(&file) {
            return Err("Unsupported file type".to_string());
        }
        return Ok(vec![path]);
    }
    Ok(find_images(path).unwrap())
}

fn find_images<P: AsRef<Path>>(directory: P) -> io::Result<Vec<String>> {
    let mut images = Vec::new();

    let entries = fs::read_dir(directory)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            // Recursively search subdirectories and extend our vector
            let mut subdir_images = find_images(&path)?;
            images.append(&mut subdir_images);
        } else if path.is_file() {
            if is_image(&path) {
                images.push(path.to_string_lossy().to_string());
            }
        }
    }

    Ok(images)
}

fn is_image(path: &Path) -> bool {
    let supported_exts = ["png", "jpeg", "jpg", "gif", "webp", "tiff"];
    let ext = path.extension().unwrap_or_default();
    if !supported_exts.contains(&ext.to_str().unwrap()) {
        return false;
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_image_type() {
        let result = image_type_to_extension(ImageType::JPEG);
        assert_eq!(result, "jpg".to_string());
    }

    #[test]
    fn test_guess_image_type() {
        let result = guess_image_type("test/test.jpg");
        println!("{:?}", result);
        assert_eq!(result.unwrap(), ImageType::JPEG);
    }

    #[test]
    fn test_get_out_path() {
        let mut parameters = ProfileData::new();
        let mut result = get_out_path(&parameters, &"test/test.png".to_string());
        assert_eq!(result, "test/test.min.png".to_string());

        parameters = ProfileData::new();
        result = get_out_path(&parameters, &"test/test.jpeg".to_string());
        assert_eq!(result, "test/test.min.jpeg".to_string());

        parameters = ProfileData::new();
        parameters.should_convert = true;
        parameters.convert_extension = ImageType::PNG;
        result = get_out_path(&parameters, &"test/test.jpeg".to_string());
        assert_eq!(result, "test/test.min.png".to_string());

        parameters = ProfileData::new();
        parameters.should_convert = false;
        parameters.convert_extension = ImageType::PNG;
        result = get_out_path(&parameters, &"test/test.jpeg".to_string());
        assert_eq!(result, "test/test.min.jpeg".to_string());

        parameters = ProfileData::new();
        parameters.add_posfix = false;
        result = get_out_path(&parameters, &"test/test.jpeg".to_string());
        assert_eq!(result, "test/test.jpeg".to_string());

        parameters = ProfileData::new();
        parameters.postfix = ".bong".to_string();
        result = get_out_path(&parameters, &"test/test.jpeg".to_string());
        assert_eq!(result, "test/test.bong.jpeg".to_string());
    }

    #[test]
    fn test_get_temp_path() {
        let result = get_temp_path(&"test/test.png".to_string());
        assert_eq!(result, "test/.test.png".to_string());
    }
    // #[test]
    // fn test_process_image() {
    //     let parameters = Parameters {
    //         path: "test/test.png".to_string(),
    //         postfix: ".min".to_string(),
    //         resize: true,
    //         resize_width: 1000,
    //         resize_height: 1000,
    //         jpeg_quality: 80,
    //         png_quality: 80,
    //         webp_quality: 80,
    //         gif_quality: 80,
    //         convert_extension: None,
    //     };
    //     let result = process_img(parameters).await;
    //     assert_eq!(result.result, "Success".to_string());
    //     assert_eq!(result.out_path, "test/test.min.png".to_string());
    // }
}
