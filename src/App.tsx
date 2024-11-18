import { createSignal } from "solid-js";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Dropper from "./Dropper";
import BottomBar from "./BottomBar";
import Table from "./Table";
import { FilesProvider } from "./contexts";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name: name() }));
  // }
  return (
    <FilesProvider>
      <main class="container h-full justify-between">
        <Dropper />
        <Table />
        <p class="grow">Droppit</p>
      </main>
      <BottomBar />
    </FilesProvider>
  );
}

export default App;
