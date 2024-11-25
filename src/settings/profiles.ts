export const profiles: Profile[] = [
  {
    name: "Default",
    removable: false,
    settings: {
      jpeg_quality: 80,
      png_quality: 80,
      webp_quality: 80,
      gif_quality: 80,
      resize_width: 1000,
      resize_height: 1000,
      resize: false,
      convert_extension: "WEBP",
      should_convert: false,
    },
  },
  {
    name: "High Quality",
    removable: true,
    settings: {
      jpeg_quality: 90,
      png_quality: 90,
      webp_quality: 90,
      gif_quality: 90,
      resize_width: 1000,
      resize_height: 1000,
      resize: false,
      convert_extension: "WEBP",
      should_convert: true,
    },
  },
];

export type Profile = {
  name: string;
  removable: boolean;
  settings: Settings;
};

export type Settings = {
  jpeg_quality: number;
  png_quality: number;
  webp_quality: number;
  gif_quality: number;
  resize_width: number;
  resize_height: number;
  resize: boolean;
  should_convert: boolean;
  convert_extension: ImageType;
};

export type ImageType = "JPEG" | "PNG" | "WEBP" | "GIF" | "TIFF";
