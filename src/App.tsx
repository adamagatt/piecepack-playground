import { useState } from "react";
import "./App.css";
import { CatalogScreen } from "./components/CatalogScreen";
import { PlayTableScreen } from "./components/PlayTableScreen";

type View = "catalog" | "play";

/** Root React tree; catalog reference or interactive play table. */
function App() {
  const [view, setView] = useState<View>("catalog");

  if (view === "play") {
    return <PlayTableScreen onOpenCatalog={() => setView("catalog")} />;
  }

  return <CatalogScreen onOpenPlay={() => setView("play")} />;
}

export default App;
