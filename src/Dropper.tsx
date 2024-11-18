import { getCurrentWebview, type DragDropEvent } from "@tauri-apps/api/webview";
import type { Event } from "@tauri-apps/api/event";
import { createSignal, onCleanup, Show } from "solid-js";
import { Transition } from "solid-transition-group";
import { useFiles } from "./contexts";

export default function Dropper() {
  const [_, { addFile }] = useFiles();
  const [showDropper, setShowDropper] = createSignal(false);
  const cancel = getCurrentWebview().onDragDropEvent(
    (e: Event<DragDropEvent>) => {
      if (e.payload.type === "enter") {
        setShowDropper(true);
      } else if (e.payload.type === "leave") {
        setShowDropper(false);
      } else if (e.payload.type === "drop") {
        setShowDropper(false);
        for (const path of e.payload.paths) {
          addFile({
            file: path,
            status: "",
            size: 1,
            savings: 1,
          });
        }
      }
    },
  );
  onCleanup(() => {
    cancel.then((cancel) => cancel());
  });
  return (
    <Transition name="slide-fade">
      <Show when={showDropper()}>
        <DropOverlay />
      </Show>
    </Transition>
  );
}

function DropOverlay() {
  return (
    <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 transition-all z-50">
      <div class="text-8xl">👇</div>
    </div>
  );
}
