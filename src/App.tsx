// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Dropper from "./Dropper";
import BottomBar from "./BottomBar";
import Table from "./Table";
import { FilesProvider } from "./contexts";

function App() {
  return (
    <FilesProvider>
      <main class="h-full justify-between w-full">
        <Dropper />
        <Table />
      </main>
      <BottomBar />
    </FilesProvider>
  );
}

export default App;
