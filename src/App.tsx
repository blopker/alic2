import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Dropper from "./Dropper";
import BottomBar from "./BottomBar";
import Table from "./Table";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name: name() }));
  }
  return (
    <>
      <main class="container h-full justify-between">
        <Dropper onDrop={(files) => setGreetMsg(files.join("\n"))} />
        <Table />
        <p class="grow">Droppit</p>
        <p>{greetMsg()}</p>
      </main>
      <BottomBar />
    </>
  );
}

export default App;
