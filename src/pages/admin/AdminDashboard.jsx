import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { 
  BarChart, 
  Users, 
  Package, 
  Trash, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Store, 
  DollarSign, 
  ShieldPlus,
  ShieldMinus,
  Info,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  CreditCard,
  MapPin,
  Save,
  MessageSquare,
  ClipboardList,
  Star,
  Activity,
  Terminal,
  ArrowUpRight,
  RefreshCw,
  Phone,
  Quote,
  Clock,
  Tag,
  Zap,
  Edit3,
  PlusCircle,
  Layout,
  Utensils,
  ChevronRight,
  Globe,
  Navigation,
  Box,
  Fingerprint,
  CalendarDays
} from 'lucide-react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import { logout } from '../../features/authSlice';
import InfoModal from '../../components/InfoModal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const AdminDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [view, setView] = useState('analytics');
    const [analytics, setAnalytics] = useState({ usersCount: 0, ordersCount: 0, totalRevenue: 0 });
    const [users, setUsers] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [allReservations, setAllReservations] = useState([]);
    const [allDeals, setAllDeals] = useState([]);
    const [newDeal, setNewDeal] = useState({ title: '', description: '', discountValue: '', price: '', imageUrl: '', items: [], restaurant_id: '' });
    const [settings, setSettings] = useState({ sittingAreaLocation: 'Main Mall Floor' });
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const [modal, setModal] = useState({ 
        isOpen: false, 
        type: 'info', 
        title: '', 
        description: '', 
        onConfirm: null 
    });

    const openModal = (config) => setModal({ ...config, isOpen: true });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'Admin') {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [userInfo, navigate]);

    // View change animation
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.view-content', 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [view, loading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: analyticsData } = await api.get('/admin/analytics');
            setAnalytics(analyticsData);
            
            const { data: usersData } = await api.get('/admin/users');
            setUsers(usersData);

            const { data: ordersData } = await api.get('/orders'); 
            setAllOrders(ordersData);

            const { data: menuData } = await api.get('/menus');
            setAllMenuItems(menuData);

            const { data: reviewData } = await api.get('/reviews');
            setAllReviews(reviewData);

            const { data: reservationData } = await api.get('/reservations');
            setAllReservations(reservationData);

            const { data: dealsData } = await api.get('/deals');
            setAllDeals(dealsData);

            const { data: settingsData } = await api.get('/admin/settings');
            const locationSetting = settingsData.find(s => s.key === 'sittingAreaLocation');
            if (locationSetting) setSettings({ sittingAreaLocation: locationSetting.value });
            
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleUpdateSetting = async (key, value) => {
        try {
            await api.post('/admin/settings', { key, value });
            openModal({ type: 'success', title: 'Settings Updated', description: 'The restaurant settings have been updated.' });
            fetchData();
        } catch (error) {
            openModal({ type: 'error', title: 'Update Error', description: 'Failed to update system settings.' });
        }
    };

    const handleUpdateRole = async (userId, targetRole) => {
        const action = targetRole === 'Restaurant' ? 'Promote to Restaurant Owner' : 'Demote to Customer';
        const description = targetRole === 'Restaurant' 
            ? "This will grant the user venue management privileges and create a default restaurant profile."
            : "This will revoke all venue management privileges for this user.";
        
        openModal({
            type: 'confirm',
            title: action,
            description: `Are you sure you want to proceed? ${description}`,
            onConfirm: async () => {
                try {
                    console.log(`Sending role update: ${targetRole} for user ${userId}`);
                    await api.patch(`/admin/users/${userId}/role`, { role: targetRole });
                    
                    // Force refresh data
                    await fetchData();
                    
                    closeModal();
                    openModal({ 
                        type: 'success', 
                        title: 'Success', 
                        description: `User role has been updated to ${targetRole}.` 
                    });
                } catch (error) {
                    console.error("Role update error:", error);
                    openModal({ 
                        type: 'error', 
                        title: 'Update Failed', 
                        description: error.response?.data?.message || 'Failed to update user role.' 
                    });
                }
            }
        });
    };

    const deleteUser = (id) => {
        openModal({
            type: 'confirm',
            title: 'Delete User?',
            description: 'Are you sure you want to permanently remove this user account?',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    fetchData();
                    closeModal();
                } catch (error) {
                    openModal({ type: 'error', title: 'Delete Failed', description: 'Failed to remove user account.' });
                }
            }
        });
    };

    const deleteMenuItem = (id) => {
        openModal({
            type: 'confirm',
            title: 'Remove Menu Item?',
            description: 'Are you sure you want to delete this item from the global menu?',
            onConfirm: async () => {
                try {
                    await api.delete(`/menus/${id}`);
                    fetchData();
                    closeModal();
                    openModal({ type: 'success', title: 'Item Removed', description: 'Item has been removed from the global menu.' });
                } catch (error) {
                    openModal({ type: 'error', title: 'Error', description: 'Failed to remove menu item.' });
                }
            }
        });
    };

    const deleteReview = (id) => {
        openModal({
            type: 'confirm',
            title: 'Remove Review?',
            description: 'Are you sure you want to remove this customer review?',
            onConfirm: async () => {
                try {
                    await api.delete(`/reviews/${id}`);
                    fetchData();
                    closeModal();
                } catch (error) {
                    openModal({ type: 'error', title: 'Error', description: 'Failed to remove review.' });
                }
            }
        });
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            toast.success(`Order status has been updated to: ${status}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const updateReservationStatus = async (id, status) => {
        try {
            await api.put(`/reservations/${id}/status`, { status });
            toast.success(`Booking status changed to: ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to modify reservation status.');
        }
    };

    const handleCreateDeal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/deals', newDeal);
            setNewDeal({ title: '', description: '', discountValue: '', price: '', imageUrl: '', items: [], restaurant_id: '' });
            openModal({ type: 'success', title: 'Promotion Live', description: 'A new offer has been published to the platform.' });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteDeal = async (id) => {
        try {
            await api.delete(`/deals/${id}`);
            setAllDeals(allDeals.filter(d => d._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const toggleItemInDeal = (itemId) => {
        const items = newDeal.items.includes(itemId)
            ? newDeal.items.filter(id => id !== itemId)
            : [...newDeal.items, itemId];
        setNewDeal({ ...newDeal, items });
    };

    const sidebarItems = [
        { label: 'Statistics', icon: <BarChart size={18}/>, onClick: () => setView('analytics'), activeCheck: () => view === 'analytics' },
        { label: 'Users', icon: <Users size={18}/>, onClick: () => setView('users'), activeCheck: () => view === 'users' },
        { label: 'Orders', icon: <Package size={18}/>, onClick: () => setView('orders'), activeCheck: () => view === 'orders' },
        { label: 'Reservations', icon: <ClipboardList size={18}/>, onClick: () => setView('bookings'), activeCheck: () => view === 'bookings' },
        { label: 'Global Menu', icon: <Layers size={18}/>, onClick: () => setView('menu'), activeCheck: () => view === 'menu' },
        { label: 'Promotions', icon: <Tag size={18}/>, onClick: () => setView('deals'), activeCheck: () => view === 'deals' },
        { label: 'Guest Mods', icon: <MessageSquare size={18}/>, onClick: () => setView('social'), activeCheck: () => view === 'social' },
        { label: 'Coordinates', icon: <MapPin size={18}/>, onClick: () => setView('floor'), activeCheck: () => view === 'floor' }
    ];

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Setting up admin area...</p>
        </div>
    );

    return (
        <div ref={containerRef} className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
            <Sidebar 
                menuItems={sidebarItems} 
                onLogout={logoutHandler} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            
            <main className="flex-1 min-w-0 transition-all duration-500 min-h-screen pt-12 pb-24 px-8 lg:px-12">
                
                {/* --- EXECUTIVE HEADER --- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-px bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Admin Dashboard</span>
                        </div>
                        <div>
                            <h1 className="text-4xl lg:text-7xl font-cursive tracking-wider lowercase leading-none text-foreground">
                                {view} <span className="text-primary">Admin.</span>
                            </h1>
                            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] mt-6 opacity-30">User: {userInfo?.name} | Administrator Access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={fetchData}
                            className="w-16 h-16 rounded-2xl bg-secondary/50 border border-primary/5 hover:border-primary/40 transition-all"
                        >
                            <RefreshCw size={24} className="text-primary" />
                        </Button>
                        <div className="text-right hidden md:block">
                           <div className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Live Feed</div>
                           <Activity className="w-6 h-6 text-primary animate-pulse ml-auto" />
                        </div>
                    </div>
                </header>

                <div className="view-content">
                
                {/* --- ANALYTICS VIEW --- */}
                {view === 'analytics' && (
                    <div className="space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Active Users', value: analytics.usersCount, icon: <Users size={32}/>, trend: '+12.4%', sub: 'Platform Total' },
                                { label: 'Total Revenue', value: `Rs. ${analytics.totalRevenue}`, icon: <DollarSign size={32}/>, trend: '+24.1%', highlight: true, sub: 'Overall Sales' },
                                { label: 'Total Orders', value: analytics.ordersCount, icon: <Package size={32}/>, trend: '+8.2%', sub: 'Total Orders' }
                            ].map((stat, i) => (
                                <Card key={i} className={`relative group rounded-[3.5rem] overflow-hidden border-2 transition-all duration-700 ${stat.highlight ? 'bg-primary border-primary shadow-2xl shadow-primary/20' : 'bg-secondary/30 border-primary/5'}`}>
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                                       {stat.icon}
                                    </div>
                                    <CardContent className="p-10 relative z-10 flex flex-col items-start gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${stat.highlight ? 'bg-black text-primary' : 'bg-background text-primary shadow-xl shadow-black/20'}`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${stat.highlight ? 'text-black/60' : 'text-muted-foreground'}`}>{stat.label}</span>
                                            <p className={`text-4xl lg:text-5xl font-black tracking-tighter italic ${stat.highlight ? 'text-black' : 'text-foreground'}`}>{stat.value}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${stat.highlight ? 'bg-black text-primary' : 'bg-primary text-black'}`}>
                                            <TrendingUp size={12}/> {stat.trend} INCREASE
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>



                        {/* Recent Activity Mini-Feed */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <Activity className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-black uppercase tracking-tight italic">Global <span className="not-italic text-primary">Activity.</span></h3>
                                <div className="h-px flex-1 bg-primary/10" />
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                 {allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected').slice(0, 6).map((order, i) => (
                                     <Card key={i} className="rounded-[2.5rem] bg-secondary/20 border border-primary/5 hover:border-primary/20 transition-all duration-500 group shadow-lg">
                                         <CardContent className="p-10 flex items-center justify-between">
                                             <div className="flex items-center gap-8">
                                                 <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-primary/10 flex items-center justify-center text-2xl font-black text-primary italic transition-transform group-hover:scale-110 shadow-xl">
                                                    {order.trackingId.slice(-2)}
                                                 </div>
                                                 <div>
                                                     <p className="text-xl font-black uppercase tracking-tighter leading-none mb-2">Order {order.trackingId}</p>
                                                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-2 italic">
                                                        <Store className="w-3.5 h-3.5" /> Origin: {order.restaurant_id?.name}
                                                     </p>
                                                 </div>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-2xl font-black tracking-tighter italic mb-2">Rs. {order.totalAmount}</p>
                                                 <Badge className="bg-primary/10 text-primary text-[9px] px-4 py-1 rounded-lg font-black border-primary/10 uppercase tracking-widest">{order.status}</Badge>
                                             </div>
                                         </CardContent>
                                     </Card>
                                 ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* --- COORDINATES VIEW --- */}
                {view === 'floor' && (
                    <div className="max-w-3xl mx-auto space-y-12">
                        <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl p-12 lg:p-20">
                            <div className="space-y-12">
                                 <div>
                                    <div className="flex items-center gap-3 mb-4">
                                       <MapPin className="w-5 h-5 text-primary" />
                                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Location Mapping</span>
                                    </div>
                                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">Restaurant <span className="not-italic text-primary">Location.</span></h3>
                                 </div>
                                 
                                 <div className="space-y-8">
                                    <div className="space-y-4">
                                         <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-6">Restaurant Address</label>
                                         <div className="relative group">
                                              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary group-focus-within:animate-spin transition-all" />
                                              <Input 
                                                  className="h-20 pl-16 pr-10 rounded-[2rem] bg-background border-primary/10 text-xl font-black tracking-tighter uppercase focus:ring-4 focus:ring-primary/10"
                                                  value={settings.sittingAreaLocation}
                                                  onChange={(e) => setSettings({...settings, sittingAreaLocation: e.target.value})}
                                              />
                                         </div>
                                    </div>
                                    <Button 
                                         onClick={() => handleUpdateSetting('sittingAreaLocation', settings.sittingAreaLocation)}
                                         className="w-full h-20 btn-primary rounded-[2rem] text-xl font-black flex items-center justify-between px-10 group shadow-2xl"
                                    >
                                         UPDATE LOCATION <Save className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                    </Button>
                                 </div>

                                 <div className="p-8 rounded-[2.5rem] bg-background/50 border border-primary/10 border-dashed flex gap-6 items-center">
                                     <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                                         <Info size={28} className="text-primary" />
                                     </div>
                                     <p className="text-[10px] font-black uppercase leading-relaxed tracking-widest text-muted-foreground">
                                         Notice: Updating this address will change the restaurant's location for all users.
                                     </p>
                                 </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- USERS VIEW --- */}
                {view === 'users' && (
                    <Card className="rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-primary/10 bg-black/40">
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic">User Details</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic text-center">Account Role</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                                            <td className="px-10 py-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-background border border-primary/10 flex items-center justify-center text-xl font-black text-primary italic">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black uppercase tracking-tighter italic mb-1 group-hover:text-primary transition-colors">{u.name}</div>
                                                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-40">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                             <td className="px-10 py-10 text-center">
                                                {u.role === 'Admin' ? (
                                                    <Badge className="h-8 px-6 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary text-black">
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Badge className={`h-8 px-6 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'Restaurant' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                                                            {u.role}
                                                        </Badge>
                                                        <Button 
                                                            onClick={() => handleUpdateRole(u._id, u.role === 'Restaurant' ? 'Customer' : 'Restaurant')}
                                                            variant="ghost"
                                                            className={`h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${u.role === 'Restaurant' ? 'border-destructive/20 text-destructive hover:bg-destructive/10' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                                                        >
                                                            {u.role === 'Restaurant' ? <ShieldMinus size={14} /> : <ShieldPlus size={14} />}
                                                            {u.role === 'Restaurant' ? 'Revoke Owner' : 'Assign Owner'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-10 text-right">
                                                {u.role !== 'Admin' && (
                                                    <Button 
                                                        variant="ghost"
                                                        onClick={() => deleteUser(u._id)}
                                                        className="w-12 h-12 rounded-xl text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
                                                    >
                                                        <Trash size={20}/>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* --- GLOBAL ORDERS VIEW --- */}
                {view === 'orders' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected').length > 0 ? (
                            allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected').map(order => (
                                <Card key={order._id} className="rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl transition-all duration-700 hover:border-primary/30 group relative">
                                    <div className="absolute top-0 right-0 p-8 pt-10 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                                       <Box className="w-48 h-48" />
                                    </div>
                                    <CardContent className="p-10 flex flex-col gap-8 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black tracking-widest mb-4">ID: {order.trackingId}</Badge>
                                                <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{order.customerContact?.name || order.customer_id?.name || 'GUEST USER'}</h3>
                                                <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mt-2 flex items-center gap-2">
                                                   <Store className="w-3 h-3" /> Restaurant: {order.restaurant_id?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Status</div>
                                                <Badge className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'Cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-primary text-black'}`}>{order.status}</Badge>
                                            </div>
                                        </div>

                                        <div className="py-6 border-y border-primary/10 border-dashed space-y-3">
                                            {order.items.map((it, idx) => (
                                                <div key={idx} className="flex items-center justify-between group/item">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black bg-background p-2 rounded-lg border border-primary/10 text-primary italic transition-transform group-hover/item:scale-110">{it.qty}x</span>
                                                        <span className="text-sm font-black uppercase tracking-tight text-foreground/70 italic">{it.menuItem?.name || 'Item'}</span>
                                                    </div>
                                                    <span className="text-sm font-black tracking-tighter text-muted-foreground italic">Rs. {it.price * it.qty}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase">Total Amount</span>
                                                <p className="text-3xl font-black italic">Rs. {order.totalAmount}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button 
                                                     onClick={() => updateOrderStatus(order._id, 'Delivered')} 
                                                     className="h-14 px-6 btn-primary rounded-2xl text-[10px] font-black shadow-xl"
                                                 >
                                                     COMPLETE
                                                 </Button>
                                                <Button 
                                                     onClick={() => updateOrderStatus(order._id, 'Cancelled')} 
                                                     variant="ghost"
                                                     className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-xl"
                                                 >
                                                     <XCircle size={22}/>
                                                 </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-2 py-40 text-center border-2 border-dashed border-primary/10 rounded-[5rem] animate-pulse">
                                <Activity size={80} className="text-primary/20 mx-auto mb-8"/>
                                <p className="text-2xl font-black uppercase tracking-tighter opacity-30 italic">No Active Records Found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- UNIFIED BOOKING DESK --- */}
                {view === 'bookings' && (
                     <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-primary/10 bg-secondary/20">
                                        <th className="px-10 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic">Guest Info</th>
                                        <th className="px-10 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic text-center">Table Number</th>
                                        <th className="px-10 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic text-center">Date & Time</th>
                                        <th className="px-10 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 italic text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allReservations.filter(r => r.status !== 'Accepted' && r.status !== 'Declined' && r.status !== 'Completed').length > 0 ? (
                                        allReservations.filter(r => r.status !== 'Accepted' && r.status !== 'Declined' && r.status !== 'Completed').map(res => (
                                            <tr key={res._id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                                                <td className="px-10 py-12">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-primary/10 flex items-center justify-center text-2xl font-black text-primary italic">
                                                            {(res.guestName || res.customer_id?.name || 'G').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-black uppercase tracking-tighter italic mb-1 group-hover:text-primary transition-colors leading-none">{res.guestName || res.customer_id?.name || 'Authorized Guest'}</div>
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 italic">
                                                               <Store className="w-3 h-3" /> {res.restaurant_id?.name || 'GLOBAL_CORE'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-12 text-center">
                                                    <div className="text-xl font-black italic tracking-tighter">Table {res.tableNumber}</div>
                                                    <div className="text-[9px] font-black uppercase text-primary/40 tracking-widest mt-1 italic">{settings.sittingAreaLocation}</div>
                                                </td>
                                                <td className="px-10 py-12 text-center">
                                                    <div className="text-xl font-black italic tracking-tighter flex items-center justify-center gap-2">
                                                       <CalendarDays size={16} className="text-primary" /> {res.reservationDate}
                                                    </div>
                                                    <div className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mt-1 flex items-center justify-center gap-2 italic">
                                                       <Clock size={12} className="text-primary" /> ETA: {res.arrivalTime}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-12 text-right">
                                                    <div className="flex flex-col items-end gap-3">
                                                        <Badge className={`h-8 px-6 rounded-full text-[9px] font-black uppercase tracking-widest ${res.status === 'Accepted' ? 'bg-primary text-black' : res.status === 'Declined' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'}`}>
                                                            {res.status}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => updateReservationStatus(res._id, 'Accepted')} variant="ghost" className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/5 hover:bg-primary hover:text-black transition-all">
                                                                <CheckCircle size={20}/>
                                                            </Button>
                                                            <Button onClick={() => updateReservationStatus(res._id, 'Declined')} variant="ghost" className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/5 hover:bg-destructive hover:text-white transition-all text-destructive">
                                                                <XCircle size={20}/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-40 text-center opacity-30 italic">
                                                <ClipboardList size={80} className="mx-auto mb-6 opacity-20"/>
                                                <p className="text-2xl font-black uppercase tracking-tighter">No Scheduled Records Detected.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* --- MASTER MENU AUDIT VIEW --- */}
                {view === 'menu' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {allMenuItems.length > 0 ? (
                            allMenuItems.map(item => (
                                <Card key={item._id} className="group relative rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl transition-all duration-700 hover:border-primary/40">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img 
                                           src={item.imageUrl || DEFAULT_IMAGE} 
                                           alt={item.name} 
                                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        <div className="absolute top-6 right-6">
                                            <Button 
                                                variant="ghost"
                                                onClick={() => deleteMenuItem(item._id)} 
                                                className="w-12 h-12 rounded-2xl bg-destructive text-white hover:scale-110 shadow-2xl transition-all p-0"
                                            >
                                                <Trash size={20}/>
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-6 left-8 right-8">
                                            <Badge className="bg-primary/20 backdrop-blur-md text-primary border-primary/20 text-[8px] font-black tracking-widest italic mb-3">
                                               ORIGIN: {item.restaurant_id?.name || 'CORE'}
                                            </Badge>
                                            <h4 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{item.name}</h4>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex justify-between items-center bg-secondary/20">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Price</span>
                                            <p className="text-2xl font-black tracking-tighter italic text-primary">${item.price}</p>
                                        </div>
                                        <Badge className="h-10 px-6 rounded-xl bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-widest">{item.category}</Badge>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 py-40 text-center opacity-30 italic">
                                 <Layers size={80} className="mx-auto mb-6 opacity-20"/>
                                 <p className="text-2xl font-black uppercase tracking-tighter">Global Inventory Depleted.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- PROMOTIONS & DEALS VIEW --- */}
                {view === 'deals' && (
                    <div className="space-y-20">
                        {/* Summary Stats */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                             <div className="space-y-4 text-center md:text-left">
                                <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none">Promotions <span className="text-primary not-italic">Manager.</span></h2>
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-40">Manage and create special offers for your customers.</p>
                             </div>
                             <Card className="rounded-3xl bg-primary shadow-2xl shadow-primary/20 p-8 flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform">
                                   <Tag size={28} className="text-primary"/>
                                </div>
                                <div>
                                   <p className="text-3xl font-black tracking-tighter text-black leading-none">{allDeals.length}</p>
                                   <p className="text-[9px] font-black uppercase text-black/60 tracking-widest">Active Campaigns</p>
                                </div>
                             </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                            {/* Deployment Form */}
                            <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl p-10 lg:p-14 sticky top-12">
                                <CardContent className="p-0 space-y-8">
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic">New <span className="text-primary not-italic">Promotion.</span></h3>
                                    <form onSubmit={handleCreateDeal} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Deal Title</label>
                                                <Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold tracking-tight uppercase" placeholder="Elite Dinner Bundle..." required value={newDeal.title} onChange={(e) => setNewDeal({...newDeal, title: e.target.value})} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Image URL</label>
                                                <Input className="h-16 rounded-2xl bg-background border-primary/10 font-medium" placeholder="https://unsplash.com/..." value={newDeal.imageUrl} onChange={(e) => setNewDeal({...newDeal, imageUrl: e.target.value})} />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Description</label>
                                            <textarea 
                                                className="w-full min-h-[120px] rounded-3xl bg-background border border-primary/10 p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all no-scrollbar"
                                                placeholder="Enter a description for this deal..."
                                                value={newDeal.description}
                                                onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex justify-between">
                                                <span>Included Items</span>
                                                <span className="text-primary">{newDeal.items.length}/∞ Items Selected</span>
                                            </label>
                                            <div className="max-h-[200px] overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 p-4 rounded-3xl bg-background/50 border border-primary/10">
                                                {allMenuItems.map(item => (
                                                    <button 
                                                        key={item._id}
                                                        type="button"
                                                        onClick={() => toggleItemInDeal(item._id)}
                                                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${newDeal.items.includes(item._id) ? 'bg-primary text-black' : 'bg-secondary/40 hover:bg-secondary text-muted-foreground'}`}
                                                    >
                                                        <div className="text-left">
                                                            <div className={`text-[8px] font-black uppercase tracking-widest ${newDeal.items.includes(item._id) ? 'text-black/60' : 'text-primary/40'}`}>{item.restaurant_id?.name || 'GLOBAL'}</div>
                                                            <div className="text-xs font-black uppercase tracking-tighter italic">{item.name}</div>
                                                        </div>
                                                        {newDeal.items.includes(item._id) && <CheckCircle size={16} className="animate-in zoom-in"/>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Discount Label</label>
                                                <Input className="h-16 rounded-2xl bg-background border-primary/10 font-black uppercase text-primary placeholder:text-primary/20" placeholder="Limited Offer" value={newDeal.discountValue} onChange={(e) => setNewDeal({...newDeal, discountValue: e.target.value})} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Bundle Price (rs.)</label>
                                                <Input type="number" className="h-16 rounded-2xl bg-background border-primary/10 font-black text-xl italic" placeholder="0.00" required value={newDeal.price} onChange={(e) => setNewDeal({...newDeal, price: e.target.value})} />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-24 btn-primary rounded-[2.5rem] text-2xl font-black shadow-2xl flex items-center justify-center gap-6 group overflow-hidden relative"
                                        >
                                            <span className="relative z-10 transition-transform group-hover:scale-105">LAUNCH DEAL</span>
                                            <ArrowUpRight size={32} className="relative z-10 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Inventory List */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                   <Layers className="w-5 h-5 text-primary" />
                                   <h3 className="text-xl font-black uppercase tracking-tight italic">Active <span className="not-italic text-primary">Inventory.</span></h3>
                                   <div className="h-px flex-1 bg-primary/10" />
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {allDeals.map(deal => (
                                        <Card key={deal._id} className="rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl group transition-all duration-700 hover:border-primary/30">
                                            <CardContent className="p-0 flex flex-col md:flex-row">
                                                <div className="md:w-48 relative overflow-hidden">
                                                    <img 
                                                       src={deal.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'} 
                                                       alt={deal.title} 
                                                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40" />
                                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                                       <Badge className="bg-primary text-black font-black uppercase tracking-widest text-[8px] h-8 px-4 rounded-full shadow-2xl">{deal.discountValue}</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                                                    <div>
                                                        <h4 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">{deal.title}</h4>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">{deal.items?.length || 0} ITEMS INCLUDED</p>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-primary mb-1 block">Deal Price</span>
                                                            <p className="text-2xl font-black tracking-tighter italic leading-none">${deal.price}</p>
                                                        </div>
                                                        <Button 
                                                            variant="ghost"
                                                            onClick={() => handleDeleteDeal(deal._id)} 
                                                            className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-xl"
                                                        >
                                                            <Trash size={18}/>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SOCIAL MODERATION VIEW --- */}
                {view === 'social' && (
                    <div className="max-w-5xl mx-auto space-y-12">
                        {allReviews.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8">
                                {allReviews.slice().reverse().map((rev, i) => (
                                    <div key={rev._id || i} className="group relative rounded-[4rem] bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-all duration-700 overflow-hidden shadow-2xl p-10 lg:p-14">
                                         <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                            <Quote className="w-48 h-48 rotate-12" />
                                         </div>
                                         
                                         {/* Profile Header */}
                                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                                             <div className="flex items-center gap-6">
                                                 <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-3xl font-black text-black italic rotate-6 group-hover:rotate-0 transition-transform shadow-2xl shadow-primary/20">
                                                     {rev.customer_id?.name?.charAt(0) || 'G'}
                                                 </div>
                                                 <div>
                                                     <div className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-3 group-hover:text-primary transition-colors">
                                                         {rev.customer_id?.name || 'GUEST_OPERATIVE'}
                                                     </div>
                                                     <div className="flex items-center gap-1">
                                                         {[...Array(5)].map((_, j) => (
                                                             <Star key={j} size={14} className="fill-primary text-primary" />
                                                         ))}
                                                         <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 ml-3 italic">Verified Rating</span>
                                                     </div>
                                                 </div>
                                             </div>
        
                                             <Button 
                                                variant="ghost"
                                                onClick={() => deleteReview(rev._id)} 
                                                className="w-16 h-16 rounded-[1.8rem] bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-xl p-0"
                                                title="Revoke Feedback"
                                             >
                                                <Trash size={24}/>
                                             </Button>
                                         </div>
        
                                         {/* Body */}
                                         <div className="relative z-10 mb-10 pl-4 border-l-4 border-primary/20 italic">
                                             <p className="text-2xl font-black tracking-tighter leading-tight text-foreground/80 uppercase">
                                                 "{rev.comment}"
                                             </p>
                                         </div>
        
                                         {/* Meta Footer */}
                                         <div className="flex flex-wrap items-center gap-4 relative z-10 border-t border-primary/5 pt-8">
                                             <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest h-8 px-4 flex items-center gap-2">
                                                <ShieldCheck size={14} /> DINER_AUTHENTICATED
                                             </Badge>
                                             <div className="h-4 w-px bg-primary/20" />
                                             <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary/60">
                                                 Details: {rev.targetType}
                                             </Badge>
                                             {rev.status === 'Edited' && (
                                                <>
                                                    <div className="h-4 w-px bg-primary/20" />
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/10 text-primary animate-pulse">EDITED</Badge>
                                                </>
                                             )}
                                         </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-48 text-center border-2 border-dashed border-primary/10 rounded-[5rem] animate-in zoom-in duration-1000">
                                 <MessageSquare size={100} className="text-primary/10 mx-auto mb-8 opacity-20"/>
                                 <div className="space-y-4">
                                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">Silent <span className="text-primary not-italic">Frequency.</span></h3>
                                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-40 max-w-sm mx-auto leading-relaxed">The network is currently awaiting guest feedback synchronization events.</p>
                                 </div>
                            </div>
                        )}
                    </div>
                )}
                </div>

            </main>
            <InfoModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                description={modal.description}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
            />
        </div>
    );
};

export default AdminDashboard;
