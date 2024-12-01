import { useKeyDownEvent } from "@solid-primitives/keyboard";
import { createEffect, createSignal } from "solid-js";
import { SettingsInput, SettingsModal } from "./SettingsUI";

function NewProfileModal(props: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [newProfileName, setNewProfileName] = createSignal("");
  const event = useKeyDownEvent();
  createEffect(() => {
    const e = event();
    if (e && e.key === "Enter") {
      onOK();
    }
    if (e && e.key === "Escape") {
      props.onClose();
    }
  });
  function onOK() {
    if (newProfileName() === "") {
      return;
    }
    props.onCreate(newProfileName());
    setNewProfileName("");
    props.onClose();
  }
  return (
    <SettingsModal title="Create New Profile">
      <div class="text-center">
        <SettingsInput
          autoFocus={true}
          placeholder="Name"
          label="Name"
          value=""
          class="mt-2"
          onChange={async (value) => {
            setNewProfileName(value);
          }}
        />
      </div>
      <div class="mt-6 grid grid-flow-row-dense grid-cols-2 gap-3">
        <button
          disabled={newProfileName() === ""}
          onClick={onOK}
          type="button"
          class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
        >
          Create
        </button>
        <button
          onClick={() => props.onClose()}
          type="button"
          class="inline-flex w-full justify-center rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm  hover:bg-gray-50 col-start-1 mt-0"
        >
          Cancel
        </button>
      </div>
    </SettingsModal>
  );
}

export { NewProfileModal };
