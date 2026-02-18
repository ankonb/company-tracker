import "./App.css";
import { TrackerTable } from "./components/TrackerTable";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}>
      <TrackerTable />
      <Toaster />
    </div>
  );
}

export default App;
