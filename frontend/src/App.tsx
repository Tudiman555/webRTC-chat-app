import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Lobby from "./screens/Lobby";
import Room from "./screens/Room";

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>
    </div>
  );
};

export default App;
