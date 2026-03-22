import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Package, UserCheck, TrendingUp, Book, CheckCircle, XCircle, Clock, DollarSign, ShoppingCart, Wallet, CreditCard, ArrowDownCircle, Heart, Bookmark, MessageSquare, Star } from 'lucide-react';
import { getFavoriteIds, getBookmarkIds } from '../utils/savedCourses';
import PdfThumbnail from '../components/PdfThumbnail';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';

const semesterSubjects = {
  'B.Tech': {
    'Sem 1': ['Mathematics-I','Physics','Chemistry','English','Basic Electrical Engineering','Programming in C'],
    'Sem 2': ['Mathematics-II','Engineering Drawing','Programming in C++','Environmental Science','Workshop Practice','Communication Skills'],
    'Sem 3': ['Mathematics-III','Data Structures','Digital Electronics','Discrete Mathematics','Computer Architecture','Object Oriented Programming'],
    'Sem 4': ['Operating Systems','DBMS','Theory of Computation','Computer Networks','Mathematics-IV','Microprocessors'],
    'Sem 5': ['Software Engineering','Compiler Design','Web Development','Machine Learning','Computer Graphics','Elective-I'],
    'Sem 6': ['Cloud Computing','Information Security','Artificial Intelligence','Big Data Analytics','Elective-II','Mini Project'],
    'Sem 7': ['Deep Learning','IoT','Blockchain','Natural Language Processing','Elective-III','Major Project-I'],
    'Sem 8': ['Major Project-II','Internship','Seminar','Elective-IV']
  },
  'BCA': {
    'Sem 1': ['Mathematics-I','Programming in C','Digital Electronics','English','Computer Fundamentals','Office Automation'],
    'Sem 2': ['Mathematics-II','Programming in C++','Data Structures','Operating Systems','Web Technology','Environmental Studies'],
    'Sem 3': ['Java Programming','DBMS','Computer Networks','Software Engineering','Discrete Mathematics','Communication Skills'],
    'Sem 4': ['Python Programming','Computer Architecture','Computer Graphics','Numerical Methods','Elective-I','Mini Project'],
    'Sem 5': ['PHP & MySQL','Cloud Computing','Mobile App Development','Machine Learning','Elective-II','Project-I'],
    'Sem 6': ['Cyber Security','AI & Deep Learning','Blockchain','Major Project','Internship','Elective-III']
  },
  'MCA': {
    'Sem 1': ['Advanced Data Structures','Advanced DBMS','Computer Networks','Mathematical Foundations','Advanced Java','Research Methodology'],
    'Sem 2': ['Machine Learning','Cloud Computing','Software Testing','Web Frameworks','Distributed Systems','Elective-I'],
    'Sem 3': ['Big Data','AI & Deep Learning','Cyber Security','Blockchain','Elective-II','Project-I'],
    'Sem 4': ['Major Project','Internship','Seminar','Elective-III']
  },
  'BBA': {
    'Sem 1': ['Principles of Management','Business Economics','Financial Accounting','Business Mathematics','English','Computer Applications'],
    'Sem 2': ['Organizational Behavior','Business Statistics','Cost Accounting','Business Law','Communication Skills','Environmental Studies'],
    'Sem 3': ['Marketing Management','Human Resource Management','Financial Management','Business Ethics','Indian Economy','Elective-I'],
    'Sem 4': ['Production & Operations','International Business','Strategic Management','Entrepreneurship','Tax Planning','Elective-II'],
    'Sem 5': ['Consumer Behavior','Supply Chain Management','E-Commerce','Research Methodology','Elective-III','Project-I'],
    'Sem 6': ['Project Management','Business Analytics','Corporate Governance','Major Project','Internship','Elective-IV']
  },
  'MBA': {
    'Sem 1': ['Managerial Economics','Organizational Behavior','Financial Accounting','Marketing Management','Business Statistics','Business Communication'],
    'Sem 2': ['Operations Management','Financial Management','Human Resource Management','Business Research Methods','Strategic Management','Legal Aspects of Business'],
    'Sem 3': ['International Business','Supply Chain Management','Entrepreneurship','Business Analytics','Elective-I','Elective-II'],
    'Sem 4': ['Corporate Governance','Change Management','Major Project','Internship','Elective-III','Elective-IV']
  },
  'B.Com': {
    'Sem 1': ['Financial Accounting-I','Business Economics','Business Law','English','Business Mathematics','Computer Applications'],
    'Sem 2': ['Financial Accounting-II','Business Statistics','Company Law','Corporate Accounting','Communication Skills','Environmental Studies'],
    'Sem 3': ['Cost Accounting','Income Tax','Banking & Insurance','Indian Economy','Elective-I','Business Ethics'],
    'Sem 4': ['Management Accounting','Auditing','GST & Custom Laws','Financial Markets','Elective-II','E-Commerce'],
    'Sem 5': ['Advanced Accounting','Corporate Tax Planning','Financial Management','Entrepreneurship','Elective-III','Project-I'],
    'Sem 6': ['International Accounting','Financial Reporting','Major Project','Internship','Elective-IV','Elective-V']
  },
  'M.Com': {
    'Sem 1': ['Advanced Financial Accounting','Managerial Economics','Research Methodology','Advanced Statistics','Business Environment','Tax Planning'],
    'Sem 2': ['Corporate Financial Reporting','Strategic Management','Advanced Auditing','International Business','Financial Analytics','Elective-I'],
    'Sem 3': ['Investment Management','International Finance','E-Commerce','Elective-II','Elective-III','Project-I'],
    'Sem 4': ['Major Project','Internship','Seminar','Elective-IV']
  },
  'B.Sc': {
    'Sem 1': ['Physics-I','Chemistry-I','Mathematics-I','English','Computer Basics','Environmental Science'],
    'Sem 2': ['Physics-II','Chemistry-II','Mathematics-II','Biology','Lab Practices','Communication Skills'],
    'Sem 3': ['Physics-III','Chemistry-III','Mathematics-III','Statistics','Elective-I','Lab Work'],
    'Sem 4': ['Physics-IV','Chemistry-IV','Mathematics-IV','Computer Science','Elective-II','Lab Work'],
    'Sem 5': ['Advanced Physics','Advanced Chemistry','Advanced Mathematics','Elective-III','Project-I','Seminar'],
    'Sem 6': ['Major Project','Internship','Elective-IV','Elective-V','Lab Work','Viva']
  },
  'M.Sc': {
    'Sem 1': ['Advanced Mathematics','Classical Mechanics','Organic Chemistry','Research Methodology','Elective-I','Lab Work'],
    'Sem 2': ['Quantum Mechanics','Inorganic Chemistry','Mathematical Analysis','Computer Applications','Elective-II','Lab Work'],
    'Sem 3': ['Statistical Mechanics','Physical Chemistry','Advanced Elective','Elective-III','Project-I','Seminar'],
    'Sem 4': ['Major Project','Thesis','Viva','Elective-IV']
  },
  'BA': {
    'Sem 1': ['English-I','Hindi-I','Political Science-I','History-I','Economics-I','Sociology-I'],
    'Sem 2': ['English-II','Hindi-II','Political Science-II','History-II','Economics-II','Environmental Studies'],
    'Sem 3': ['English Literature','Indian History','Indian Polity','Microeconomics','Psychology','Elective-I'],
    'Sem 4': ['Modern Literature','World History','International Relations','Macroeconomics','Geography','Elective-II'],
    'Sem 5': ['Philosophical Thought','Public Administration','Research Methodology','Elective-III','Project-I','Seminar'],
    'Sem 6': ['Major Project','Internship','Elective-IV','Elective-V','Viva','Dissertation']
  },
  'MA': {
    'Sem 1': ['Literary Criticism','Indian Writing in English','Research Methodology','Linguistics','Ancient Indian History','Elective-I'],
    'Sem 2': ['Comparative Literature','Post-Colonial Studies','Modern Indian History','Political Theory','Elective-II','Seminar'],
    'Sem 3': ['Advanced Research','Dissertation-I','Elective-III','Elective-IV','Field Work','Seminar'],
    'Sem 4': ['Dissertation-II','Viva','Elective-V','Internship']
  }
};

