import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initTheme } from './store/themeStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import TrackOrder from './pages/TrackOrder';
import RestaurantDetail from './pages/RestaurantDetail';
import Deals from './pages/Deals';
import Compare from './pages/Compare';
import About from './pages/About';
import Shop from './pages/Shop';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Reviews from './pages/Reviews';
import MyOrders from './pages/MyOrders';
import MyReviews from './pages/MyReviews';
import ExploreTables from './pages/ExploreTables';
import TableSelection from './pages/TableSelection';
import ReserveTable from './pages/ReserveTable';
import BillingPage from './pages/BillingPage';
import Footer from './components/Footer';


function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen transition-colors duration-500 overflow-x-hidden">
        {/* Modern Grain Overlay for Texture */}
        <div className="grain-overlay" />
        <Toaster position="top-center" richColors />
        <Navbar />
        
        <main className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/myreviews" element={<MyReviews />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/explore-tables" element={<ExploreTables />} />
            <Route path="/select-table" element={<TableSelection />} />
            <Route path="/reserve-table" element={<ReserveTable />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/restaurant-view/:id" element={<RestaurantDetail />} />

            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/restaurant/*" element={<RestaurantDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
