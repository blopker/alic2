// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Dropper from "./Dropper";
import BottomBar from "./BottomBar";
import Table from "./Table";

function App() {
  return (
    <>
      <main class="h-full justify-between w-full">
        <Dropper />
        <Table />
      </main>
      <BottomBar />
    </>
  );
}

export default App;
