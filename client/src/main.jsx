
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import React from "react";
import ReactDOM from "react-dom/client";



ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
<AuthProvider>
  <App />
</AuthProvider>
  </React.StrictMode>
)
