use std::ffi::OsStr;
use std::path::{Path, PathBuf};

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
    pub savings: Option<u32>,
    pub ext: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Eq, PartialEq, Clone, Copy, serde::Serialize, serde::Deserialize, Type)]
pub enum FileEntryStatus {
    Processing,
    Compressing,
    Complete,
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
pub struct Parameters {
    pub postfix: String,
    pub path: String,
    pub jpeg_quality: u32,
    pub png_quality: u32,
    pub webp_quality: u32,
    pub gif_quality: u32,
    pub resize: bool,
    pub resize_width: u32,
    pub resize_height: u32,
    pub convert_extension: Option<ImageType>,
}

#[derive(serde::Serialize, serde::Deserialize, Type)]
pub struct CompressResult {
    pub path: String,
    pub out_path: String,
    pub result: String,
}

#[tauri::command]
#[specta::specta]
pub async fn get_file_info(mut file: FileEntry) -> Result<FileEntry, String> {
    file.savings = Some(0);
    file.size = Some(0);
    Ok(file)
}

#[tauri::command]
#[specta::specta]
pub async fn process_img(parameters: ProfileData, path: String) -> Result<CompressResult, String> {
    let img = read_image(&path)?;
    let original_image_type = guess_image_type(&path)?;
    let out_path = get_out_path(&parameters, original_image_type, &path);

    let csparams = create_csparameters(&parameters, img.width(), img.height());
    drop(img);

    let should_convert =
        parameters.should_convert && parameters.convert_extension != original_image_type;

    let result = if should_convert {
        convert_image(&path, &out_path, csparams, parameters.convert_extension)?
    } else {
        compress_image(&path, &out_path, csparams)?
    };

    Ok(CompressResult {
        path,
        out_path,
        result,
    })
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

fn get_out_path(parameters: &ProfileData, image_type: ImageType, path: &str) -> String {
    let extension = if parameters.should_convert {
        parameters.convert_extension
    } else {
        image_type
    };
    let path = Path::new(&path);
    let original_extension = path.extension().unwrap_or_default();
    format!(
        "{}{}.{}",
        remove_extension(&path),
        parameters.postfix,
        convert_image_type(original_extension, extension)
    )
}

fn convert_image_type(original_extension: &OsStr, image_type: ImageType) -> String {
    match image_type {
        ImageType::JPEG => {
            if original_extension == "jpeg" {
                "jpeg".to_string()
            } else {
                "jpg".to_string()
            }
        }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_image_type() {
        let result = convert_image_type(OsStr::new("jpeg"), ImageType::JPEG);
        assert_eq!(result, "jpeg".to_string());
    }

    #[test]
    fn test_guess_image_type() {
        let result = guess_image_type("test/test.png");
        println!("{:?}", result);
        assert_eq!(result.unwrap(), ImageType::PNG);
    }

    #[test]
    fn test_get_out_path() {
        let parameters = ProfileData::new();
        let image_type = ImageType::PNG;
        let result = get_out_path(&parameters, image_type, &"data.png".to_string());
        assert_eq!(result, "test/test.min.png".to_string());
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
