/* @refresh reload */
import { Match, Switch, render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { Settings } from "./settings/SettingsPage";

// get the query paramater of ?window=settings
const window = new URLSearchParams(globalThis.location.search).get("window");
console.log(window);

render(() => {
  return (
    <Switch>
      <Match when={window === "settings"}>
        <Settings />
      </Match>
      <Match when={true}>
        <App />
      </Match>
    </Switch>
  );
}, document.getElementById("root"));
