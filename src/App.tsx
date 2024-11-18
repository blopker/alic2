import { createSignal } from "solid-js";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Dropper from "./Dropper";
import BottomBar from "./BottomBar";
import Table from "./Table";

function App() {
  const [name, setName] = createSignal("");
  const [files, setFiles] = createSignal<string[]>([]);
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name: name() }));
  // }
  return (
    <>
      <main class="container h-full justify-between">
        <Dropper onDrop={(files) => setFiles(files)} />
        <Table data={files()} />
        <p class="grow">Droppit</p>
      </main>
      <BottomBar />
    </>
  );
}

export default App;
