// frontend/src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import PublicNavbar from "./components/PublicNavbar";
import AppNavbar from "./components/AppNavbar";
import AppPage from "./pages/AppPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contract from "./pages/Contract";

// import AppPage from "./pages/AppPage"; // generator page (later)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          {/* Public site */}
          <Route
            path="/"
            element={
              <>
                <PublicNavbar />
                <Home />
              </>
            }
          />

          <Route
            path="/login"
            element={
              <>
                <PublicNavbar />
                <Login />
              </>
            }
          />

          <Route
            path="/signup"
            element={
              <>
                <PublicNavbar />
                <Signup />
              </>
            }
          />
          <Route
             path="/contract"
             element={
               <>
                 <PublicNavbar />
                 <Contract />
               </>
            }
          />


          {/* App (generator) — placeholder for now */}
          
          <Route
            path="/app"
            element={
              <>
                <AppNavbar />
                <AppPage />
              </>
            }
          />
          
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}
