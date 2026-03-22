import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Shield } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const NoteViewer = () => {
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get('/orders/myorders');
        const found = res.data.find(o => o._id === orderId);
        if (found) {
          setOrder(found);
        } else {
          setError('Order not found');
        }
      } catch {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setError('');
      fetchOrder();
    } else {
      setError('Please log in to view notes');
      setLoading(false);
    }
  }, [orderId, user, authLoading]);

  // Build the secure PDF URL with auth token
  const token = localStorage.getItem('token');
  const pdfUrl = `http://localhost:5000/api/orders/${orderId}/view?token=${token}`;

  if (loading) return <div className="p-16 text-center text-xl font-medium text-gray-500 animate-pulse">Loading viewer...</div>;
  if (error) return <div className="p-16 text-center text-xl font-medium text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" onContextMenu={e => e.preventDefault()}>
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="hidden sm:block w-px h-6 bg-gray-700"></div>
          <h1 className="hidden sm:block text-white font-bold text-lg truncate max-w-md">{order?.product?.title || 'Study Notes'}</h1>
        </div>
        <div className="flex items-center space-x-2 text-green-400 text-xs font-bold">
          <Shield className="w-4 h-4" />
          <span>Secure Viewer</span>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative select-none overflow-y-auto flex flex-col items-center py-6">
        {/* Watermark overlay */}
        <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.06]" style={{ userSelect: 'none' }}>
          <div className="text-white text-4xl sm:text-6xl font-black rotate-[-30deg] whitespace-nowrap">
            {user?.email || user?.name || 'Licensed Copy'}
          </div>
        </div>

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-gray-400 mt-10">Loading document securely...</div>}
          error={<div className="text-red-400 mt-10">Failed to load document securely.</div>}
          className="flex flex-col items-center"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-6 shadow-2xl relative">
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(window.innerWidth * 0.95, 900)}
              />
              <div className="absolute inset-0 pointer-events-auto" onContextMenu={e => e.preventDefault()}></div>
            </div>
          ))}
        </Document>
      </div>

      {/* Anti-piracy CSS */}
      <style>{`
        @media print {
          body * { display: none !important; }
          body::after {
            content: "Printing is disabled for copyright protection.";
            display: block;
            text-align: center;
            font-size: 24px;
            padding: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default NoteViewer;
