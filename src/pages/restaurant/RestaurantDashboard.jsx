import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { 
  Package, Utensils, User, Tag, CalendarDays, ClipboardList,
  CheckCircle, XCircle, Trash, PlusCircle, DollarSign, Users, Store,
  Clock, MapPin, Navigation, ArrowRight, Layout, Star, Zap, Edit3,
  Activity, Terminal, Save, ChevronRight, CreditCard, Phone,
  Fingerprint, ShieldCheck, TrendingUp, Box, Globe, Search, Filter
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { logout } from '../../features/authSlice';
import InfoModal from '../../components/InfoModal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const RestaurantDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [view, setView] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [allPlatformItems, setAllPlatformItems] = useState([]);
    const [profile, setProfile] = useState({ 
        name: '', ownerName: '', timings: '', bio: '', description: '', location: '',
        payments: { jazzcash: { enabled: false, accountNo: '', name: '' }, easypaisa: { enabled: false, accountNo: '', name: '' }, cod: { enabled: true } },
        tables: []
    });
    const [newItem, setNewItem] = useState({ name: '', price: '', category: '', ingredients: [], imageUrl: '', discount: 0 });
    const [ingredientInput, setIngredientInput] = useState('');
    const [deals, setDeals] = useState([]);
    const [newDeal, setNewDeal] = useState({ title: '', description: '', discountValue: '', price: '', imageUrl: '', items: [] });
    const [itemSearch, setItemSearch] = useState('');
    const [newTable, setNewTable] = useState({ tableNumber: '', tableName: '', capacity: 2, isWindowSeat: false, placement: '', isOrderable: true });
    const [editingItem, setEditingItem] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', description: '', onConfirm: null });

    const openModal = (config) => setModal({ ...config, isOpen: true });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'Restaurant') {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.view-content', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        }, containerRef);
        return () => ctx.revert();
    }, [view]);

    const fetchData = async () => {
        try {
            const { data: myProfile } = await api.get('/restaurants/myprofile');
            setProfile(myProfile);
            const { data: ordersData } = await api.get('/orders/restaurant');
            setOrders(ordersData);
            const { data: resvData } = await api.get('/reservations/restaurant');
            setReservations(resvData);
            const { data: menuData } = await api.get(`/menus/restaurant/${myProfile._id}`);
            setMenuItems(menuData);
            const { data: allItems } = await api.get('/menus');
            setAllPlatformItems(allItems);
            const { data: dealData } = await api.get('/deals');
            setDeals(dealData.filter(d => d.restaurant_id?._id === myProfile._id || d.restaurant_id === myProfile._id));
        } catch (error) { console.error(error); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('/restaurants/myprofile', profile);
            openModal({ type: 'success', title: 'Profile Synced', description: 'Your venue profile has been updated across the network.' });
            fetchData();
        } catch (error) {
            openModal({ type: 'error', title: 'Sync Error', description: error.response?.data?.message || 'Failed to update profile.' });
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/menus/${editingItem._id}`, newItem);
                openModal({ type: 'success', title: 'Dish Updated', description: 'Dish details have been updated.' });
                setEditingItem(null);
            } else {
                await api.post('/menus', newItem);
                openModal({ type: 'success', title: 'Dish Added', description: 'New dish has been added to your menu.' });
            }
            setNewItem({ name: '', price: '', category: '', ingredients: [], imageUrl: '', discount: 0 });
            setIngredientInput('');
            fetchData();
        } catch (error) {
            openModal({ type: 'error', title: 'Error', description: error.response?.data?.message || 'Failed to save dish.' });
        }
    };

    const startEditing = (item) => {
        setEditingItem(item);
        setNewItem({ name: item.name, price: item.price, category: item.category, ingredients: item.ingredients || [], imageUrl: item.imageUrl || '', discount: item.discount || 0 });
        setIngredientInput('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleIngredientInput = (e) => {
        const val = e.target.value;
        if (val.includes(',')) {
            const newTags = val.split(',').map(t => t.trim()).filter(t => t);
            if (newTags.length > 0) setNewItem({ ...newItem, ingredients: [...newItem.ingredients, ...newTags] });
            setIngredientInput('');
        } else { setIngredientInput(val); }
    };

    const removeIngredient = (idx) => setNewItem({ ...newItem, ingredients: newItem.ingredients.filter((_, i) => i !== idx) });

    const sidebarItems = [
        { label: 'Active Orders', icon: <Package size={18}/>, onClick: () => setView('orders'), activeCheck: () => view === 'orders' },
        { label: 'Bookings', icon: <CalendarDays size={18}/>, onClick: () => setView('reservations'), activeCheck: () => view === 'reservations' },
        { label: 'Menu Manager', icon: <Utensils size={18}/>, onClick: () => setView('menu'), activeCheck: () => view === 'menu' },
        { label: 'Floor Layout', icon: <Layout size={18}/>, onClick: () => setView('tables'), activeCheck: () => view === 'tables' },
        { label: 'Promotions', icon: <Tag size={18}/>, onClick: () => setView('deals'), activeCheck: () => view === 'deals' },
        { label: 'Restaurant Profile', icon: <Store size={18}/>, onClick: () => setView('profile'), activeCheck: () => view === 'profile' }
    ];

    const logoutHandler = () => {
        openModal({
            type: 'confirm',
            title: 'Logout?',
            description: 'Are you sure you want to end your session?',
            onConfirm: () => { dispatch(logout()); navigate('/login'); }
        });
    };

    const handleDeleteTable = (tableNum) => {
        openModal({
            type: 'confirm', title: 'Remove Table?', description: `Permanently delete Table ${tableNum}?`,
            onConfirm: async () => {
                const updatedTables = profile.tables.filter(t => t.tableNumber !== tableNum);
                await api.put('/restaurants/myprofile', { ...profile, tables: updatedTables });
                fetchData(); closeModal();
            }
        });
    };

    const handleCreateTable = async (e) => {
        e.preventDefault();
        try {
            const updatedTables = [...profile.tables, { ...newTable, status: 'Available' }];
            await api.put('/restaurants/myprofile', { ...profile, tables: updatedTables });
            setNewTable({ tableNumber: '', tableName: '', capacity: 2, isWindowSeat: false, placement: '', isOrderable: true });
            openModal({ type: 'success', title: 'Table Added', description: `Table ${newTable.tableNumber} is now active on the floor.` });
            fetchData();
        } catch (error) {
            openModal({ type: 'error', title: 'Error', description: 'Failed to add table.' });
        }
    };

    const handleCreateDeal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/deals', newDeal);
            setNewDeal({ title: '', description: '', discountValue: '', price: '', imageUrl: '', items: [] });
            openModal({ type: 'success', title: 'Promotion Live', description: 'Your new offer is now active and visible to all guests.' });
            fetchData();
        } catch (error) {
            openModal({ type: 'error', title: 'Error', description: error.response?.data?.message || 'Failed to create promotion.' });
        }
    };

    const deleteDeal = (id) => {
        openModal({
            type: 'confirm', title: 'Delete Deal?', description: 'This will permanently remove the promotion from your restaurant.',
            onConfirm: async () => {
                try { await api.delete(`/deals/${id}`); fetchData(); closeModal(); }
                catch (error) { openModal({ type: 'error', title: 'Error', description: 'Failed to delete promotion.' }); }
            }
        });
    };

    const toggleItemInDeal = (id) => {
        const isSelected = newDeal.items.includes(id);
        setNewDeal({ ...newDeal, items: isSelected ? newDeal.items.filter(i => i !== id) : [...newDeal.items, id] });
    };

    const deleteItem = (id) => {
        openModal({
            type: 'confirm', title: 'Remove Dish?', description: 'Permanently delist this dish from your menu?',
            onConfirm: async () => { await api.delete(`/menus/${id}`); fetchData(); closeModal(); }
        });
    };

    const updateOrderStatus = async (id, status) => {
        try { 
            await api.put(`/orders/${id}/status`, { status }); 
            toast.success(`Order marked as ${status}`);
            fetchData(); 
        }
        catch (error) { openModal({ type: 'error', title: 'Error', description: error.response?.data?.message || 'Failed to update order.' }); }
    };

    const updateReservationStatus = async (id, status) => {
        try { 
            await api.put(`/reservations/${id}/status`, { status }); 
            toast.success(`Table reservation ${status.toLowerCase()}!`);
            
            // If completed, update table status back to Available
            if (status === 'Completed') {
                const res = reservations.find(r => r._id === id);
                if (res) {
                    const updatedTables = profile.tables.map(t => 
                        t.tableNumber === res.tableNumber ? { ...t, status: 'Available' } : t
                    );
                    await api.put('/restaurants/myprofile', { ...profile, tables: updatedTables });
                }
            }
            
            fetchData(); 
        }
        catch (error) { openModal({ type: 'error', title: 'Error', description: 'Failed to update reservation.' }); }
    };

    if (!profile._id) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Store className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Setting up dashboard...</p>
        </div>
    );

    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected');

    return (
        <div ref={containerRef} className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
            <Sidebar 
                menuItems={sidebarItems} 
                onLogout={logoutHandler} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            
            <main className="flex-1 min-w-0 transition-all duration-500 min-h-screen pt-12 pb-24 px-8 lg:px-12">
                
                {/* Executive Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-px bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Restaurant Dashboard</span>
                        </div>
                        <div>
                            <h1 className="text-4xl lg:text-7xl font-cursive tracking-wider lowercase leading-none text-foreground">
                                {view} <span className="text-primary">Admin.</span>
                            </h1>
                            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] mt-6 opacity-30">
                                Manager: {userInfo?.name} | Restaurant: {profile.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Active Orders</p>
                            <p className="text-4xl font-black italic text-primary">{activeOrders.length}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-primary/5 text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Menu Items</p>
                            <p className="text-4xl font-black italic">{menuItems.length}</p>
                        </div>
                    </div>
                </header>

                <div className="view-content">

                {/* ORDERS HUB */}
                {view === 'orders' && (
                    <div className="space-y-8">
                        {activeOrders.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {activeOrders.map(order => (
                                    <Card key={order._id} className="group relative rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl hover:border-primary/30 transition-all">
                                        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity"><Box className="w-40 h-40"/></div>
                                        <CardContent className="p-10 flex flex-col gap-8 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black tracking-widest mb-3">#{order.trackingId}</Badge>
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{order.customerContact?.name || order.customer_id?.name || 'GUEST USER'}</h3>
                                                    <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest mt-1 flex items-center gap-2 italic"><Phone className="w-3 h-3"/>{order.customerContact?.phone || 'Encrypted'}</p>
                                                </div>
                                                <Badge className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : order.status === 'Preparing' ? 'bg-primary text-black' : 'bg-green-500/20 text-green-500'}`}>{order.status}</Badge>
                                            </div>
                                            <div className="py-6 border-y border-primary/10 border-dashed space-y-3">
                                                {order.items.map((it, idx) => (
                                                    <div key={idx} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-black bg-background p-2 rounded-lg border border-primary/10 text-primary italic">{it.qty}x</span>
                                                            <span className="text-sm font-black uppercase tracking-tight italic">{it.menuItem?.name || 'Removed Item'}</span>
                                                        </div>
                                                        <span className="text-sm font-black italic opacity-50">Rs. {it.price * it.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="text-2xl font-black italic">Rs. {order.totalAmount}</p>
                                                <div className="flex gap-3">
                                                    {order.status === 'Pending' && (<>
                                                        <Button onClick={() => updateOrderStatus(order._id, 'Preparing')} className="h-14 px-6 btn-primary rounded-2xl text-[9px] font-black">START PREPARING</Button>
                                                        <Button onClick={() => updateOrderStatus(order._id, 'Rejected')} variant="ghost" className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"><XCircle size={20}/></Button>
                                                    </>)}
                                                    {order.status === 'Preparing' && <Button onClick={() => updateOrderStatus(order._id, 'Ready')} className="h-14 px-6 btn-primary rounded-2xl text-[9px] font-black">MARK READY</Button>}
                                                    {order.status === 'Ready' && <Button onClick={() => updateOrderStatus(order._id, 'Delivered')} className="h-14 px-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[9px] font-black">DELIVERED <CheckCircle size={16}/></Button>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center border-2 border-dashed border-primary/10 rounded-[5rem]">
                                <Activity size={80} className="text-primary/20 mx-auto mb-8"/>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic opacity-30">No <span className="text-primary not-italic">Orders.</span></h3>
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-4 opacity-20">Standing by for new orders...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* RESERVATIONS */}
                {view === 'reservations' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {reservations.filter(r => r.status !== 'Declined' && r.status !== 'Completed').length > 0 ? reservations.filter(r => r.status !== 'Declined' && r.status !== 'Completed').slice().reverse().map(res => (
                            <Card key={res._id} className="group rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl hover:border-primary/20 transition-all">
                                <CardContent className="p-10 flex flex-col gap-8">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-black text-black italic rotate-6 group-hover:rotate-0 transition-transform">
                                                {(res.guestName || 'G').charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">{res.guestName || res.customer_id?.name}</h4>
                                                <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest mt-1 italic"><Phone className="w-3 h-3 inline mr-1"/>{res.guestPhone || 'Private'}</p>
                                            </div>
                                        </div>
                                        <Badge className={`h-8 px-4 rounded-full text-[9px] font-black uppercase ${res.status === 'Accepted' ? 'bg-primary text-black' : res.status === 'Declined' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'}`}>{res.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-background/50 border border-primary/10">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-2">Table</p>
                                            <p className="text-xl font-black italic">Table #{res.tableNumber}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-background/50 border border-primary/10">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-2">ETA</p>
                                            <p className="text-xl font-black italic">{res.arrivalTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {res.status === 'Pending' && (<>
                                            <Button onClick={() => updateReservationStatus(res._id, 'Accepted')} className="flex-1 h-14 btn-primary rounded-2xl text-[9px] font-black">ACCEPT</Button>
                                            <Button onClick={() => updateReservationStatus(res._id, 'Declined')} variant="ghost" className="flex-1 h-14 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white text-[9px] font-black">DECLINE</Button>
                                        </>)}
                                        {res.status === 'Accepted' && <Button onClick={() => updateReservationStatus(res._id, 'Completed')} className="flex-1 h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[9px] font-black">MARK SEATED</Button>}
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-2 py-40 text-center border-2 border-dashed border-primary/10 rounded-[5rem]">
                                <CalendarDays size={80} className="text-primary/20 mx-auto mb-8"/>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic opacity-30">No <span className="text-primary not-italic">Bookings.</span></h3>
                            </div>
                        )}
                    </div>
                )}

                {/* MENU FORGE */}
                {view === 'menu' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                        {/* Form Panel */}
                        <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl p-10 lg:p-14 sticky top-12">
                            <CardContent className="p-0 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{editingItem ? 'Edit' : 'Add'} <span className="text-primary not-italic">Dish.</span></h3>
                                    {editingItem && <Button variant="ghost" onClick={() => { setEditingItem(null); setNewItem({ name: '', price: '', category: '', ingredients: [], imageUrl: '', discount: 0 }); }} className="text-[9px] font-black uppercase text-destructive">CANCEL EDIT</Button>}
                                </div>
                                <form onSubmit={handleCreateItem} className="space-y-6">
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Dish Name</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold uppercase tracking-tight" placeholder="e.g. Grilled Salmon" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Price (Rs.)</label><Input type="number" className="h-16 rounded-2xl bg-background border-primary/10 font-black text-xl italic" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Discount %</label><Input type="number" className="h-16 rounded-2xl bg-background border-primary/10 font-black text-xl italic" value={newItem.discount} onChange={e => setNewItem({...newItem, discount: e.target.value})}/></div>
                                    </div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Category</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold uppercase" placeholder="e.g. Main Course" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}/></div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex justify-between"><span>Ingredients</span><span className="text-primary">{newItem.ingredients.length} Added</span></label>
                                        <div className="p-4 rounded-2xl bg-background border border-primary/10 cursor-text" onClick={() => document.getElementById('ing-input').focus()}>
                                            <div className="flex flex-wrap gap-2 mb-2">{newItem.ingredients.map((ing, idx) => (<span key={idx} className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black uppercase px-3 py-2 rounded-full border border-primary/20">{ing}<button type="button" onClick={e => { e.stopPropagation(); removeIngredient(idx); }} className="hover:text-destructive ml-1"><XCircle size={12}/></button></span>))}</div>
                                            <input id="ing-input" type="text" className="bg-transparent text-sm font-medium w-full outline-none placeholder:text-muted-foreground/30" placeholder="Type ingredient, press comma..." value={ingredientInput} onChange={handleIngredientInput} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (ingredientInput.trim()) { setNewItem({ ...newItem, ingredients: [...newItem.ingredients, ingredientInput.trim()] }); setIngredientInput(''); }}}}/>
                                        </div>
                                    </div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Image URL</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-medium" placeholder="https://..." value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}/></div>
                                    <Button type="submit" className="w-full h-20 btn-primary rounded-[2rem] text-xl font-black shadow-2xl">{editingItem ? 'SAVE CHANGES' : 'DEPLOY TO MENU'}</Button>
                                </form>
                            </CardContent>
                        </Card>
                        {/* Menu Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8"><Utensils className="w-5 h-5 text-primary"/><h3 className="text-xl font-black uppercase tracking-tight italic">Menu <span className="not-italic text-primary">Items.</span></h3><div className="h-px flex-1 bg-primary/10"/></div>
                            {menuItems.map(item => (
                                <Card key={item._id} className="group rounded-[2.5rem] bg-secondary/30 border-primary/10 hover:border-primary/30 transition-all overflow-hidden shadow-xl">
                                    <CardContent className="p-0 flex">
                                        <div className="w-32 relative overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/> : <div className="w-full h-full bg-primary/10 flex items-center justify-center text-4xl font-black italic text-primary/30">{item.name.charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1 p-10 flex justify-between items-center gap-6">
                                            <div>
                                                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-3">{item.name}</h4>
                                                <div className="flex items-center gap-4"><span className="text-2xl font-black italic text-primary">Rs. {item.price}</span><div className="w-px h-6 bg-primary/20"/><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{item.category}</span></div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Button variant="ghost" onClick={() => startEditing(item)} className="w-12 h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all"><Edit3 size={18}/></Button>
                                                <Button variant="ghost" onClick={() => deleteItem(item._id)} className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"><Trash size={18}/></Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {menuItems.length === 0 && <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[3rem] opacity-30"><Utensils size={60} className="mx-auto mb-4"/><p className="font-black uppercase tracking-tighter italic text-2xl">Menu Vacant.</p></div>}
                        </div>
                    </div>
                )}

                {/* FLOOR PLAN */}
                {view === 'tables' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                        <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 p-10 lg:p-14 sticky top-12 overflow-hidden shadow-2xl">
                            <CardContent className="p-0 space-y-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">Table <span className="text-primary not-italic">Registration.</span></h3>
                                <form onSubmit={handleCreateTable} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Table No.</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-black uppercase" placeholder="T-01" required value={newTable.tableNumber} onChange={e => setNewTable({...newTable, tableNumber: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Table Name</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold" placeholder="e.g. Terrace" value={newTable.tableName} onChange={e => setNewTable({...newTable, tableName: e.target.value})}/></div>
                                    </div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Capacity</label><Input type="number" className="h-16 rounded-2xl bg-background border-primary/10 font-black" required value={newTable.capacity} onChange={e => setNewTable({...newTable, capacity: Number(e.target.value)})}/></div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Dining Area</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold" placeholder="e.g. Main Hall, Area B" value={newTable.placement} onChange={e => setNewTable({...newTable, placement: e.target.value})}/></div>
                                    <label className="flex items-center gap-4 p-5 rounded-2xl bg-background/50 border border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                                        <input type="checkbox" className="w-5 h-5 accent-amber-400" checked={newTable.isWindowSeat} onChange={e => setNewTable({...newTable, isWindowSeat: e.target.checked})}/>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Window Side / Preferred View</span>
                                    </label>
                                    <Button type="submit" className="w-full h-18 btn-primary rounded-[2rem] text-lg font-black shadow-2xl flex items-center justify-center gap-4 h-20 uppercase">Activate Table <PlusCircle size={22}/></Button>
                                </form>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8"><Layout className="w-5 h-5 text-primary"/><h3 className="text-xl font-black uppercase tracking-tight italic">Floor <span className="not-italic text-primary">Layout.</span></h3><div className="h-px flex-1 bg-primary/10"/></div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.tables.slice().reverse().map((table, i) => (
                                    <Card key={i} className="group relative rounded-[3rem] bg-secondary/40 border-primary/10 hover:border-primary/30 transition-all duration-700 overflow-hidden shadow-2xl min-h-[320px] flex flex-col justify-center">
                                        <div className="absolute top-6 right-6"><Button variant="ghost" onClick={() => handleDeleteTable(table.tableNumber)} className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash size={18}/></Button></div>
                                        <CardContent className="p-10 text-center space-y-6">
                                            <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 ${table.status === 'Available' ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground'}`}>
                                                <Users size={32}/>
                                            </div>
                                            <div>
                                                <h4 className="text-3xl font-black uppercase tracking-tighter italic mb-2">{table.tableName || `Table ${table.tableNumber}`}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 italic">{table.placement || 'Main Area'}</p>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 pt-4">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/40 leading-none mb-1">Capacity</span>
                                                    <span className="text-sm font-black uppercase tracking-widest">{table.capacity} Seats</span>
                                                </div>
                                                <Badge className={`text-[9px] font-black uppercase h-8 px-5 rounded-full ${table.status === 'Available' ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground'}`}>{table.status}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {profile.tables.length === 0 && <div className="col-span-2 py-24 text-center border-2 border-dashed border-primary/10 rounded-[3rem] opacity-30"><Layout size={60} className="mx-auto mb-4"/><p className="font-black uppercase tracking-tighter italic text-2xl">No Tables Added.</p></div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* PROMOTIONS */}
                {view === 'deals' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                        <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 p-10 lg:p-14 sticky top-12 overflow-hidden shadow-2xl">
                            <CardContent className="p-0 space-y-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">New <span className="text-primary not-italic">Deal.</span></h3>
                                <form onSubmit={handleCreateDeal} className="space-y-6">
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Title</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold uppercase" placeholder="e.g. Family Feast Bundle" required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Image URL</label><Input className="h-16 rounded-2xl bg-background border-primary/10" placeholder="https://..." value={newDeal.imageUrl} onChange={e => setNewDeal({...newDeal, imageUrl: e.target.value})}/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Discount Badge</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-black text-primary uppercase" placeholder="20% OFF" required value={newDeal.discountValue} onChange={e => setNewDeal({...newDeal, discountValue: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Deal Price</label><Input type="number" className="h-16 rounded-2xl bg-background border-primary/10 font-black italic text-xl" placeholder="0" required value={newDeal.price} onChange={e => setNewDeal({...newDeal, price: e.target.value})}/></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Attach Items</label><span className="text-primary text-[9px] font-black">{newDeal.items.length} selected</span></div>
                                        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40"/><Input className="h-12 pl-10 rounded-2xl bg-background border-primary/10 text-sm" placeholder="Search items..." value={itemSearch} onChange={e => setItemSearch(e.target.value)}/></div>
                                        <div className="max-h-[200px] overflow-y-auto no-scrollbar space-y-1 p-3 rounded-3xl bg-background/50 border border-primary/10">
                                            {allPlatformItems.filter(it => it.name.toLowerCase().includes(itemSearch.toLowerCase()) || it.restaurant_id?.name?.toLowerCase().includes(itemSearch.toLowerCase())).map(item => (
                                                <button key={item._id} type="button" onClick={() => toggleItemInDeal(item._id)} className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${newDeal.items.includes(item._id) ? 'bg-primary text-black' : 'hover:bg-secondary text-muted-foreground'}`}>
                                                    <div><div className={`text-[8px] font-black uppercase tracking-widest ${newDeal.items.includes(item._id) ? 'text-black/60' : 'text-primary/40'}`}>{item.restaurant_id?.name}</div><div className="text-xs font-black uppercase italic">{item.name}</div></div>
                                                    {newDeal.items.includes(item._id) && <CheckCircle size={16}/>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-20 btn-primary rounded-[2rem] text-xl font-black shadow-2xl">CREATE DEAL</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8"><Zap className="w-5 h-5 text-primary"/><h3 className="text-xl font-black uppercase tracking-tight italic">Active <span className="not-italic text-primary">Deals.</span></h3><div className="h-px flex-1 bg-primary/10"/></div>
                            {deals.map(deal => (
                                <Card key={deal._id} className="group rounded-[2.5rem] bg-secondary/30 border-primary/10 hover:border-primary/30 transition-all overflow-hidden shadow-xl">
                                    <CardContent className="p-0 flex">
                                        <div className="w-32 relative flex-shrink-0 overflow-hidden"><img src={deal.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/><div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Badge className="bg-primary text-black text-[8px] font-black">{deal.discountValue}</Badge></div></div>
                                        <div className="flex-1 p-8 flex justify-between items-center gap-4">
                                            <div><h4 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-1">{deal.title}</h4><p className="text-3xl font-black italic text-primary leading-none mt-3">Rs. {deal.price}</p></div>
                                            <Button variant="ghost" onClick={() => deleteDeal(deal._id)} className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white shrink-0"><Trash size={18}/></Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {deals.length === 0 && <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[3rem] opacity-30"><Tag size={60} className="mx-auto mb-4"/><p className="font-black uppercase tracking-tighter italic text-2xl">No Active Campaigns.</p></div>}
                        </div>
                    </div>
                )}

                {/* VENUE PROFILE */}
                {view === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl p-10 lg:p-20">
                            <CardContent className="p-0 space-y-12">
                                <div className="flex items-center gap-4 mb-4"><Store className="w-5 h-5 text-primary"/><h3 className="text-2xl font-black uppercase tracking-tight italic">Restaurant <span className="not-italic text-primary">Profile.</span></h3></div>
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Restaurant Name</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-black uppercase" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Owner Name</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold" placeholder="Full name..." value={profile.ownerName || ''} onChange={e => setProfile({...profile, ownerName: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Operating Hours</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold tracking-widest" placeholder="e.g. 11:00 — 23:00" value={profile.timings || ''} onChange={e => setProfile({...profile, timings: e.target.value})}/></div>
                                        <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Location</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold" placeholder="e.g. Ground Floor, Wing A" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})}/></div>
                                    </div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Tagline</label><Input className="h-16 rounded-2xl bg-background border-primary/10 font-bold italic" placeholder="Your kitchen's essence..." value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Description</label>
                                        <textarea className="w-full min-h-[140px] rounded-3xl bg-background border border-primary/10 p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all no-scrollbar" placeholder="Tell your culinary story..." value={profile.description || ''} onChange={e => setProfile({...profile, description: e.target.value})}/>
                                    </div>
                                    <label className="flex items-center gap-4 p-5 rounded-2xl bg-background/50 border border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                                        <input type="checkbox" className="w-5 h-5 accent-amber-400" checked={profile.payments.cod.enabled} onChange={e => setProfile({...profile, payments: {...profile.payments, cod: { enabled: e.target.checked }}})}/>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accept Cash on Delivery</span>
                                    </label>
                                    <Button type="submit" className="w-full h-20 btn-primary rounded-[2.5rem] text-xl font-black shadow-2xl flex items-center justify-center gap-4">UPDATE PROFILE <Save size={22}/></Button>
                                </form>
                            </CardContent>
                        </Card>
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

export default RestaurantDashboard;
