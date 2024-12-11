import { For, type JSXElement, onMount } from "solid-js";
import "../App.css";

function SettingBox(props: { title: string; children: JSXElement }) {
  return (
    <div>
      <div class="pb-2">{props.title}</div>
      <div class="flex flex-col gap-4 rounded-xl border-2 border-accent p-4">
        {props.children}
      </div>
    </div>
  );
}

function SettingRow(props: { title: string; children: JSXElement }) {
  return (
    <div class="flex items-center justify-between gap-2">
      <div>{props.title}</div>
      <div>{props.children}</div>
    </div>
  );
}

function SettingsToggle(props: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
      role="switch"
      aria-checked={props.value}
      classList={{
        "bg-indigo-600": props.value === true,
        "bg-gray-200": props.value === false,
      }}
      onClick={() => {
        props.onChange(!props.value);
      }}
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block size-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        classList={{
          "translate-x-5": props.value === true,
        }}
      />
    </button>
  );
}

function SettingsSelect(props: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  class?: string;
}) {
  return (
    <select
      class={`${props.class} rounded-md border-0 bg-primary py-1.5 shadow-sm sm:text-sm/6`}
      value={props.value}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    >
      <For each={props.options}>
        {(option) => (
          <option selected={option === props.value}>{option}</option>
        )}
      </For>
    </select>
  );
}

function SettingsModal(props: { title: string; children: JSXElement }) {
  return (
    <div class="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50 transition-all">
      <div class="w-full max-w-sm rounded-md bg-secondary p-4">
        <div class="pb-4 font-bold text-xl">{props.title}</div>
        {props.children}
      </div>
    </div>
  );
}

function SettingsInput(props: {
  label: string;
  value: string;
  class: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}) {
  let inputRef: HTMLInputElement | undefined;
  onMount(() => {
    if (inputRef && props.autoFocus) {
      inputRef.focus();
    }
  });
  return (
    <input
      ref={inputRef}
      placeholder={props.placeholder}
      autofocus={props.autoFocus}
      class={`${props.class} rounded-md border-0 bg-primary py-1.5 shadow-sm sm:text-sm/6`}
      type="text"
      value={props.value}
      onInput={(e) => {
        props.onChange(e.target.value);
      }}
    />
  );
}

export {
  SettingBox,
  SettingRow,
  SettingsToggle,
  SettingsSelect,
  SettingsModal,
  SettingsInput,
};
