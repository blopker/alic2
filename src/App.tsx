import "./App.css";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import BottomBar from "./BottomBar";
import Dropper from "./Dropper";
import Table from "./Table";
import { addFile } from "./store";

onOpenUrl((urls) => {
  console.log("deep link:", urls);
  // [Log] deep link: – ["file:///Users/blopker/Downloads/akidwell-passport(1).jpg"]
  for (const url of urls) {
    addFile(url.replace("file://", ""));
  }
});

function App() {
  return (
    <div class="flex flex-col h-screen">
      <main class="grow w-full">
        <Dropper />
        <Table />
      </main>
      <BottomBar />
    </div>
  );
}

export default App;
