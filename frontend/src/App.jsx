import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";
import AccommodationDetails from "./pages/AccommodationDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddAccommodation from "./pages/AddAccommodation";
import EditAccommodation from "./pages/EditAccommodation";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/user" element={<UserHome />} />
              <Route
                path="/accommodation/:id"
                element={<AccommodationDetails />}
              />

              {/* Protected User Routes */}
              <Route
                path="/user/bookings"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Owner Routes */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={["owner"]}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/add"
                element={
                  <ProtectedRoute allowedRoles={["owner"]}>
                    <AddAccommodation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["owner"]}>
                    <EditAccommodation />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;