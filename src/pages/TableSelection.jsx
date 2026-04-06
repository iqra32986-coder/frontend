import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Users, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Info, 
  Armchair, 
  Activity, 
  ArrowLeft,
  Navigation,
  Box,
  Compass,
  ArrowRight
} from 'lucide-react';
import { setSelectedTable } from '../features/cartSlice';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

import { Badge } from '../components/ui/Badge';
import { addToCart } from '../features/cartSlice';
import { Search, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';

const TableSelection = () => {
    const { cartItems, selectedTable } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme } = useThemeStore();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [activeSidebarTab, setActiveSidebarTab] = useState('menu'); // 'info' or 'menu'
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    // Get the restaurant ID from URL or the first selected item in cart
    const urlRestaurantId = searchParams.get('restaurantId');
    const urlTableNumber = searchParams.get('tableNumber');
    
    const selectedItems = cartItems.filter(item => item.selected);
    const restaurantId = urlRestaurantId || (selectedItems.length > 0 ? selectedItems[0].restaurant_id : null);

    useEffect(() => {
        console.log('TableSelection mounted. restaurantId:', restaurantId, 'urlTableNumber:', urlTableNumber);
        
        if (!restaurantId) {
            console.warn('No restaurantId found, navigating back to explore-tables');
            navigate('/explore-tables');
            return;
        }

        const fetchRestaurantAndMenu = async () => {
            try {
                setLoading(true);
                console.log('Fetching restaurant info for:', restaurantId);
                const { data: resData } = await api.get(`/restaurants/${restaurantId}`);
                console.log('Restaurant data received:', resData.name);
                setRestaurant(resData);
                
                console.log('Fetching menu items for:', restaurantId);
                const { data: menuData } = await api.get(`/menus/restaurant/${restaurantId}`);
                setMenu(menuData);
                console.log('Menu items received:', menuData.length);
                
                // If a table number was passed in URL, auto-select it
                if (urlTableNumber && resData.tables) {
                    const table = resData.tables.find(t => t.tableNumber === urlTableNumber);
                    if (table) {
                        console.log('Auto-selecting table from URL:', urlTableNumber);
                        dispatch(setSelectedTable(table));
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching restaurant data in TableSelection:", error);
                setLoading(false);
            }
        };
        fetchRestaurantAndMenu();
    }, [restaurantId, navigate, urlTableNumber, dispatch]);


    const filteredMenu = menu.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddToCart = (item) => {
        dispatch(addToCart({
            menuItem: item._id,
            restaurant_id: restaurantId,
            restaurant_name: restaurant.name,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: 1
        }));
    };

    // Entrance Animations
    useEffect(() => {
        if (loading || !restaurant) return;
        
        const ctx = gsap.context(() => {
            gsap.fromTo('.table-card', 
                { opacity: 0, scale: 0.9, y: 20 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }
            );
            gsap.fromTo('.sidebar-module', 
                { opacity: 0, x: 20 }, 
                { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading, restaurant]);

    const handleSelect = (table) => {
        dispatch(setSelectedTable(table));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting tables ready...</p>
            </div>
        );
    }

    if (!restaurant) return null;

    return (
        <div ref={containerRef} className="bg-background min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* Header Section */}
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                       <Button 
                          variant="ghost" 
                          onClick={() => navigate('/cart')}
                          className="group rounded-2xl bg-secondary/50 border border-primary/5 text-muted-foreground hover:text-primary transition-all px-6 h-12"
                       >
                           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Cart
                       </Button>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Table Reservation</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                                Reserve <span className="text-primary italic">Your Table.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                Select your preferred table at <span className="text-foreground font-bold">{restaurant.name}</span>. Available tables are updated in real-time.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Tables Grid Flow */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="space-y-6">
                             <div className="flex items-center gap-4 px-4 mb-8">
                                <Activity className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Available <span className="font-cursive lowercase text-primary">Tables.</span></h3>
                                <div className="h-px flex-1 bg-border/50" />
                                <Badge variant="outline" className="bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border-primary/20">Live Status</Badge>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {restaurant.tables?.filter(t => t.status === 'Available').map((table) => (
                                    <Card 
                                        key={table.tableNumber}
                                        onClick={() => handleSelect(table)}
                                        className={`table-card group relative rounded-[3rem] cursor-pointer transition-all duration-700 border-2 overflow-hidden shadow-xl ${
                                            selectedTable?.tableNumber === table.tableNumber 
                                            ? 'bg-primary/10 border-primary shadow-primary/10 scale-[1.02]' 
                                            : 'bg-secondary/30 border-transparent hover:border-primary/20 hover:bg-secondary/50'
                                        }`}
                                    >
                                        <CardContent className="p-8">
                                            {selectedTable?.tableNumber === table.tableNumber && (
                                                <div className="absolute top-6 right-6">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center animate-bounce">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mb-8">
                                                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ${
                                                    selectedTable?.tableNumber === table.tableNumber 
                                                    ? 'bg-primary text-black rotate-12 shadow-2xl' 
                                                    : 'bg-background text-primary/40 group-hover:rotate-12 group-hover:text-primary group-hover:bg-primary/5'
                                                }`}>
                                                    <Armchair size={32} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-none truncate">
                                                    {table.tableName || `Table ${table.tableNumber}`}
                                                </h3>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-primary/60" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{table.capacity} Person Configuration</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-primary/60" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{table.placement || 'Standard Sector'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8 pt-6 border-t border-primary/5 flex justify-between items-center">
                                                <Badge className="bg-primary/5 text-primary text-[8px] font-black border-primary/10">READY</Badge>
                                                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">#{table.tableNumber}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {restaurant.tables?.filter(t => t.status === 'Available').length === 0 && (
                                    <div className="col-span-1 sm:col-span-2 xl:col-span-3 py-20 text-center opacity-50 space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-destructive text-white flex items-center justify-center mx-auto shadow-xl">
                                            <AlertCircle size={32}/>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-destructive">Hall is Full.</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Place to Sit. Tables will be empty in 5 minutes.</p>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </section>
                    </div>

                    {/* Meta Sidebar Module */}
                    <div className="lg:col-span-4 sticky top-32">
                        <Card className="sidebar-module relative rounded-[3.5rem] bg-secondary/80 backdrop-blur-3xl border-primary/20 overflow-hidden shadow-2xl shadow-primary/5">
                            <CardContent className="p-10 relative z-10 flex flex-col h-[75vh]">
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-2 p-1.5 bg-background/50 rounded-2xl border border-primary/10">
                                        <button 
                                            onClick={() => setActiveSidebarTab('menu')}
                                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSidebarTab === 'menu' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Order Menu
                                        </button>
                                        <button 
                                            onClick={() => setActiveSidebarTab('info')}
                                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSidebarTab === 'info' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Table Info
                                        </button>
                                    </div>
                                    {cartItems.length > 0 && (
                                        <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black">{cartItems.length} Items</Badge>
                                    )}
                                </div>

                                {activeSidebarTab === 'menu' ? (
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="relative mb-6">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                            <Input 
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search dishes..."
                                                className="pl-12 h-12 bg-background/50 border-primary/10 rounded-2xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                            {filteredMenu.map(item => (
                                                <div key={item._id} className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-primary/5 hover:border-primary/20 transition-all group">
                                                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"} alt={item.name} className="w-14 h-14 rounded-2xl object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[11px] font-black uppercase tracking-tight truncate">{item.name}</h4>
                                                        <p className="text-[10px] font-bold text-primary italic">rs.{item.price.toFixed(0)}</p>
                                                    </div>
                                                    <Button 
                                                        onClick={() => handleAddToCart(item)}
                                                        size="icon-sm" 
                                                        className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black transition-all"
                                                    >
                                                        <Plus size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                            {filteredMenu.length === 0 && (
                                                <div className="py-20 text-center opacity-30">
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No menu items match your search.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col">
                                         <div className="min-h-[250px] flex flex-col justify-center items-center mb-12 border-2 border-dashed border-primary/10 rounded-[3rem] p-10 bg-background/30">
                                            {!selectedTable ? (
                                                <div className="text-center space-y-4">
                                                    <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                                                    <Armchair size={40} className="text-muted-foreground/20" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">Select a table to proceed with your reservation</p>
                                                </div>
                                            ) : (
                                                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Active Configuration</span>
                                                        <p className="text-4xl font-black tracking-tighter italic uppercase text-foreground leading-none">{selectedTable.tableName || `Table ${selectedTable.tableNumber}`}</p>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div className="p-6 rounded-[1.8rem] bg-background/50 border border-primary/10">
                                                            <Users size={20} className="text-primary mb-3" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Capacity</span>
                                                            <p className="text-xl font-black tracking-tighter italic">{selectedTable.capacity} People</p>
                                                        </div>
                                                        <div className="p-6 rounded-[1.8rem] bg-background/50 border border-primary/10">
                                                            <MapPin size={20} className="text-primary mb-3" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Area</span>
                                                            <p className="text-xl font-black tracking-tighter italic truncate">{selectedTable.placement || 'Standard'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-8 space-y-6">
                                    <div className="p-6 rounded-[2.5rem] bg-background/50 border border-primary/10 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Grand Total</p>
                                            <p className="text-3xl font-black tracking-tighter italic">Rs. {cartItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(0)}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>

                                    <Button 
                                        disabled={!selectedTable || cartItems.length === 0}
                                        onClick={() => navigate('/billing')}
                                        className="w-full btn-primary h-24 text-2xl font-black shadow-2xl flex items-center justify-between px-12 group overflow-hidden"
                                    >
                                        <span className="relative z-10">Proceed to Checkout</span>
                                        <ArrowRight size={32} className="relative z-10 group-hover:translate-x-3 transition-transform opacity-40 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableSelection;
