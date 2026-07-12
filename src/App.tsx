import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashBorad";
import DrProduct from "./pages/DrProduct";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DrProduct />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
