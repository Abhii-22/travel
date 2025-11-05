import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import BusBooking from "./pages/BusBooking";
import CarBooking from "./pages/CarBooking";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "./components/Header";



function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bus" element={<BusBooking />} />
        <Route path="/car" element={<CarBooking />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
