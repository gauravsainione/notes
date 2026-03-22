import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import NoteViewer from './pages/NoteViewer';
import MyNotes from './pages/MyNotes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="page-shell min-h-screen text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 relative z-[1]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-notes" element={<MyNotes />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/view/:orderId" element={<NoteViewer />} />
              <Route path="*" element={<div className="p-8 text-center text-2xl font-bold">404 Not Found</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
