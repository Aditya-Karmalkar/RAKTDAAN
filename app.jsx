import React from "react";
import PendingRequest from "./PendingRequest";

function App() {
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Dashboard</h1>
      <PendingRequest />
    </div>
  );
}

export default App;
