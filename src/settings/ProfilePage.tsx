import { useNavigate, useParams } from "@solidjs/router";
import type { ImageType } from "../bindings";
import {
  SettingBox,
  SettingRow,
  SettingsSelect,
  SettingsToggle,
} from "./SettingsUI";
import { deleteProfile, settings, updateProfile } from "./settingsData";

const imageTypes: ImageType[] = ["JPEG", "PNG", "WEBP", "GIF", "TIFF"];

function ProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const data = () => {
    const d = settings.profiles.find(
      (p) => p.id.toString() === params.profileid,
    );
    if (!d) {
      throw new Error(`Profile not found: ${params.profileid}`);
    }
    return d;
  };
  return (
    <div>
      <h1 class="pb-4 text-left font-bold text-xl">Profile: {data().name}</h1>
      <SettingBox title="Quality">
        <SettingRow title="JPEG Quality">
          <QualitySlider
            value={data().jpeg_quality}
            onChange={(value) => {
              updateProfile(data().id, { jpeg_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="PNG Quality">
          <QualitySlider
            value={data().png_quality}
            onChange={(value) => {
              updateProfile(data().id, { png_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="WEBP Quality">
          <QualitySlider
            value={data().webp_quality}
            onChange={(value) => {
              updateProfile(data().id, { webp_quality: value });
            }}
          />
        </SettingRow>
        <SettingRow title="GIF Quality">
          <QualitySlider
            value={data().gif_quality}
            onChange={(value) => {
              updateProfile(data().id, { gif_quality: value });
            }}
          />
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Resize">
        <SettingRow title="Resize">
          <SettingsToggle
            value={data().should_resize}
            onChange={(value) => {
              updateProfile(data().id, {
                should_resize: value,
              });
            }}
          />
        </SettingRow>
        <SettingRow title="Resize Width">
          <NumberInput
            value={data().resize_width}
            onChange={(value) => {
              updateProfile(data().id, {
                resize_width: value,
              });
            }}
          />
          <span class="pl-2">px</span>
        </SettingRow>
        <SettingRow title="Resize Height">
          <NumberInput
            value={data().resize_height}
            onChange={(value) => {
              updateProfile(data().id, {
                resize_height: value,
              });
            }}
          />
          <span class="pl-2">px</span>
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Output">
        <SettingRow title="Allow Overwrite">
          <SettingsToggle
            value={data().should_overwrite}
            onChange={(value) => {
              updateProfile(data().id, {
                should_overwrite: value,
              });
            }}
          />
        </SettingRow>
        <SettingRow title="Add Postfix">
          <SettingsToggle
            value={data().add_posfix ?? false}
            onChange={(value) => {
              updateProfile(data().id, {
                add_posfix: value,
              });
            }}
          />
        </SettingRow>
        <SettingRow title="Postfix">
          <input
            class="w-20 rounded-md border-0 bg-secondary py-1.5 shadow-sm sm:text-sm/6"
            type="text"
            value={data().postfix}
            onInput={(e) => {
              updateProfile(data().id, {
                postfix: e.target.value,
              });
            }}
          />
        </SettingRow>
        <SettingRow title="Convert Image">
          <SettingsToggle
            value={data().should_convert}
            onChange={(value) => {
              updateProfile(data().id, {
                should_convert: value,
              });
            }}
          />
        </SettingRow>
        <SettingRow title="Convert Format">
          <SettingsSelect
            class="w-32"
            value={data().convert_extension}
            onChange={(type) =>
              updateProfile(data().id, { convert_extension: type as ImageType })
            }
            options={imageTypes}
          />
        </SettingRow>
      </SettingBox>
      <div class="pt-8" />
      <SettingBox title="Manage">
        <SettingRow title="Reset">
          <button
            onClick={() => {
              updateProfile(data().id, {
                should_resize: false,
                should_convert: false,
                should_overwrite: false,
                postfix: ".min",
                resize_width: 1000,
                resize_height: 1000,
                jpeg_quality: 80,
                png_quality: 80,
                webp_quality: 80,
                gif_quality: 80,
              });
            }}
            type="button"
            class="rounded bg-red-500 px-4 font-bold text-white hover:bg-red-700"
          >
            Reset
          </button>
        </SettingRow>
        <SettingRow title="Delete">
          <button
            disabled={data().id === 0}
            onClick={() => {
              deleteProfile(data().id);
              navigate("/settings");
            }}
            type="button"
            class="rounded bg-red-500 px-4 font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-500"
          >
            Delete
          </button>
        </SettingRow>
      </SettingBox>
    </div>
  );
}

function NumberInput(props: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      class="w-20 rounded-md border-0 bg-secondary py-1.5 shadow-sm sm:text-sm/6"
      type="text"
      min="1"
      value={props.value}
      onInput={(e) => {
        const value = Number.parseInt(e.target.value);
        if (Number.isNaN(value)) {
          return;
        }
        props.onChange(value);
      }}
    />
  );
}

function QualitySlider(props: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div class="flex gap-4">
      <input
        type="range"
        min="1"
        max="10"
        value={props.value / 10}
        onInput={(e) => {
          props.onChange(Number.parseInt(e.target.value) * 10);
        }}
      />
      <div>{props.value}</div>
    </div>
  );
}

export { ProfilePage };
