import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TrackerTable } from "./components/TrackerTable";
import { TrackerTableAlt } from "./components/TrackerTableAlt";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<TrackerTable />} />
          <Route path="/company-tracker" element={<TrackerTableAlt />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
