import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Package, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  Timer, 
  AlertCircle,
  Hash,
  Activity,
  ArrowUpRight,
  Monitor,
  History,
  ArrowRight,
  Store,
  Navigation,
  Globe,
  Trash2,
  HelpCircle
} from 'lucide-react';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const MyOrders = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    
    const containerRef = useRef(null);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/myorders');
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchOrders();
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, [userInfo, navigate]);

    // Entrance Animations
    useEffect(() => {
        if (loading || orders.length === 0) return;
        
        const ctx = gsap.context(() => {
            gsap.fromTo('.order-header', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
            gsap.fromTo('.order-card', 
                { opacity: 0, y: 15 }, 
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading, orders.length > 0]);

    const getElapsedTime = (orderDate) => {
        const start = new Date(orderDate);
        const diff = currentTime - start;
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting your orders...</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="bg-background min-h-screen pt-32 pb-24 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <header className="order-header mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Your Order History</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                            My <span className="text-primary italic">Orders.</span>
                        </h2>
                            <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                Track your active and previous orders here. Stay updated on your meal's progress in real-time.
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-2 animate-pulse">
                                <Activity className="w-3 h-3" /> Live Time
                            </span>
                            <span className="text-4xl md:text-5xl font-black tracking-tighter italic font-mono opacity-80">{currentTime.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {orders.map((order) => {
                        const isPending = order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Pending';
                        return (
                            <Card 
                                key={order._id} 
                                className="order-card group relative rounded-[3.5rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl transition-all duration-700 hover:border-primary/30"
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:-rotate-12 transition-all duration-1000">
                                   <Package className="w-64 h-64" />
                                </div>
                                
                                <CardContent className="p-10 lg:p-14 relative z-10 flex flex-col gap-10">
                                    {/* Order Meta Protocol */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                               <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest h-8 px-4 flex items-center gap-2">
                                                  <Hash className="w-3 h-3" /> {order.trackingId}
                                               </Badge>
                                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                               <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center rotate-6 shadow-2xl shadow-primary/20 transition-transform group-hover:rotate-0">
                                                  <Store className="w-6 h-6 text-black" />
                                               </div>
                                               <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{order.restaurant_id?.name || 'Restaurant'}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                           <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${
                                               isPending 
                                               ? 'bg-primary border-primary text-black' 
                                               : 'bg-background/50 border-primary/10 text-muted-foreground'
                                           }`}>
                                              {isPending && <Activity className="w-4 h-4 animate-spin" />}
                                              <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">{order.status.toUpperCase()}</span>
                                           </div>
                                        </div>
                                    </div>

                                    {/* Unit Selection Manifest */}
                                    <div className="py-8 border-y border-primary/10 border-dashed">
                                        <div className="space-y-4">
                                            {order.items.slice(0, 3).map((it, idx) => (
                                                <div key={idx} className="flex items-center justify-between group/item">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-xl bg-background border border-primary/10 flex items-center justify-center text-xs font-black italic text-primary group-hover/item:scale-110 transition-transform">
                                                            {it.qty}x
                                                        </div>
                                                        <p className="text-md font-black uppercase tracking-tight text-foreground/80">{it.menuItem?.name || 'Item'}</p>
                                                    </div>
                                                    <p className="text-md font-black tracking-tighter italic opacity-50">Rs. {it.price}</p>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 ml-16">+ {order.items.length - 3} Additional Items</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Operational Stats */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2 p-6 rounded-3xl bg-background/50 border border-primary/10">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                                               <Timer className="w-3 h-3" /> Time Elapsed
                                            </span>
                                            <p className="text-2xl font-black tracking-tighter italic tabular-nums font-mono">
                                               {isPending ? getElapsedTime(order.createdAt) : 'COMPLETED'}
                                            </p>
                                        </div>
                                        <div className="space-y-2 p-6 rounded-3xl bg-background/50 border border-primary/10">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Settlement</span>
                                            <p className="text-2xl font-black tracking-tighter italic">Rs. {order.totalAmount}</p>
                                        </div>
                                    </div>

                                    {/* Executive Actions */}
                                    <Button 
                                        onClick={() => navigate(`/track?id=${order.trackingId}`)}
                                        className="w-full h-20 btn-primary px-10 flex items-center justify-between text-xl font-black shadow-2xl group/btn overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                           <Navigation className="w-6 h-6 animate-pulse group-hover/btn:rotate-45 transition-transform" />
                                           <span>Track Order</span>
                                        </div>
                                        <ArrowUpRight size={28} className="relative z-10 opacity-40 group-hover/btn:opacity-100 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-all" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {orders.length === 0 && (
                    <div className="py-48 text-center border-2 border-dashed border-primary/10 rounded-[5rem] flex flex-col items-center gap-10 animate-in zoom-in-95 duration-1000">
                        <div className="relative">
                           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                           <div className="relative w-32 h-32 rounded-full bg-secondary flex items-center justify-center border border-primary/10">
                              <History className="w-14 h-14 text-primary/30" />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-5xl font-black uppercase tracking-tighter italic">No <span className="text-primary not-italic">Orders.</span></h3>
                           <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[11px] max-w-sm mx-auto leading-relaxed">You haven't placed any orders yet. Start your gourmet experience today.</p>
                        </div>
                        <Button 
                            onClick={() => navigate('/')} 
                            className="btn-primary px-16 h-20 text-xl shadow-2xl flex items-center gap-6 group"
                        >
                            Order Now <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
