// Bottom app bar in solidjs
//
import { open } from "@tauri-apps/plugin-dialog";
import { useFiles } from "./contexts";

export default function BottomBar() {
  return (
    <div class="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-gray-400 h-8 px-2 shadow-2xl">
      <AddButton />
      <div>hi</div>
    </div>
  );
}

function AddButton() {
  const [_, { addFile }] = useFiles();
  async function openFile() {
    console.log("open file");
    const file = await open({
      multiple: false,
      directory: false,
    });
    console.log(file);
    if (!file) {
      return;
    }
    addFile({
      file: file,
      status: "",
      size: 1,
      savings: 1,
    });
  }
  return (
    <button
      type="button"
      onClick={openFile}
      class="relative border-[0.5px] rounded h-5 w-8 hover:bg-gray-300 p-0 m-0 leading-none"
    >
      +
    </button>
  );
}
