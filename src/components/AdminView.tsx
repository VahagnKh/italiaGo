import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Image as ImageIcon,
  Star,
  MapPin,
  Euro,
  Tag,
  LayoutDashboard,
  Hotel,
  Utensils,
  Compass,
  Car,
  Sparkles,
  Calendar,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Maximize,
  MessageSquare,
  Menu,
  Globe,
  Layers,
  FileText,
  Palette,
  Terminal,
  HelpCircle,
  LogOut,
  Shield,
  TrendingUp,
  UserPlus,
  Eye,
  Activity,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Send,
  Filter,
  RefreshCw,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Listing {
  id: string;
  type: string;
  name: string;
  location: string;
  price: number;
  price_level: string;
  image: string;
  stars: number;
  description: string;
  category: string;
  [key: string]: any;
}

export default function AdminView({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { fetchWithAuth, token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [editingListing, setEditingListing] = useState<Partial<Listing> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard-v1');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard', 'management', 'logs']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'ItaliaGo',
    adminEmail: 'admin@italiago.com',
    maintenanceMode: false,
    userRegistration: true,
    stripePublicKey: 'pk_test_************************',
    firebaseProjectId: 'italiago-prod'
  });
  const [securityStats, setSecurityStats] = useState({
    failedLogins: 12,
    activeSessions: 45,
    blockedIPs: 3,
    lastSecurityScan: new Date().toISOString()
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [reconnectKey, setReconnectKey] = useState(0);

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
    
    // Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'auth', role: 'admin' }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setNotifications(prev => [data.notification, ...prev].slice(0, 50));
      } else if (data.type === 'admin_chat') {
        setAdminMessages(prev => [...prev, data.message].slice(-50));
      }
    };

    socket.onclose = () => {
      console.log('Admin WebSocket disconnected');
      setTimeout(() => setReconnectKey(prev => prev + 1), 5000);
    };

    return () => socket.close();
  }, [reconnectKey, token]);

  useEffect(() => {
    if (activeMenu === 'chat') {
      scrollToBottom();
    }
  }, [adminMessages, activeMenu]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchListings(),
      fetchUsers(),
      fetchAllBookings(),
      fetchActivityLogs(),
      fetchAdminLogs(),
      fetchNotifications(),
      fetchAnalytics(),
      fetchMessages()
    ]);
    setIsLoading(false);
  };

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        setAllBookings(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/logs/activity');
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAdminLogs = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/logs/admin');
      if (res.ok) {
        const data = await res.json();
        setAdminLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/analytics/activity');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setAdminMessages(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await fetchWithAuth('/api/admin/messages', {
        method: 'POST',
        body: JSON.stringify({ message: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveSettings = async () => {
    // In a real app, this would be a POST to /api/admin/settings
    alert('Settings saved successfully (Simulated)');
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleToggleUserStatus = async (userId: string, currentDisabled: boolean) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ disabled: !currentDisabled })
      });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm)
      });
      if (res.ok) {
        setIsAddingUser(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (e) { console.error(e); }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(m => m !== menuId) : [...prev, menuId]
    );
  };

  const handleSaveListing = async () => {
    if (!editingListing) return;
    try {
      const res = await fetchWithAuth('/api/admin/listings', {
        method: 'POST',
        body: JSON.stringify(editingListing)
      });
      if (res.ok) {
        fetchListings();
        setEditingListing(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteListing = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetchWithAuth(`/api/admin/listings/${id}?type=${type}`, { 
        method: 'DELETE'
      });
      if (res.ok) fetchListings();
    } catch (e) { console.error(e); }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      children: [
        { id: 'dashboard-v1', label: 'Dashboard v1' },
        { id: 'dashboard-v2', label: 'Dashboard v2' },
        { id: 'dashboard-v3', label: 'Dashboard v3' },
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: Shield,
      children: [
        { id: 'listings', label: 'Listings', icon: Layers },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'bookings', label: 'Bookings', icon: ShoppingBag },
      ]
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'logs',
      label: 'Logs',
      icon: FileText,
      children: [
        { id: 'activity-logs', label: 'Activity Logs' },
        { id: 'admin-logs', label: 'Admin Logs' },
      ]
    },
    { id: 'chat', label: 'Admin Chat', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Total Bookings', value: allBookings.length, color: 'bg-blue-500', icon: ShoppingBag, trend: '+12%', trendUp: true },
    { label: 'Active Users', value: users.filter(u => !u.disabled).length, color: 'bg-emerald-500', icon: BarChart3, trend: '+2%', trendUp: true },
    { label: 'Total Users', value: users.length, color: 'bg-amber-500', icon: UserPlus, trend: '+5%', trendUp: true },
    { label: 'Security Alerts', value: notifications.filter(n => n.type === 'security').length, color: 'bg-rose-500', icon: AlertTriangle, trend: '-18%', trendUp: false },
  ];

  const filteredUsers = users.filter(u => {
    const name = u.name || '';
    const email = u.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || u.role === userFilter || (userFilter === 'disabled' && u.disabled);
    return matchesSearch && matchesFilter;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#f4f6f9] z-[100] flex overflow-hidden font-sans text-[#343a40]"
    >
      {/* Sidebar */}
      <aside className={`bg-[#1a1c23] text-[#94a3b8] transition-all duration-300 flex flex-col z-20 border-r border-white/5 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-gold to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-gold/20">I</div>
          {isSidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <span className="text-lg font-display italic text-white block leading-none">ItaliaGo</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Admin Panel</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
          <div className="px-6 mb-8 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-0.5 shrink-0 shadow-inner">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem('userEmail') || 'Admin'}`} alt="User" className="w-full h-full rounded-[10px] object-cover" />
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <span className="text-sm font-medium text-white block truncate">Alexander Pierce</span>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                </span>
              </div>
            )}
          </div>

          <nav className="px-3 space-y-1.5">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => item.children ? toggleMenu(item.id) : setActiveMenu(item.id)}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    activeMenu.startsWith(item.id) 
                      ? 'bg-gold text-white shadow-lg shadow-gold/20' 
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={18} className={`shrink-0 ${activeMenu.startsWith(item.id) ? 'text-white' : 'text-slate-400 group-hover:text-gold transition-colors'}`} />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left font-medium">{item.label}</span>
                      {item.children && (
                        <motion.div
                          animate={{ rotate: expandedMenus.includes(item.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={14} className="opacity-40" />
                        </motion.div>
                      )}
                    </>
                  )}
                </button>
                {isSidebarOpen && item.children && expandedMenus.includes(item.id) && (
                  <div className="mt-1.5 ml-4 space-y-1 pl-4 border-l border-white/10">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setActiveMenu(child.id)}
                        className={`w-full flex items-center px-4 py-2 rounded-lg text-xs transition-all duration-200 ${
                          activeMenu === child.id 
                            ? 'text-gold font-bold' 
                            : 'text-slate-400 hover:text-white hover:translate-x-1'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-paper rounded transition-colors text-[#6c757d]"><Menu size={20} /></button>
            <nav className="hidden md:flex items-center gap-4 text-sm text-[#6c757d]">
              <button onClick={onClose} className="hover:text-ink">Back to Site</button>
              <button className="hover:text-ink">Contact</button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#f4f6f9] border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-48 lg:w-64"
              />
            </div>
            <button className="sm:hidden p-2 hover:bg-paper rounded transition-colors text-[#6c757d]"><Search size={18} /></button>
            <div className="relative group">
              <button className="p-2 hover:bg-paper rounded transition-colors text-[#6c757d] relative">
                <Bell size={18} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b border-border font-bold text-sm flex justify-between items-center">
                  Notifications
                  <button onClick={() => {
                    fetchWithAuth('/api/admin/notifications/read', { 
                      method: 'POST'
                    }).then(fetchNotifications);
                  }} className="text-xs text-blue-500 hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b border-border last:border-0 text-xs ${!n.read ? 'bg-blue-50' : ''}`}>
                      <p className="font-medium mb-1">{n.message}</p>
                      <p className="text-[#6c757d]">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-paper rounded transition-colors text-[#6c757d]"><Maximize size={18} /></button>
            <button onClick={onClose} className="p-2 hover:bg-paper rounded transition-colors text-[#6c757d] ml-2"><X size={20} /></button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium">
              {activeMenu.startsWith('dashboard') ? 'Dashboard' : 
               activeMenu === 'listings' ? 'Listing Management' : 
               activeMenu === 'users' ? 'User Management' : 
               activeMenu === 'bookings' ? 'Booking Management' : 
               activeMenu === 'analytics' ? 'Advanced Analytics' :
               activeMenu === 'activity-logs' ? 'Activity Logs' :
               activeMenu === 'admin-logs' ? 'Admin Logs' :
               activeMenu === 'chat' ? 'Admin Chat' :
               activeMenu === 'security' ? 'Security Monitoring' : 'Admin Panel'}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={onClose} className="text-blue-500 hover:underline">Back to Site</button>
              <span className="text-[#6c757d]">/</span>
              <span className="text-[#6c757d] capitalize">{activeMenu.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Dashboard View */}
          {activeMenu.startsWith('dashboard') && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                        <h3 className="text-3xl font-display text-slate-900">{stat.value}</h3>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {stat.trend} <span className="text-slate-400 font-normal">vs last month</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.color.replace('bg-', 'bg-opacity-10 text-')} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <div className={`absolute bottom-0 left-0 h-1 ${stat.color} w-0 group-hover:w-full transition-all duration-500`} />
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#f8f9fa]">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Activity Trend</h3>
                    <div className="flex gap-2">
                      <button className="text-[10px] font-bold uppercase px-2 py-1 bg-blue-500 text-white rounded">Daily</button>
                      <button className="text-[10px] font-bold uppercase px-2 py-1 hover:bg-paper rounded">Weekly</button>
                    </div>
                  </div>
                  <div className="p-4 h-80">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={300}>
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#f8f9fa]">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Globe size={16} className="text-emerald-500" /> World Map Analytics</h3>
                    <button className="p-1 hover:bg-paper rounded"><RefreshCw size={14} /></button>
                  </div>
                  <div className="p-4 h-80 flex flex-col items-center justify-center bg-blue-500 text-white relative">
                    <Globe size={120} className="opacity-20 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="grid grid-cols-2 gap-8">
                          <div><p className="text-2xl font-bold">8,500</p><p className="text-[10px] uppercase opacity-70">Visitors</p></div>
                          <div><p className="text-2xl font-bold">2,330</p><p className="text-[10px] uppercase opacity-70">Online</p></div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                          <p className="text-xs font-bold mb-2">Top Countries</p>
                          <div className="space-y-2 text-[10px]">
                            <div className="flex justify-between"><span>Italy</span><span className="font-bold">45%</span></div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden"><div className="bg-white h-full" style={{width: '45%'}} /></div>
                            <div className="flex justify-between"><span>USA</span><span className="font-bold">22%</span></div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden"><div className="bg-white h-full" style={{width: '22%'}} /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">Recent Activity</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#f8f9fa] border-b border-border">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Page</th>
                          <th className="px-4 py-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activityLogs.slice(0, 5).map(log => (
                          <tr key={log.id} className="hover:bg-[#f8f9fa]">
                            <td className="px-4 py-3 font-medium">{log.user_name}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold">{log.action}</span></td>
                            <td className="px-4 py-3 text-[#6c757d]">{log.page}</td>
                            <td className="px-4 py-3 text-[#6c757d]">{new Date(log.created_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">System Health</div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="font-medium">CPU Usage</span><span className="font-bold">24%</span></div>
                      <div className="w-full bg-paper h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{width: '24%'}} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="font-medium">Memory Usage</span><span className="font-bold">68%</span></div>
                      <div className="w-full bg-paper h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{width: '68%'}} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="font-medium">Disk Space</span><span className="font-bold">12%</span></div>
                      <div className="w-full bg-paper h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: '12%'}} /></div>
                    </div>
                    <div className="pt-4 border-t border-border flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <CheckCircle2 size={16} /> All systems operational
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management View */}
          {activeMenu === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#f8f9fa]">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="bg-white border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrators</option>
                      <option value="user">Users</option>
                      <option value="guest">Guests</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsAddingUser(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                  >
                    <UserPlus size={16} /> Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-border">
                        <th className="px-4 py-3 font-bold">User</th>
                        <th className="px-4 py-3 font-bold">Role</th>
                        <th className="px-4 py-3 font-bold">Last Login</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#f8f9fa]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-paper overflow-hidden shrink-0">
                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} />
                              </div>
                              <div>
                                <p className="font-bold">{u.name}</p>
                                <p className="text-xs text-[#6c757d]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase outline-none border border-transparent focus:border-blue-500 ${u.role === 'admin' ? 'bg-rose-100 text-rose-600' : u.role === 'guest' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}
                            >
                              <option value="admin">Administrator</option>
                              <option value="user">User</option>
                              <option value="guest">Guest</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-[#6c757d] text-xs">
                            {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.disabled ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {u.disabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleToggleUserStatus(u.id, u.disabled)}
                                className={`p-2 rounded-lg transition-colors ${u.disabled ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                title={u.disabled ? 'Enable User' : 'Disable User'}
                              >
                                {u.disabled ? <Unlock size={16} /> : <Lock size={16} />}
                              </button>
                              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View History">
                                <Clock size={16} />
                              </button>
                              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Management View */}
          {activeMenu === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex justify-between items-center bg-[#f8f9fa]">
                  <h3 className="font-bold text-sm">Booking Management</h3>
                  <div className="flex gap-2">
                    <button onClick={fetchAllBookings} className="p-2 hover:bg-paper rounded-lg transition-colors"><RefreshCw size={16} /></button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-border">
                        <th className="px-4 py-3 font-bold">Booking ID</th>
                        <th className="px-4 py-3 font-bold">User</th>
                        <th className="px-4 py-3 font-bold">Listing</th>
                        <th className="px-4 py-3 font-bold">Dates</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-[#f8f9fa]">
                          <td className="px-4 py-3 font-mono text-xs text-[#6c757d]">{booking.id.slice(0, 8)}...</td>
                          <td className="px-4 py-3">
                            <p className="font-bold">{booking.user_name}</p>
                            <p className="text-xs text-[#6c757d]">{booking.user_email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{booking.listing_name || 'Listing'}</p>
                            <p className="text-[10px] uppercase text-[#6c757d]">{booking.listing_type}</p>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex items-center gap-1"><Calendar size={12} /> {booking.start_date} - {booking.end_date}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">€{booking.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs View */}
          {activeMenu === 'activity-logs' && (
            <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center bg-[#f8f9fa]">
                <h3 className="font-bold text-sm">User Activity Logs</h3>
                <button onClick={fetchActivityLogs} className="p-2 hover:bg-paper rounded-lg transition-colors"><RefreshCw size={16} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-border">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Page</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#f8f9fa]">
                        <td className="px-4 py-3">
                          <p className="font-bold">{log.user_name}</p>
                          <p className="text-[10px] text-[#6c757d]">{log.user_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${log.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6c757d]">{log.page}</td>
                        <td className="px-4 py-3 font-mono text-[#6c757d]">{log.ip || '127.0.0.1'}</td>
                        <td className="px-4 py-3 text-[#6c757d]">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Logs View */}
          {activeMenu === 'admin-logs' && (
            <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center bg-[#f8f9fa]">
                <h3 className="font-bold text-sm">Administrator Action Logs</h3>
                <button onClick={fetchAdminLogs} className="p-2 hover:bg-paper rounded-lg transition-colors"><RefreshCw size={16} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-border">
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Changes</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#f8f9fa]">
                        <td className="px-4 py-3 font-bold">{log.admin_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-[#6c757d]">ID: {log.target_id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 line-through">{log.old_value}</span>
                            <ChevronRight size={12} className="text-[#6c757d]" />
                            <span className="text-emerald-500">{log.new_value}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#6c757d]">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeMenu === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">User Retention Rate</div>
                  <div className="p-6 h-80">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={300}>
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">Traffic Sources</div>
                  <div className="p-6 h-80">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Direct', value: 400 },
                            { name: 'Social', value: 300 },
                            { name: 'Search', value: 300 },
                            { name: 'Referral', value: 200 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] font-bold uppercase">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0088FE]" /> Direct</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00C49F]" /> Social</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FFBB28]" /> Search</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF8042]" /> Referral</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Chat View */}
          {activeMenu === 'chat' && (
            <div className="bg-white rounded border border-border overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa] flex justify-between items-center">
                <div className="flex items-center gap-2"><MessageSquare size={16} className="text-blue-500" /> Admin Internal Chat</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase text-[#6c757d]">3 Admins Online</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {adminMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender_id === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-paper overflow-hidden shrink-0 border border-border shadow-sm">
                      <img src={msg.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_name}`} alt={msg.sender_name} />
                    </div>
                    <div className={`space-y-1 max-w-[70%] ${msg.sender_id === 1 ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 ${msg.sender_id === 1 ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-bold">{msg.sender_name}</span>
                        <span className="text-[10px] text-[#6c757d]">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender_id === 1 ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-[#f8f9fa] border border-border rounded-tl-none'}`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-[#f8f9fa] flex gap-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-white border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition-colors">
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}

          {/* Security Monitoring View */}
          {activeMenu === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded border border-border shadow-sm">
                  <div className="text-[#6c757d] text-xs font-bold uppercase mb-1">Failed Logins (24h)</div>
                  <div className="text-2xl font-bold text-rose-500">{securityStats.failedLogins}</div>
                </div>
                <div className="bg-white p-4 rounded border border-border shadow-sm">
                  <div className="text-[#6c757d] text-xs font-bold uppercase mb-1">Active Sessions</div>
                  <div className="text-2xl font-bold text-blue-500">{securityStats.activeSessions}</div>
                </div>
                <div className="bg-white p-4 rounded border border-border shadow-sm">
                  <div className="text-[#6c757d] text-xs font-bold uppercase mb-1">Blocked IPs</div>
                  <div className="text-2xl font-bold text-amber-500">{securityStats.blockedIPs}</div>
                </div>
                <div className="bg-white p-4 rounded border border-border shadow-sm">
                  <div className="text-[#6c757d] text-xs font-bold uppercase mb-1">Last Scan</div>
                  <div className="text-sm font-bold">{new Date(securityStats.lastSecurityScan).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa] flex items-center gap-2">
                  <Shield size={16} className="text-blue-500" /> Security Incident Logs
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-border">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {notifications.filter(n => n.type === 'security').map(n => (
                        <tr key={n.id} className="hover:bg-rose-50">
                          <td className="px-4 py-3"><span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold uppercase text-[10px]">Security</span></td>
                          <td className="px-4 py-3 font-medium">{n.message}</td>
                          <td className="px-4 py-3 font-mono text-[#6c757d]">192.168.1.105</td>
                          <td className="px-4 py-3 text-[#6c757d]">{new Date(n.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      {notifications.filter(n => n.type === 'security').length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-[#6c757d]">
                            <Shield size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No critical security events detected in the last 24 hours.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs View */}
          {activeMenu === 'activity-logs' && (
            <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa] flex justify-between items-center">
                <div className="flex items-center gap-2"><Activity size={16} className="text-blue-500" /> User Activity Logs</div>
                <button onClick={fetchActivityLogs} className="p-1.5 hover:bg-paper rounded transition-colors text-[#6c757d]"><RefreshCw size={14} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-border">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Path</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-paper/50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">{log.user_name}</span>
                            <span className="text-[10px] text-[#6c757d]">{log.user_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{log.action || 'Access'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            log.method === 'GET' ? 'bg-blue-100 text-blue-600' :
                            log.method === 'POST' ? 'bg-emerald-100 text-emerald-600' :
                            log.method === 'DELETE' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#6c757d]">{log.path}</td>
                        <td className="px-4 py-3 text-[#6c757d]">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Logs View */}
          {activeMenu === 'admin-logs' && (
            <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa] flex justify-between items-center">
                <div className="flex items-center gap-2"><Terminal size={16} className="text-amber-500" /> Administrative Action Logs</div>
                <button onClick={fetchAdminLogs} className="p-1.5 hover:bg-paper rounded transition-colors text-[#6c757d]"><RefreshCw size={14} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-border">
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-paper/50">
                        <td className="px-4 py-3 font-bold">{log.admin_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold uppercase text-[9px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{log.target}</td>
                        <td className="px-4 py-3 text-[#6c757d] truncate max-w-[200px]">{JSON.stringify(log.details)}</td>
                        <td className="px-4 py-3 text-[#6c757d]">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeMenu === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">System Settings</div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#6c757d]">Site Name</label>
                      <input 
                        type="text" 
                        value={systemSettings.siteName} 
                        onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                        className="w-full bg-[#f8f9fa] border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#6c757d]">Admin Email</label>
                      <input 
                        type="email" 
                        value={systemSettings.adminEmail} 
                        onChange={(e) => setSystemSettings({...systemSettings, adminEmail: e.target.value})}
                        className="w-full bg-[#f8f9fa] border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#6c757d]">Maintenance Mode</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                          className={`w-12 h-6 rounded-full relative transition-colors ${systemSettings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${systemSettings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                        <span className="text-sm text-[#6c757d]">{systemSettings.maintenanceMode ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#6c757d]">User Registration</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSystemSettings({...systemSettings, userRegistration: !systemSettings.userRegistration})}
                          className={`w-12 h-6 rounded-full relative transition-colors ${systemSettings.userRegistration ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${systemSettings.userRegistration ? 'right-1' : 'left-1'}`} />
                        </button>
                        <span className="text-sm text-[#6c757d]">{systemSettings.userRegistration ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-end">
                    <button 
                      onClick={handleSaveSettings}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-border overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border font-bold text-sm bg-[#f8f9fa]">API Configuration</div>
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-xs text-amber-700">Changing API keys may affect live services. Please proceed with caution.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#6c757d]">Stripe Public Key</label>
                    <input type="password" value={systemSettings.stripePublicKey} readOnly className="w-full bg-[#f8f9fa] border border-border rounded-lg px-4 py-2 text-sm outline-none font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#6c757d]">Firebase Project ID</label>
                    <input type="text" value={systemSettings.firebaseProjectId} readOnly className="w-full bg-[#f8f9fa] border border-border rounded-lg px-4 py-2 text-sm outline-none font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings View (Existing) */}
          {activeMenu === 'listings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Manage Listings</h2>
                <button 
                  onClick={() => setEditingListing({ type: 'hotel', stars: 5, price_level: 'medium', category: 'Standard' })}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} /> Add New Listing
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded border border-border">
                  <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.filter(l => 
                    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    l.location.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((listing) => (
                    <motion.div key={`${listing.type}-${listing.id}`} layout className="bg-white rounded border border-border overflow-hidden shadow-sm group">
                      <div className="relative h-48">
                        <img src={listing.image || undefined} alt={listing.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingListing(listing)} className="p-2 bg-white/90 backdrop-blur-sm text-ink rounded-full hover:bg-gold hover:text-white transition-all shadow-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteListing(listing.id, listing.type)} className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={16} /></button>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-ink/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full">{listing.type}</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-bold text-lg text-ink">{listing.name}</h3><p className="text-xs text-ink/60 flex items-center gap-1"><MapPin size={12} /> {listing.location}</p></div>
                          <div className="text-right"><p className="text-lg font-bold text-gold">€{listing.price}</p><p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{listing.category}</p></div>
                        </div>
                        <div className="flex items-center gap-1 text-gold">{Array.from({ length: listing.stars }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="h-14 bg-white border-t border-border flex items-center justify-between px-6 text-xs text-[#6c757d] shrink-0">
          <div><span className="font-bold">Copyright © 2024-2025</span> <span className="text-blue-500">AdminLTE.io</span>. All rights reserved.</div>
          <div><span className="font-bold">Version</span> 4.0.0</div>
        </footer>
      </div>

      {/* Edit Listing Modal (Existing) */}
      <AnimatePresence>
        {editingListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="text-2xl font-display italic text-ink">{editingListing.id ? t.editListing : t.addListing}</h2>
                <button onClick={() => setEditingListing(null)} className="text-ink/40 hover:text-ink"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.type}</label>
                    <select value={editingListing.type} onChange={(e) => setEditingListing({ ...editingListing, type: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink">
                      {[{id:'hotel',label:'Hotel'},{id:'restaurant',label:'Restaurant'},{id:'tour',label:'Tour'},{id:'experience',label:'Experience'},{id:'rental',label:'Rental'},{id:'event',label:'Event'}].map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.category}</label>
                    <select value={editingListing.category} onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink">
                      <option value="Budget">Budget</option><option value="Standard">Standard</option><option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.name}</label>
                  <input type="text" value={editingListing.name || ''} onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.location}</label>
                    <input type="text" value={editingListing.location || ''} onChange={(e) => setEditingListing({ ...editingListing, location: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" />
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.price}</label>
                    <input type="number" value={editingListing.price || 0} onChange={(e) => setEditingListing({ ...editingListing, price: parseFloat(e.target.value) })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.stars}</label>
                    <input type="number" min="1" max="5" value={editingListing.stars || 5} onChange={(e) => setEditingListing({ ...editingListing, stars: parseInt(e.target.value) })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" />
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.priceRange}</label>
                    <select value={editingListing.price_level} onChange={(e) => setEditingListing({ ...editingListing, price_level: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.image}</label>
                  <input type="text" value={editingListing.image || ''} onChange={(e) => setEditingListing({ ...editingListing, image: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" />
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.description}</label>
                  <textarea value={editingListing.description || ''} onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })} className="w-full bg-paper/50 border-none rounded-2xl px-6 py-8 outline-none focus:ring-1 focus:ring-gold text-ink min-h-[120px]" />
                </div>
              </div>
              <div className="p-8 border-t border-border bg-paper/30 flex gap-4">
                <button onClick={() => setEditingListing(null)} className="flex-1 btn-outline py-4">{t.cancel}</button>
                <button onClick={handleSaveListing} className="flex-1 btn-luxury py-4 flex items-center justify-center gap-2"><Save size={18} /> {t.save}</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="text-2xl font-display italic text-ink">Add New User</h2>
                <button onClick={() => setIsAddingUser(false)} className="text-ink/40 hover:text-ink"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Password</label>
                  <input 
                    type="password" 
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Role</label>
                  <select 
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingUser(false)} className="flex-1 btn-outline py-4">Cancel</button>
                  <button type="submit" className="flex-1 btn-luxury py-4">Create User</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
