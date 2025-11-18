import Home from "./pages/Home";
import { Routes, Route } from "react-router";

import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

      
      </Routes>
    </AuthProvider>
  );
}

export default App;