const Dashboard = () => {
  const { user, refreshUser, setUser } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [stats, setStats] = useState({ users: 0, products: 0, pending: 0, allTime: {orders:0,earnings:0,commission:0}, today: {orders:0,earnings:0,commission:0}, weekly: {orders:0,earnings:0,commission:0}, monthly: {orders:0,earnings:0,commission:0}, payouts: { pendingCount: 0, pendingAmount: 0, totalPaidOut: 0 } });
  const [statsPeriod, setStatsPeriod] = useState('today');
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);
  
  const [pendingProducts, setPendingProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', role: '', location: '', phone: '' });

  const [allProducts, setAllProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({ title: '', description: '', price: 0, category: '' });
  const [manualGrantOptions, setManualGrantOptions] = useState({ students: [], products: [] });
  const [manualGrantForm, setManualGrantForm] = useState({ buyerId: '', productId: '', note: '' });
  const [manualGrantSubmitting, setManualGrantSubmitting] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', pricingType: 'paid', type: 'digital', category: '', location: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [editListingId, setEditListingId] = useState(null);
  const [editListingData, setEditListingData] = useState({ title: '', price: '', category: '' });
  const [payoutData, setPayoutData] = useState({ upiId: '', upiName: '' });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [myPayouts, setMyPayouts] = useState([]);
  const [adminPayouts, setAdminPayouts] = useState([]);
  const [userPayoutDetails, setUserPayoutDetails] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const [editingPayoutUserId, setEditingPayoutUserId] = useState(null);
  const [editPayoutData, setEditPayoutData] = useState({ upiId: '', upiName: '', walletBalance: 0 });

  const [interactions, setInteractions] = useState([]);
  const [interactionTypeFilter, setInteractionTypeFilter] = useState('all');
  const [interactionReplyFilter, setInteractionReplyFilter] = useState('all');
  const [interactionProductFilter, setInteractionProductFilter] = useState('all');
  const [promptReplyData, setPromptReplyData] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isAdminDelete, setIsAdminDelete] = useState(false);
  const [promptRejectId, setPromptRejectId] = useState(null);


  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'admin') {
      if (activeTab === 'overview') {
        api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
      } else if (activeTab === 'approvals') {
        api.get('/admin/products/pending').then(res => setPendingProducts(res.data)).catch(console.error);
      } else if (activeTab === 'users') {
        api.get('/admin/users').then(res => setUsersList(res.data)).catch(console.error);
      } else if (activeTab === 'all_posts') {
        api.get('/admin/products').then(res => setAllProducts(res.data)).catch(console.error);
      } else if (activeTab === 'payout_requests') {
        api.get('/admin/payouts').then(res => setAdminPayouts(res.data)).catch(console.error);
      } else if (activeTab === 'payout_details') {
        api.get('/admin/users/payout-details').then(res => setUserPayoutDetails(res.data)).catch(console.error);
      } else if (activeTab === 'sales') {
        api.get('/admin/orders').then(res => setSalesRecords(res.data)).catch(console.error);
      } else if (activeTab === 'manual_grants') {
        api.get('/admin/manual-grants/options').then(res => setManualGrantOptions(res.data)).catch(console.error);
      }
    } else {
      // Seller/Student
      if (activeTab === 'overview') {
        api.get('/orders/mystats').then(res => setSellerStats(res.data)).catch(console.error);
      } else if (activeTab === 'listings') {
        api.get('/products/mine').then(res => setMyListings(res.data)).catch(console.error);
      } else if (activeTab === 'payout') {
        api.get('/payout/upi').then(res => {
          setPayoutData({ upiId: res.data.upiId || '', upiName: res.data.upiName || '' });
          setWalletBalance(res.data.walletBalance || 0);
          setUser(prev => prev ? {
            ...prev,
            upiId: res.data.upiId || '',
            upiName: res.data.upiName || '',
            walletBalance: res.data.walletBalance || 0
          } : prev);
        }).catch(console.error);
        api.get('/payout/myrequests').then(res => setMyPayouts(res.data)).catch(console.error);
      } else if (activeTab === 'orders') {
        api.get('/orders/myorders').then(res => setMyOrders(res.data)).catch(console.error);
      } else if (activeTab === 'saved') {
        const favoriteIds = getFavoriteIds();
        const bookmarkIds = getBookmarkIds();
        const savedIds = Array.from(new Set([...favoriteIds, ...bookmarkIds]));

        if (savedIds.length === 0) {
          setSavedProducts([]);
        } else {
          api.get('/products').then(res => {
            const matched = res.data
              .filter(product => savedIds.includes(product._id))
              .map(product => ({
                ...product,
                isFavorite: favoriteIds.includes(product._id),
                isBookmarked: bookmarkIds.includes(product._id)
              }))
              .sort((a, b) => savedIds.indexOf(a._id) - savedIds.indexOf(b._id));
            setSavedProducts(matched);
          }).catch(console.error);
        }
      } else if (activeTab === 'my_sales') {
        api.get('/orders/mysales').then(res => setMySales(res.data)).catch(console.error);
      } else if (activeTab === 'interactions') {
        api.get('/products/interactions').then(res => setInteractions(res.data)).catch(console.error);
      }
    }
  }, [user, activeTab]);

  if (!user) {
    return <div className="p-8 text-center text-xl font-medium text-gray-600 dark:text-gray-400">Please log in to view the dashboard.</div>;
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      setPendingProducts(prev => prev.filter(p => p._id !== id));
      toast('Product approved!', 'success');
    } catch (err) {
      toast('Failed to approve product', 'error');
    }
  };

  const handleBlockUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      setUsersList(prev => prev.map(u => u._id === id ? res.data.user : u));
    } catch (err) {
      toast('Failed to update user status', 'error');
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUserId(userToEdit._id);
    setEditUserData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, location: userToEdit.location || '', phone: userToEdit.phone || '' });
  };

  const handleSaveUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}`, editUserData);
      setUsersList(prev => prev.map(u => u._id === id ? { ...u, ...editUserData } : u));
      setEditingUserId(null);
    } catch (err) {
      toast('Failed to update user', 'error');
    }
  };

  const handleSavePayoutDetails = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}`, editPayoutData);
      const updatedUser = res.data.user;
      setUserPayoutDetails(prev => prev.map(u => u._id === id ? { ...u, ...updatedUser } : u));
      setUsersList(prev => prev.map(u => u._id === id ? { ...u, ...updatedUser } : u));
      setEditingPayoutUserId(null);
      toast('Payout details updated!', 'success');
    } catch (err) {
      toast('Failed to update payout details', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setEditProductData({ title: product.title, description: product.description, price: product.price, category: product.category });
  };

  const handleManualGrant = async (e) => {
    e.preventDefault();

    if (!manualGrantForm.buyerId || !manualGrantForm.productId) {
      toast('Please select both a student and a course', 'error');
      return;
    }

    try {
      setManualGrantSubmitting(true);
      const res = await api.post('/admin/manual-grants', manualGrantForm);
      setSalesRecords(prev => [res.data.order, ...prev]);
      setManualGrantForm({ buyerId: '', productId: '', note: '' });
      toast('Course allocated manually. The student can access it now.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to allocate course', 'error');
    } finally {
      setManualGrantSubmitting(false);
    }
  };

  const handleSaveProduct = async (id) => {
    try {
      const res = await api.put(`/admin/products/${id}`, editProductData);
      setAllProducts(prev => prev.map(p => p._id === id ? { ...p, ...editProductData } : p));
      setPendingProducts(prev => prev.map(p => p._id === id ? { ...p, ...editProductData } : p));
      setEditingProductId(null);
    } catch (err) {
      toast('Failed to update product', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = '';
      let previewUrl = '';
      let thumbnailUrl = '';
      if (newProduct.type === 'digital' && uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        const uploadRes = await api.post('/upload/pdf', formData);
        fileUrl = uploadRes.data.fileUrl;
        previewUrl = uploadRes.data.previewUrl;
        thumbnailUrl = uploadRes.data.thumbnailUrl;
      }

      let imageUrls = [];
      if (uploadImage) {
        const formData = new FormData();
        formData.append('file', uploadImage);
        const uploadRes = await api.post('/upload', formData);
        imageUrls.push(uploadRes.data);
      }

      const productData = { ...newProduct, fileUrl, images: imageUrls, previewUrl, thumbnailUrl };
      await api.post('/products', productData);
      toast('Listing created! Waiting for admin approval.', 'success');
      setShowCreateForm(false);
      setNewProduct({ title: '', description: '', price: '', pricingType: 'paid', type: 'digital', category: '', location: '' });
      setUploadFile(null);
      setUploadImage(null);
      if (activeTab === 'listings') {
        const res = await api.get('/products/mine');
        setMyListings(res.data);
      } else {
        setActiveTab('listings');
      }
    } catch (err) {
      console.error('Create listing FAILED at step:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      toast(err.response?.data?.message || err.response?.data?.error || 'Failed to create listing', 'error');
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setMyListings(prev => prev.filter(l => l._id !== id));
      // Refresh seller stats to update listing count
      api.get('/orders/mystats').then(res => setSellerStats(res.data)).catch(console.error);
      toast('Listing deleted!', 'success');
    } catch (err) {
      toast('Failed to delete listing', 'error');
    } finally {
      setConfirmDeleteId(null);
      setIsAdminDelete(false);
    }
  };

  const handleAdminDeleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setAllProducts(prev => prev.map(p => p._id === id ? { ...p, isDeleted: true } : p));
      setPendingProducts(prev => prev.filter(p => p._id !== id));
      // Refresh stats to update Total Products count
      api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
      toast('Product marked as deleted!', 'success');
    } catch (err) {
      toast('Failed to delete product', 'error');
    } finally {
      setConfirmDeleteId(null);
      setIsAdminDelete(false);
    }
  };

  const handleRejectProduct = async (id, reason) => {
    try {
      await api.put(`/admin/products/${id}/reject`, { reason });
      setPendingProducts(prev => prev.filter(x => x._id !== id));
      setAllProducts(prev => prev.map(x => x._id === id ? { ...x, isApproved: false, rejectionReason: reason || 'No reason provided' } : x));
      toast('Listing rejected', 'success');
    } catch (err) {
      toast('Failed to reject', 'error');
    } finally {
      setPromptRejectId(null);
    }
  };

  const handleRejectPayout = async (id, reason) => {
    try {
      await api.put(`/admin/payouts/${id}`, { status: 'rejected', reason });
      setAdminPayouts(prev => prev.map(x => x._id === id ? { ...x, status: 'rejected', rejectionReason: reason } : x));
      toast('Payout rejected', 'success');
    } catch (err) {
      toast('Failed to reject payout', 'error');
    } finally {
      setPromptRejectId(null);
    }
  };

  const handleSaveReply = async (reason) => {
    if (!promptReplyData) return;
    const { type, productId, interactionId } = promptReplyData;
    const endpoint = type === 'review' 
      ? `/products/${productId}/reviews/${interactionId}/reply`
      : `/products/${productId}/comments/${interactionId}/reply`;

    try {
      await api.post(endpoint, { reply: reason });
      setInteractions(prev => prev.map(item => 
        item.interactionId === interactionId ? { ...item, reply: reason, replyAt: new Date() } : item
      ));
      toast('Reply sent successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send reply', 'error');
    } finally {
      setPromptReplyData(null);
    }
  };

  const periodData = stats[statsPeriod] || { orders: 0, earnings: 0, commission: 0 };
  const periodLabels = { today: 'Today', weekly: 'This Week', monthly: 'This Month', allTime: 'All Time' };
  const interactionProducts = Array.from(new Set(interactions.map((item) => item.productTitle).filter(Boolean)));
  const filteredInteractions = interactions.filter((item) => {
    const matchesType = interactionTypeFilter === 'all' || item.type === interactionTypeFilter;
    const matchesReply =
      interactionReplyFilter === 'all' ||
      (interactionReplyFilter === 'replied' && item.reply) ||
      (interactionReplyFilter === 'pending' && !item.reply);
    const matchesProduct =
      interactionProductFilter === 'all' || item.productTitle === interactionProductFilter;

    return matchesType && matchesReply && matchesProduct;
  });

  const renderAdminOverview = () => (
    <div className="space-y-6">
      {/* Period Toggle */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(periodLabels).map(([key, label]) => (
          <button key={key} onClick={() => setStatsPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statsPeriod === key ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 sm:p-6 rounded-2xl border border-orange-200 dark:border-orange-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-200 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400 rounded-xl"><Clock size={22} /></div>
            <div>
              <p className="text-xs font-bold text-orange-600/70 dark:text-orange-400/70 uppercase tracking-wider">Pending Listings</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-orange-700 dark:text-orange-300">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-200 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-xl"><ShoppingCart size={22} /></div>
            <div>
              <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider">{periodLabels[statsPeriod]} Orders</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-300">{periodData.orders}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-green-200 dark:bg-green-800/50 text-green-600 dark:text-green-400 rounded-xl"><TrendingUp size={22} /></div>
            <div>
              <p className="text-xs font-bold text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">{periodLabels[statsPeriod]} Earnings</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300">₹{Number(periodData.earnings).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 sm:p-6 rounded-2xl border border-purple-200 dark:border-purple-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-200 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400 rounded-xl"><DollarSign size={22} /></div>
            <div>
              <p className="text-xs font-bold text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">{periodLabels[statsPeriod]} Commission</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-300">₹{Number(periodData.commission).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl"><UserCheck size={22} /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl"><Package size={22} /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.products}</p>
            </div>
          </div>
        </div>

        {/* Payout Stats */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 sm:p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-yellow-200 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400 rounded-xl"><CreditCard size={22} /></div>
            <div>
              <p className="text-xs font-bold text-yellow-600/70 dark:text-yellow-400/70 uppercase tracking-wider">Pending Payout Requests</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-yellow-700 dark:text-yellow-300">{stats.payouts?.pendingCount ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 sm:p-6 rounded-2xl border border-red-200 dark:border-red-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-200 dark:bg-red-800/50 text-red-600 dark:text-red-400 rounded-xl"><Wallet size={22} /></div>
            <div>
              <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider">Pending Payout Amount</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-700 dark:text-red-300">₹{Number(stats.payouts?.pendingAmount ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-4 sm:p-6 rounded-2xl border border-teal-200 dark:border-teal-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-200 dark:bg-teal-800/50 text-teal-600 dark:text-teal-400 rounded-xl"><ArrowDownCircle size={22} /></div>
            <div>
              <p className="text-xs font-bold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-wider">Total Paid Out</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300">₹{Number(stats.payouts?.totalPaidOut ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminApprovals = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      {pendingProducts.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No products pending approval.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingProducts.map((p) => (
              <tr key={p._id}>
                {editingProductId === p._id ? (
                   <>
                    <td className="px-6 py-4"><input type="text" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editProductData.title} onChange={e => setEditProductData({...editProductData, title: e.target.value})} /></td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.seller?.name || 'Unknown'}</td>
                    <td className="px-6 py-4"><input type="text" className="w-24 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editProductData.category} onChange={e => setEditProductData({...editProductData, category: e.target.value})} /></td>
                    <td className="px-6 py-4">
                      {p.type === 'digital' && p.fileUrl ? (
                        <a href={`http://localhost:5000${p.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 hover:underline font-bold text-sm">View PDF</a>
                      ) : (
                        <span className="text-gray-400 text-sm italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-3">
                      <button onClick={() => handleSaveProduct(p._id)} className="text-green-600 hover:text-green-800 font-bold transition-colors">Save</button>
                      <button onClick={() => setEditingProductId(null)} className="text-gray-500 hover:text-gray-700 font-bold transition-colors">Cancel</button>
                    </td>
                   </>
                ) : (
                   <>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.title}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.seller?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.type === 'digital' && p.fileUrl ? (
                        <a href={`http://localhost:5000${p.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 hover:underline font-bold text-sm">View PDF</a>
                      ) : (
                        <span className="text-gray-400 text-sm italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex flex-col md:flex-row justify-end items-center gap-3">
                      <button onClick={() => handleEditProduct(p)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-bold transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleApprove(p._id)} className="flex items-center text-green-600 hover:text-green-900 dark:hover:text-green-400 font-bold transition-colors">
                        <CheckCircle className="w-5 h-5 mr-1.5"/> Approve
                      </button>
                      <button onClick={() => setPromptRejectId(p._id)} className="flex items-center text-red-600 hover:text-red-900 dark:hover:text-red-400 font-bold transition-colors">
                        <XCircle className="w-5 h-5 mr-1.5"/> Reject
                      </button>
                    </td>
                   </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  const renderAdminUsers = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Earnings</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Active Posts</th>
             <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
             <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
           {usersList.map((u) => (
            <tr key={u._id}>
              {editingUserId === u._id ? (
                <>
                  <td className="px-6 py-4"><input type="text" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} /></td>
                  <td className="px-6 py-4"><input type="email" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editUserData.email} onChange={e => setEditUserData({...editUserData, email: e.target.value})} /></td>
                  <td className="px-6 py-4"><input type="tel" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editUserData.phone} onChange={e => setEditUserData({...editUserData, phone: e.target.value})} /></td>
                  <td className="px-6 py-4">
                    <select className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value})}>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{Number(u.walletBalance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{u.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{u.activePosts ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(u.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-3">
                    <button onClick={() => handleSaveUser(u._id)} className="text-green-600 hover:text-green-800 font-bold transition-colors">Save</button>
                    <button onClick={() => setEditingUserId(null)} className="text-gray-500 hover:text-gray-700 font-bold transition-colors">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{u.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{u.role}</td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{Number(u.walletBalance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {u.isBlocked ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Blocked</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{u.activePosts ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(u.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 text-right flex flex-col md:flex-row justify-end items-center gap-3">
                    <button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-bold transition-colors">
                      Edit
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleBlockUser(u._id)} className={`font-bold transition-colors ${u.isBlocked ? 'text-green-600 hover:text-green-900 dark:hover:text-green-400' : 'text-red-600 hover:text-red-900 dark:hover:text-red-400'}`}>
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  const renderAdminSales = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (₹)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {salesRecords.map((s) => (
            <tr key={s._id}>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{new Date(s.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{s.product?.title || 'Unknown Product'}</td>
              <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{s.amount}</td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{s.buyer?.email}</td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{s.product?.seller?.email || 'N/A'}</td>
              <td className="px-6 py-4">
                {s.grantType === 'manual' ? (
                  <div>
                    <span className="px-2 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Manual Access</span>
                    {s.manualGrantNote && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px] truncate" title={s.manualGrantNote}>{s.manualGrantNote}</p>}
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Payment</span>
                )}
              </td>
              <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  const renderAdminManualGrants = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Course Allocation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Use this when a student has paid but the course was not assigned because of a technical issue.
          </p>
        </div>

        <form onSubmit={handleManualGrant} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Student</label>
            <select
              value={manualGrantForm.buyerId}
              onChange={(e) => setManualGrantForm({ ...manualGrantForm, buyerId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="">Select a student</option>
              {manualGrantOptions.students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Digital Course</label>
            <select
              value={manualGrantForm.productId}
              onChange={(e) => setManualGrantForm({ ...manualGrantForm, productId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="">Select a digital course</option>
              {manualGrantOptions.products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.title} - {product.category} - ₹{product.price}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Internal Note (Optional)</label>
            <textarea
              rows="3"
              value={manualGrantForm.note}
              onChange={(e) => setManualGrantForm({ ...manualGrantForm, note: e.target.value })}
              placeholder="Example: Payment confirmed but auto-allocation failed."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={manualGrantSubmitting}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm inline-flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {manualGrantSubmitting ? 'Allocating...' : 'Allocate Course'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/40 p-5">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          Manual allocation restores course access without counting the revenue again, so you can fix delivery issues safely.
        </p>
      </div>
    </div>
  );



  const renderAdminAllPosts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {allProducts.map((p) => (
            <tr key={p._id}>
              {editingProductId === p._id ? (
                 <>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4"><input type="text" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editProductData.title} onChange={e => setEditProductData({...editProductData, title: e.target.value})} /></td>
                  <td className="px-6 py-4"><input type="text" className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editProductData.category} onChange={e => setEditProductData({...editProductData, category: e.target.value})} /></td>
                  <td className="px-6 py-4"><input type="number" className="w-24 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" value={editProductData.price} onChange={e => setEditProductData({...editProductData, price: parseInt(e.target.value)})} /></td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.seller?.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium text-xs">{p.seller?.email || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {p.isDeleted ? <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Deleted</span> : p.type === 'digital' && p.fileUrl ? (
                      <a href={`http://localhost:5000${p.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 hover:underline font-bold text-sm">View PDF</a>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-3">
                    <button onClick={() => handleSaveProduct(p._id)} className="text-green-600 hover:text-green-800 font-bold transition-colors">Save</button>
                    <button onClick={() => setEditingProductId(null)} className="text-gray-500 hover:text-gray-700 font-bold transition-colors">Cancel</button>
                  </td>
                 </>
              ) : (
                 <>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{p.title}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{p.price}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.seller?.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium text-xs">{p.seller?.email || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {p.isDeleted ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Deleted</span>
                    ) : p.isApproved ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Approved</span>
                    ) : p.rejectionReason ? (
                      <div>
                        <span className="px-2 py-1 text-xs font-bold rounded-md bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Rejected</span>
                        <p className="text-red-500 text-xs mt-1 font-medium truncate max-w-[160px]" title={p.rejectionReason}>❌ {p.rejectionReason}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-3">
                    <button onClick={() => handleEditProduct(p)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-bold transition-colors">
                      Edit
                    </button>
                    {!p.isDeleted && (
                      <button onClick={() => { setConfirmDeleteId(p._id); setIsAdminDelete(true); }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold transition-colors">
                        Delete
                      </button>
                    )}
                  </td>
                 </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  const renderSellerOverview = () => {
    const s = sellerStats || { totalListings: 0, approvedListings: 0, pendingListings: 0, allTime: {sales:0, earned:0}, today: {sales:0, earned:0}, weekly: {sales:0, earned:0}, monthly: {sales:0, earned:0}, recentSales: [] };
    const periodStats = s[statsPeriod] || { sales: 0, earned: 0 };
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 mb-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl inline-flex shadow-sm border border-gray-100 dark:border-gray-700">
          {['today', 'weekly', 'monthly', 'allTime'].map((p) => (
            <button
              key={p}
              onClick={() => setStatsPeriod(p)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${statsPeriod === p ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'}`}
            >
              {p === 'allTime' ? 'Life time' : p === 'weekly' ? 'This Week' : p === 'monthly' ? 'This Month' : p}
            </button>
          ))}
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800/40">
            <p className="text-xs font-bold text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">Wallet Balance</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300 mt-1">₹{Number(user.walletBalance || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-800/40">
            <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider">Earned</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">₹{Number(periodStats.earned).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 sm:p-6 rounded-2xl border border-purple-200 dark:border-purple-800/40">
            <p className="text-xs font-bold text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">Sales</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">{periodStats.sales}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Listings</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{s.totalListings}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">{s.approvedListings}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">{s.pendingListings}</p>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Sales</h3>
            <button 
              onClick={() => { setActiveTab('listings'); setShowCreateForm(true); }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors inline-flex items-center shadow-sm"
            >
              <PlusCircle className="mr-1.5" size={16} /> New Listing
            </button>
          </div>
          {s.recentSales.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
              <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No sales yet. Create your first listing to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Your Share</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {s.recentSales.map(sale => (
                    <tr key={sale._id}>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{sale.productTitle}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{sale.buyerName}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">₹{sale.amount}</td>
                      <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{Number(sale.yourShare).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(sale.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMyOrders = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      {myOrders.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">
          <ShoppingCart className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p>You haven't purchased anything yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action / Note</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {myOrders.map(o => (
                <tr key={o._id}>
                  <td className="px-6 py-4">
                    {o.product?._id ? (
                      <Link to={`/product/${o.product._id}#reviews`} className="font-bold text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400">
                        {o.product.title}
                      </Link>
                    ) : (
                      <p className="font-bold text-gray-900 dark:text-white">Deleted Product</p>
                    )}
                    <p className="text-xs text-gray-500 uppercase mt-1 tracking-wider">{o.product?.type || 'Digital'}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{o.amount}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {o.product?.seller ? (
                      <div>
                        {o.product.seller.name} <br/>
                        <a href={`mailto:${o.product.seller.email}`} className="text-primary-500 hover:underline">{o.product.seller.email}</a>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {o.product?.type === 'digital' && o.product?.fileUrl ? (
                      <a href={`/view/${o._id}`} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center shadow-sm">
                        👁️ View Notes
                      </a>
                    ) : o.product?.type === 'physical' ? (
                      <span className="text-gray-500 text-xs italic">Contact Seller directly</span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full inline-flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1"/> {o.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSavedCourses = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 flex items-center sm:text-2xl">
          <Bookmark className="w-6 h-6 mr-2 text-primary-500" /> Saved Courses
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{savedProducts.length} saved</p>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 py-10 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Bookmark className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="font-medium">No saved courses yet.</p>
          <p className="text-sm mt-2">Favorite or bookmark a course from the homepage or course page to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savedProducts.map(product => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-52 sm:h-56 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]?.startsWith('/') ? `http://localhost:5000${product.images[0]}` : product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-contain p-2 sm:object-cover sm:p-0"
                  />
                ) : product.thumbnailUrl ? (
                  <PdfThumbnail
                    src={`http://localhost:5000${product.thumbnailUrl}`}
                    title={product.title}
                    className="pointer-events-none"
                    pageClassName="scale-100 origin-top sm:scale-[1.08]"
                  />
                ) : (
                  <Book className="w-12 h-12 text-primary-400" />
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  {product.isFavorite && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-600 px-2.5 py-1 text-xs font-bold border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      Favorite
                    </span>
                  )}
                  {product.isBookmarked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-600 px-2.5 py-1 text-xs font-bold border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-900/40">
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      Bookmark
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-500 mb-2">{product.category}</p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{product.title}</h4>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-gray-900 dark:text-white">₹{product.price}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{product.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  
  const renderAdminPayoutRequests = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-primary-500" />Payout Requests</h3>
      </div>
      {adminPayouts.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No payout requests yet.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UPI ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UPI Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {adminPayouts.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{p.user?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{p.user?.email || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{p.upiId}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{p.upiName}</td>
                <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${p.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : p.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  {p.status === 'pending' && (
                    <>
                      <button onClick={async () => { await api.put(`/admin/payouts/${p._id}`, { status: 'completed' }); setAdminPayouts(prev => prev.map(x => x._id === p._id ? { ...x, status: 'completed' } : x)); toast('Payout approved!', 'success'); }} className="text-green-600 hover:text-green-800 font-bold text-sm">Approve</button>
                      <button onClick={() => setPromptRejectId(p._id)} className="text-red-600 hover:text-red-800 font-bold text-sm">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  const renderAdminPayoutDetails = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 flex items-center"><Wallet className="w-5 h-5 mr-2 text-primary-500" />User Payout Details</h3>
      </div>
      {userPayoutDetails.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No users have added UPI details yet.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UPI ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UPI Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {userPayoutDetails.map(u => (
              editingPayoutUserId === u._id ? (
                <tr key={u._id} className="bg-gray-50 dark:bg-gray-700/50">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium truncate max-w-[150px]">{u.email}</td>
                  <td className="px-6 py-4">
                    <input type="text" value={editPayoutData.upiId} onChange={e => setEditPayoutData({...editPayoutData, upiId: e.target.value})} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="UPI ID" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="text" value={editPayoutData.upiName} onChange={e => setEditPayoutData({...editPayoutData, upiName: e.target.value})} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Name" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={editPayoutData.walletBalance} onChange={e => setEditPayoutData({...editPayoutData, walletBalance: Number(e.target.value)})} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-24 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleSavePayoutDetails(u._id)} className="text-white bg-primary-500 hover:bg-primary-600 font-bold text-xs px-3 py-1.5 rounded-lg mr-2 transition-colors">Save</button>
                    <button onClick={() => setEditingPayoutUserId(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-xs transition-colors">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={u._id}>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{u.upiId}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{u.upiName}</td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{Number(u.walletBalance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => {
                        setEditingPayoutUserId(u._id);
                        setEditPayoutData({ upiId: u.upiId || '', upiName: u.upiName || '', walletBalance: u.walletBalance || 0 });
                      }} className="text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 font-bold text-sm transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  const renderSellerPayout = () => (
    <div className="space-y-6">
      {/* UPI Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-6 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-primary-500" />Payment Method (UPI)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
            <input type="text" placeholder="yourname@upi" value={payoutData.upiId} onChange={e => setPayoutData({...payoutData, upiId: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
            <input type="text" placeholder="Your Name" value={payoutData.upiName} onChange={e => setPayoutData({...payoutData, upiName: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
        <button onClick={async () => {
          try {
            const res = await api.put('/payout/upi', payoutData);
            setPayoutData({
              upiId: res.data.upiId || '',
              upiName: res.data.upiName || ''
            });
            await refreshUser();
            toast('UPI details saved!', 'success');
          } catch (err) {
            toast(err.response?.data?.message || 'Failed to save', 'error');
          }
        }} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
          Save UPI Details
        </button>
      </div>

      {/* Withdraw Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center"><ArrowDownCircle className="w-5 h-5 mr-2 text-green-500" />Withdraw Funds</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Available Balance</p>
          <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">₹{Number(walletBalance).toFixed(2)}</p>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min((walletBalance / 100) * 100, 100)}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">{walletBalance >= 100 ? '✅ You can withdraw!' : `₹${(100 - walletBalance).toFixed(2)} more needed to withdraw (min ₹100)`}</p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
            <input type="number" placeholder="Enter amount" min="100" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button disabled={walletBalance < 100 || !payoutAmount || Number(payoutAmount) < 100} onClick={async () => {
            try {
              const res = await api.post('/payout/request', { amount: Number(payoutAmount) });
              toast('Payout request submitted!', 'success');
              setWalletBalance(res.data.newBalance);
              setUser(prev => prev ? { ...prev, walletBalance: res.data.newBalance } : prev);
              await refreshUser();
              setPayoutAmount('');
              api.get('/payout/myrequests').then(r => setMyPayouts(r.data));
            } catch (err) {
              toast(err.response?.data?.message || 'Failed to request payout', 'error');
            }
          }} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
            Withdraw
          </button>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold dark:text-white text-gray-900">Payout History</h3>
        </div>
        {myPayouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">No payout requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {myPayouts.map(p => (
                <tr key={p._id}>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">₹{p.amount}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{p.upiId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${p.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : p.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {p.status}
                    </span>
                    {p.status === 'rejected' && p.rejectionReason && (
                      <p className="text-red-500 text-xs mt-1 font-medium">❌ {p.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderSellerListings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold dark:text-white text-gray-900 sm:text-2xl">Your Listings</h3>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors inline-flex items-center justify-center text-sm shadow-sm hover:shadow-md">
          {showCreateForm ? <><XCircle className="mr-2 w-5 h-5" /> Cancel</> : <><PlusCircle className="mr-2 w-5 h-5" /> Add New</>}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="mb-10 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Create a New Listing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" placeholder="Organic Chemistry Notes" required value={newProduct.title} onChange={e=>setNewProduct({...newProduct, title: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Class / Course</label>
              <select required value={newProduct.selectedClass || ''} onChange={e => {
                setNewProduct({...newProduct, selectedClass: e.target.value, selectedSemester: '', selectedSubject: '', category: ''});
              }} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                <option value="">Select Class / Course</option>
                <optgroup label="School">
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </optgroup>
                <optgroup label="College / University">
                  <option value="B.Tech">B.Tech / Engineering</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Com">B.Com</option>
                  <option value="M.Com">M.Com</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="BA">BA</option>
                  <option value="MA">MA</option>
                </optgroup>
                <optgroup label="Competitive Exams">
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SSC">SSC</option>
                  <option value="GATE">GATE</option>
                  <option value="CAT">CAT</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            {/* Semester dropdown — only for college courses */}
            {['B.Tech','BCA','MCA','BBA','MBA','B.Com','M.Com','B.Sc','M.Sc','BA','MA'].includes(newProduct.selectedClass) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                <select value={newProduct.selectedSemester || ''} onChange={e => {
                  setNewProduct({...newProduct, selectedSemester: e.target.value, selectedSubject: '', category: ''});
                }} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={`Sem ${s}`}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select value={newProduct.selectedSubject || ''} onChange={e => {
                const subject = e.target.value;
                const cls = newProduct.selectedClass;
                const isCollege = ['B.Tech','BCA','MCA','BBA','MBA','B.Com','M.Com','B.Sc','M.Sc','BA','MA'].includes(cls);
                const category = isCollege ? `${cls} - ${newProduct.selectedSemester} - ${subject}` : `${cls} - ${subject}`;
                setNewProduct({...newProduct, selectedSubject: subject, category});
              }} disabled={!newProduct.selectedClass || (['B.Tech','BCA','MCA','BBA','MBA','B.Com','M.Com','B.Sc','M.Sc','BA','MA'].includes(newProduct.selectedClass) && !newProduct.selectedSemester)} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">{!newProduct.selectedClass ? 'Select class first' : (['B.Tech','BCA','MCA','BBA','MBA','B.Com','M.Com','B.Sc','M.Sc','BA','MA'].includes(newProduct.selectedClass) && !newProduct.selectedSemester) ? 'Select semester first' : 'Select Subject'}</option>
                {newProduct.selectedClass === 'Class 9' && <>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Computer">Computer</option>
                </>}
                {newProduct.selectedClass === 'Class 10' && <>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Computer">Computer</option>
                </>}
                {newProduct.selectedClass === 'Class 11' && <>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Economics">Economics</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="History">History</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                </>}
                {newProduct.selectedClass === 'Class 12' && <>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Economics">Economics</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="History">History</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                </>}
                {['JEE','NEET'].includes(newProduct.selectedClass) && <>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </>}
                {['B.Tech','BCA','MCA','BBA','MBA','B.Com','M.Com','B.Sc','M.Sc','BA','MA'].includes(newProduct.selectedClass) && newProduct.selectedSemester && (
                  (semesterSubjects[newProduct.selectedClass]?.[newProduct.selectedSemester] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))
                )}
                {newProduct.selectedClass === 'GATE' && <>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Theory of Computation">Theory of Computation</option>
                  <option value="Digital Logic">Digital Logic</option>
                  <option value="Computer Architecture">Computer Architecture</option>
                  <option value="Engineering Mathematics">Engineering Mathematics</option>
                  <option value="Compiler Design">Compiler Design</option>
                </>}
                {newProduct.selectedClass === 'CAT' && <>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                  <option value="Data Interpretation">Data Interpretation</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                </>}
                {['UPSC','SSC'].includes(newProduct.selectedClass) && <>
                  <option value="General Studies">General Studies</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Polity">Polity</option>
                  <option value="Economics">Economics</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                </>}
                {newProduct.selectedClass === 'Other' && <>
                  <option value="General">General</option>
                  <option value="Other">Other</option>
                </>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Listing Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, pricingType: 'free', price: 0 })}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${newProduct.pricingType === 'free' ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, pricingType: 'paid', price: newProduct.price || '' })}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${newProduct.pricingType === 'paid' ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  Paid
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price (Rs.)</label>
              <input type="number" min="0" placeholder={newProduct.pricingType === 'free' ? '0' : '299'} required={newProduct.pricingType === 'paid'} disabled={newProduct.pricingType === 'free'} value={newProduct.pricingType === 'free' ? 0 : newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location (City / Area) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input type="text" placeholder="e.g. Mumbai, Pune" value={newProduct.location} onChange={e=>setNewProduct({...newProduct, location: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Type</label>
              <input type="text" value="Digital (PDF)" disabled className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Upload PDF Document</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setUploadFile(e.target.files[0])} required className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Upload Thumbnail Image (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setUploadImage(e.target.files[0])} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium" />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800/40">✅ A 5-page demo preview will be auto-generated from your uploaded PDF.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea placeholder="Describe the condition, contents, and value..." required value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 mb-4 font-medium">* Note: Submitting a listing places it into a pending state. An Administrator will review it before it appears publicly on NotesKart.</p>
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800">Submit Listing for Review</button>
        </form>
      )}

      {myListings.length === 0 ? (
         <div className="text-gray-500 dark:text-gray-400 py-8 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Package className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="font-medium">You haven't created any listings yet.</p>
         </div>
      ) : (
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead className="bg-gray-50 dark:bg-gray-900/50">
               <tr>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Subject</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {myListings.map(l => (
                 <tr key={l._id}>                    {editListingId === l._id ? (
                      <>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            value={editListingData.title} 
                            onChange={(e) => setEditListingData({...editListingData, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {l.type}
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            value={editListingData.price} 
                            onChange={(e) => setEditListingData({...editListingData, price: e.target.value})}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {l.type === 'digital' ? (
                            <div className="flex flex-col gap-2">
                              {l.fileUrl && <a href={`http://localhost:5000${l.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 hover:underline font-bold text-xs">📄 Current PDF</a>}
                              <label className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800">
                                📎 Replace PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  try {
                                    const uploadRes = await api.post('/upload/pdf', formData);
                                    const payload = {
                                      ...editListingData,
                                      fileUrl: uploadRes.data.fileUrl,
                                      previewUrl: uploadRes.data.previewUrl,
                                      thumbnailUrl: uploadRes.data.thumbnailUrl
                                    };
                                    await api.put(`/products/${l._id}`, payload);
                                    setMyListings(myListings.map(item => item._id === l._id ? {
                                      ...item,
                                      ...payload,
                                      isApproved: false,
                                      rejectionReason: ''
                                    } : item));
                                    toast('PDF replaced! Sent for re-approval.', 'success');
                                  } catch (err) {
                                    toast('Failed to replace PDF', 'error');
                                  }
                                }} />
                              </label>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                            Re-approval Required
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                                    <button 
                            onClick={async () => {
                              // If nothing changed, just cancel edit mode
                              if (editListingData.title === l.title && editListingData.price === l.price) {
                                setEditListingId(null);
                                return;
                              }
                              try {
                                await api.put(`/products/${l._id}`, editListingData);
                                setMyListings(myListings.map(item => item._id === l._id ? { ...item, ...editListingData, isApproved: false } : item));
                                setEditListingId(null);
                                toast('Listing updated and sent for re-approval!', 'success');
                              } catch (err) {
                                toast('Failed to update listing', 'error');
                              }
                            }}
                            className="text-primary-600 hover:text-primary-700 font-bold text-sm"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditListingId(null)}
                            className="text-gray-500 hover:text-gray-700 font-bold text-sm"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/product/${l._id}`}
                            className="inline-block font-bold text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                          >
                            {l.title}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{l.category}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 tracking-wide uppercase">
                             {l.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 dark:text-gray-300 font-bold text-lg">₹{l.price}</td>
                        <td className="px-6 py-4">
                          {l.type === 'digital' && l.fileUrl ? (
                            <a href={`http://localhost:5000${l.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 hover:underline font-bold text-sm">📄 View PDF</a>
                          ) : l.type === 'physical' && l.images && l.images.length > 0 ? (
                            <span className="text-gray-500 text-sm font-medium">📸 {l.images.length} image(s)</span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {l.isApproved ? (
                              <span className="text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full inline-flex items-center">
                                <CheckCircle className="w-3.5 h-3.5 mr-1"/> Approved
                              </span>
                           ) : l.rejectionReason ? (
                             <>
                               <span className="text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full inline-flex items-center">
                                 <XCircle className="w-3.5 h-3.5 mr-1"/> Rejected
                               </span>
                               <p className="text-red-500 text-xs mt-1 font-medium">❌ {l.rejectionReason}</p>
                             </>
                           ) : (
                             <span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full inline-flex items-center">
                               Pending
                             </span>
                           )}
                         </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setEditListingId(l._id);
                              setEditListingData({ title: l.title, price: l.price, category: l.category });
                            }}
                            className="text-primary-600 hover:text-primary-700 font-bold text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => { setConfirmDeleteId(l._id); setIsAdminDelete(false); }} 
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-bold transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}</tr>
               ))}
             </tbody>
           </table>
         </div>
      )}
    </div>
  );

  const renderSellerSales = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold dark:text-white text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-500" /> Track Sales
        </h3>
      </div>
      {mySales.length === 0 ? (
         <div className="text-gray-500 dark:text-gray-400 py-8 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <TrendingUp className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="font-medium">You haven't made any sales yet.</p>
         </div>
      ) : (
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead className="bg-gray-50 dark:bg-gray-900/50">
               <tr>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Paid</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Your Earnings</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {mySales.map(order => (
                 <tr key={order._id}>
                   <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                   <td className="px-6 py-4 font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{order.product?.title || 'Deleted Product'}</td>
                   <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-200">{order.buyer?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.buyer?.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{order.buyer?.phone || ''}</p>
                   </td>
                   <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">₹{order.amount || order.product?.price || 0}</td>
                   <td className="px-6 py-4 text-green-600 dark:text-green-400 font-extrabold text-lg">₹{Math.round((order.amount || order.product?.price || 0) * 0.8)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      )}
    </div>
  );

  const renderSellerInteractions = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left p-6 md:p-8">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
        <h3 className="text-2xl font-bold dark:text-white text-gray-900 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-primary-500" /> Reviews & Comments
        </h3>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'review', label: 'Reviews' },
              { id: 'comment', label: 'Comments' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setInteractionTypeFilter(filter.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  interactionTypeFilter === filter.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={interactionReplyFilter}
              onChange={(e) => setInteractionReplyFilter(e.target.value)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">All Replies</option>
              <option value="pending">Pending Reply</option>
              <option value="replied">Replied</option>
            </select>
            <select
              value={interactionProductFilter}
              onChange={(e) => setInteractionProductFilter(e.target.value)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">All Posts</option>
              {interactionProducts.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {interactions.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 py-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium">No reviews or comments yet.</p>
          <p className="text-sm mt-1">When students interact with your products, they will appear here.</p>
        </div>
      ) : filteredInteractions.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 py-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium">No items match this filter.</p>
          <p className="text-sm mt-1">Try switching the type, reply status, or post filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInteractions.map((item) => (
            <div key={item.interactionId} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {item.userName?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {item.userName}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${item.type === 'review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'}`}>
                        {item.type}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium font-serif italic">
                      on <span className="font-bold font-sans not-italic text-gray-700 dark:text-gray-300">{item.productTitle}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                    {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {item.type === 'review' && (
                    <div className="flex items-center mt-1 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < item.rating ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-13 pl-1 border-l-2 border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{item.content}</p>
              </div>

              {item.reply ? (
                <div className="ml-13 mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                  <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1 flex justify-between">
                    <span>Your Reply</span>
                    <span className="text-gray-400 dark:text-gray-500 font-bold normal-case">{item.replyAt ? new Date(item.replyAt).toLocaleDateString() : ''}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{item.reply}"</p>
                </div>
              ) : (
                <div className="ml-13 mt-3">
                  <button 
                    onClick={() => setPromptReplyData({
                      type: item.type,
                      productId: item.productId,
                      interactionId: item.interactionId
                    })}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare size={14} /> Reply to {item.type}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10 text-left">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 font-medium">Welcome back, {user.name} ({user.role})</p>
      </div>

      <div className="-mx-4 mb-6 flex gap-4 overflow-x-auto border-b border-gray-200 px-4 dark:border-gray-700 scrollbar-hide sm:mx-0 sm:mb-8 sm:gap-5 sm:px-0">
        {user.role === 'admin' ? (
          <>
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'approvals', label: 'Approvals', icon: CheckCircle },
              { id: 'users', label: 'Users', icon: UserCheck },
              { id: 'all_posts', label: 'All Posts', icon: Package },
              { id: 'payout_requests', label: 'Payout Requests', icon: CreditCard },
              { id: 'payout_details', label: 'Payout Details', icon: Wallet },
              { id: 'sales', label: 'Sales History', icon: ShoppingCart },
              { id: 'manual_grants', label: 'Manual Grants', icon: PlusCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </>
        ) : (
          <>
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'listings', label: 'My Listings', icon: Package },
              { id: 'payout', label: 'Payout', icon: Wallet },
              { id: 'orders', label: 'My Orders', icon: ShoppingCart },
              { id: 'saved', label: 'Saved', icon: Bookmark },
              { id: 'my_sales', label: 'My Sales', icon: TrendingUp },
              { id: 'interactions', label: 'Reviews & Comments', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        {user.role === 'admin' ? (
          <>
            {activeTab === 'overview' && renderAdminOverview()}
            {activeTab === 'approvals' && renderAdminApprovals()}
            {activeTab === 'users' && renderAdminUsers()}
            {activeTab === 'all_posts' && renderAdminAllPosts()}
            {activeTab === 'payout_requests' && renderAdminPayoutRequests()}
            {activeTab === 'payout_details' && renderAdminPayoutDetails()}
            {activeTab === 'sales' && renderAdminSales()}
            {activeTab === 'manual_grants' && renderAdminManualGrants()}
          </>
        ) : (
          <>
            {activeTab === 'overview' && renderSellerOverview()}
            {activeTab === 'listings' && renderSellerListings()}
            {activeTab === 'payout' && renderSellerPayout()}
            {activeTab === 'orders' && renderMyOrders()}
            {activeTab === 'saved' && renderSavedCourses()}
            {activeTab === 'my_sales' && renderSellerSales()}
            {activeTab === 'interactions' && renderSellerInteractions()}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => { setConfirmDeleteId(null); setIsAdminDelete(false); }}
        onConfirm={() => isAdminDelete ? handleAdminDeleteProduct(confirmDeleteId) : handleDeleteListing(confirmDeleteId)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        type="danger"
      />

      <PromptModal
        isOpen={promptRejectId !== null}
        onClose={() => setPromptRejectId(null)}
        onConfirm={(reason) => {
          if (activeTab === 'approvals' || activeTab === 'all_posts') {
            handleRejectProduct(promptRejectId, reason);
          } else if (activeTab === 'payout_requests') {
            handleRejectPayout(promptRejectId, reason);
          }
        }}
        title="Rejection Reason"
        message="Please provide a reason for rejecting this request."
        placeholder="Enter reason here..."
      />

      <PromptModal
        isOpen={promptReplyData !== null}
        onClose={() => setPromptReplyData(null)}
        onConfirm={handleSaveReply}
        title={`Reply to ${promptReplyData?.type}`}
        message={`Write your response to the student's ${promptReplyData?.type}. They will be able to see this.`}
        placeholder="Type your reply here..."
      />
    </div>
  );
};

export default Dashboard;

