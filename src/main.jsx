import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import "./admin/admin.css";
import Site from "./App.jsx";
import TaxiBooking from "./pages/TaxiBooking.jsx";
import CategoryDetail from "./pages/CategoryDetail.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import Categories from "./admin/Categories.jsx";
import TouristPlaces from "./admin/TouristPlaces.jsx";
import TourPackages from "./admin/TourPackages.jsx";
import TaxiBookings from "./admin/TaxiBookings.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import { AuthProvider } from "./AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/taxi-booking" element={<TaxiBooking />} />
        <Route path="/category/:name" element={<CategoryDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="places" element={<TouristPlaces />} />
          <Route path="packages" element={<TourPackages />} />
          <Route path="taxi" element={<TaxiBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);