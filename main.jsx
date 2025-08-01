import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { AvatarProvider } from "./context/AvatarContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AvatarProvider>
      <App />
    </AvatarProvider>
  </React.StrictMode>
);
