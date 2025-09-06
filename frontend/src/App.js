import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import Pages
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import UserDashboard from './pages/Dashboard/UserDashboard';
import ProfilePage from './pages/Profile/ProfilePage';
import ProductFeed from './pages/Products/ProductFeed';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import ProductDetail from './pages/Products/ProductDetail';
import MyListings from './pages/Products/MyListings';
import CartPage from './pages/Cart/CartPage';
import PurchasesPage from './pages/Purchases/PurchasesPage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/products" replace />;
};

// Home Route Component (shows landing page for non-authenticated, dashboard for authenticated)
const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/products" replace /> : <LandingPage />;
};

// Page Transition Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Home Route - Landing Page or Dashboard */}
          <Route path="/" element={
            <PageTransition>
              <HomeRoute />
            </PageTransition>
          } />

          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <PageTransition>
                <LoginPage />
              </PageTransition>
            </PublicRoute>
          } />
          
          <Route path="/signup" element={
            <PublicRoute>
              <PageTransition>
                <SignupPage />
              </PageTransition>
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/products" element={
            <ProtectedRoute>
              <PageTransition>
                <ProductFeed />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageTransition>
                <ProductFeed />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/add-product" element={
            <ProtectedRoute>
              <PageTransition>
                <AddProduct />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/edit-product/:productId" element={
            <ProtectedRoute>
              <PageTransition>
                <EditProduct />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/my-listings" element={
            <ProtectedRoute>
              <PageTransition>
                <MyListings />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/cart" element={
            <ProtectedRoute>
              <PageTransition>
                <CartPage />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/purchases" element={
            <ProtectedRoute>
              <PageTransition>
                <PurchasesPage />
              </PageTransition>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <AppRoutes />
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;