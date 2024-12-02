import type { Event } from "@tauri-apps/api/event";
import { type DragDropEvent, getCurrentWebview } from "@tauri-apps/api/webview";
import { BsArrowDownSquare } from "solid-icons/bs";
import { Show, createSignal, onCleanup } from "solid-js";
import { Transition } from "solid-transition-group";
import { commands } from "./bindings";
import { FILE_TYPES } from "./constants";
import { addFile } from "./store";

function anyImage(...paths: string[]) {
  for (const path of paths) {
    if (FILE_TYPES.includes(path.split(".").pop() ?? "")) {
      return true;
    }
  }
  return false;
}

export default function Dropper() {
  const [showDropper, setShowDropper] = createSignal(false);
  const cancel = getCurrentWebview().onDragDropEvent(
    async (e: Event<DragDropEvent>) => {
      if (e.payload.type === "enter") {
        if (anyImage(...e.payload.paths)) {
          setShowDropper(true);
        }
      } else if (e.payload.type === "leave") {
        setShowDropper(false);
      } else if (e.payload.type === "drop") {
        setShowDropper(false);
        for (const path of e.payload.paths) {
          const images = await commands.getAllImages(path);
          if (images.status === "error") {
            console.log(images.error);
            return;
          }
          for (const image of images.data) {
            addFile(image);
          }
        }
      }
    },
  );
  onCleanup(() => {
    cancel.then((cancel) => cancel());
  });
  return (
    <Transition name="fade">
      <Show when={showDropper()}>
        <DropOverlay />
      </Show>
    </Transition>
  );
}

function DropOverlay() {
  return (
    <div class="frost absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 transition-all z-50">
      <BsArrowDownSquare size={100} />
    </div>
  );
}
