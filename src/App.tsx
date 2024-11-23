import "./App.css";
import BottomBar from "./BottomBar";
import Dropper from "./Dropper";
import Table from "./Table";

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
