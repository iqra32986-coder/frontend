import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Search, 
  Package, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Activity, 
  Navigation, 
  Box, 
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  History,
  Terminal,
  Store
} from 'lucide-react';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const statusSteps = [
    { id: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Your order has been verified and assigned to the kitchen.' },
    { id: 'Preparing', label: 'In Preparation', icon: ChefHat, desc: 'Our chefs are currently preparing your selection.' },
    { id: 'Ready', label: 'Order Ready', icon: Package, desc: 'Your order is ready for delivery.' },
    { id: 'Delivered', label: 'Delivered', icon: Box, desc: 'Order delivered successfully.' }
];

const TrackOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const [trackingId, setTrackingId] = useState('');
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const containerRef = useRef(null);
    const orderRef = useRef(null);

    // Initial check for URL query params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const idFromUrl = queryParams.get('id');
        if (idFromUrl) {
            setTrackingId(idFromUrl);
            handleTrack(idFromUrl);
        }
    }, [location.search]);

    // Entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.track-header', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
            gsap.fromTo('.search-module', 
                { opacity: 0, scale: 0.95 }, 
                { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'power4.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleTrack = async (idToTrack) => {
        const id = idToTrack || trackingId;
        if (!id) return;
        
        setLoading(true);
        setError('');
        
        try {
            const { data } = await api.get(`/orders/track/${id}`);
            
            // GSAP transition if switching orders
            if (order) {
                gsap.to(orderRef.current, {
                    opacity: 0,
                    x: -20,
                    duration: 0.4,
                    onComplete: () => {
                        setOrder(data);
                        gsap.fromTo(orderRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.6 });
                    }
                });
            } else {
                setOrder(data);
                setTimeout(() => {
                    gsap.fromTo(orderRef.current, 
                        { opacity: 0, y: 30 }, 
                        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
                    );
                }, 100);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Order ID not found.');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStatusIndex = (status) => {
        return statusSteps.findIndex(s => s.id === status);
    };

    return (
        <div ref={containerRef} className="bg-background min-h-screen pt-32 pb-24 px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
                <header className="track-header mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Live Tracking</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                            Track <span className="text-primary italic">Order.</span>
                        </h2>
                            <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                Real-time updates from our Restaurant Network. Monitor your delivery from our kitchen to your table.
                            </p>
                        </div>
                        <Button 
                           variant="ghost" 
                           onClick={() => navigate('/myorders')}
                           className="group rounded-2xl bg-secondary/50 border border-primary/5 text-muted-foreground hover:text-primary transition-all px-8 h-14"
                        >
                           <History className="w-4 h-4 mr-2 group-hover:-rotate-45 transition-transform" /> Order History
                        </Button>
                    </div>
                </header>

                {/* Track Your Order */}
                <Card className="search-module rounded-[3rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl mb-16 relative">
                    <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                       <Navigation className="absolute -right-20 -bottom-20 w-80 h-80 rotate-12" />
                    </div>
                    <CardContent className="p-10 relative z-10 flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-4 w-full">
                            <label className="text-[11px] font-black uppercase tracking-widest text-primary/60 ml-4 flex items-center gap-2">
                               <ShieldCheck className="w-3 h-3" /> Order Tracking ID
                            </label>
                            <div className="relative group">
                                <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:animate-pulse" />
                                <Input 
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    placeholder="Enter Order ID (e.g., ORD-739210-XC)"
                                    className="h-20 pl-16 pr-10 rounded-[2rem] bg-background border-primary/10 text-xl font-black tracking-tighter uppercase focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={() => handleTrack()} 
                            disabled={loading || !trackingId}
                            className="h-20 px-12 btn-primary text-xl font-black rounded-[2rem] shadow-2xl flex items-center gap-4 group"
                        >
                            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <>TRACK ORDER <Search className="w-6 h-6 group-hover:scale-125 transition-transform" /></>}
                        </Button>
                    </CardContent>
                </Card>

                {error && (
                    <div className="mb-12 p-8 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-6 animate-in slide-in-from-bottom-4">
                        <Terminal className="w-10 h-10 flex-shrink-0" />
                        <div>
                           <p className="text-xl font-black uppercase tracking-tight leading-none mb-1">Not Found.</p>
                           <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{error}</p>
                        </div>
                    </div>
                )}

                {/* Order Status View */}
                {order && (
                    <div ref={orderRef} className="space-y-12">
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            
                            {/* Live Order Status */}
                            <div className="md:col-span-12">
                                <Card className="rounded-[4rem] bg-secondary/50 border-primary/20 overflow-hidden shadow-2xl">
                                    <CardContent className="p-12 lg:p-20">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative">
                                            {/* Connecting Line */}
                                            <div className="absolute top-10 left-0 right-0 h-1 bg-primary/10 hidden md:block" />
                                            <div 
                                                className="absolute top-10 left-0 h-1 bg-primary transition-all duration-1000 hidden md:block" 
                                                style={{ width: `${(getCurrentStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                                            />
                                            
                                            {statusSteps.map((step, idx) => {
                                                const isActive = getCurrentStatusIndex(order.status) >= idx;
                                                const isCurrent = getCurrentStatusIndex(order.status) === idx;
                                                return (
                                                    <div key={idx} className="relative z-10 flex flex-col items-center text-center gap-4 group">
                                                        <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl ${
                                                            isActive 
                                                            ? 'bg-primary text-black scale-110 rotate-12' 
                                                            : 'bg-background border border-primary/10 text-primary/20'
                                                        }`}>
                                                            <step.icon size={32} />
                                                            {isCurrent && <div className="absolute inset-0 bg-primary/40 blur-2xl animate-pulse -z-10 rounded-full" />}
                                                        </div>
                                                        <div>
                                                           <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground/30'}`}>{step.label}</p>
                                                            {isCurrent && <Badge className="bg-primary/20 text-primary text-[8px] font-black uppercase animate-bounce">CURRENT STATUS</Badge>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="mt-20 p-10 bg-background/50 rounded-[3rem] border border-primary/10 border-dashed text-center">
                                           <div className="flex justify-center mb-6">
                                              <Activity className="w-12 h-12 text-primary animate-pulse" />
                                           </div>
                                           <h4 className="text-3xl font-black uppercase tracking-tighter italic mb-3">
                                               Current Status: <span className="text-primary not-italic">{order.status}</span>
                                           </h4>
                                           <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] max-w-sm mx-auto opacity-60 leading-relaxed">
                                               {statusSteps[getCurrentStatusIndex(order.status)]?.desc || 'Update in progress. Please wait.'}
                                           </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Details */}
                            <div className="md:col-span-8">
                                <header className="flex items-center gap-4 mb-8">
                                   <Box className="w-5 h-5 text-primary" />
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">Your <span className="not-italic text-primary">Order.</span></h3>
                                   <div className="h-px flex-1 bg-border/50" />
                                </header>
                                
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <Card key={idx} className="rounded-[2rem] bg-secondary/30 border-transparent hover:border-primary/20 transition-all duration-500 overflow-hidden shadow-xl group">
                                            <CardContent className="p-8 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                   <div className="w-16 h-16 bg-background rounded-2xl shadow-xl flex items-center justify-center text-xl font-black text-primary italic border border-primary/10 group-hover:scale-110 transition-transform">
                                                      {item.qty}x
                                                   </div>
                                                   <div>
                                                       <p className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 italic">{item.menuItem?.name || 'Item'}</p>
                                                       <Badge variant="ghost" className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Price: Rs. {item.price}</Badge>
                                                   </div>
                                                </div>
                                                <div className="text-right">
                                                   <p className="text-3xl font-black tracking-tighter italic leading-none">Rs. {(item.qty * item.price).toFixed(2)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Order Info Sidebar */}
                            <div className="md:col-span-4">
                                <header className="flex items-center gap-4 mb-8">
                                   <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">Order <span className="not-italic text-primary">Info.</span></h3>
                                   <div className="h-px flex-1 bg-border/50" />
                                </header>
                                
                                <Card className="rounded-[3rem] bg-secondary border-primary/20 overflow-hidden shadow-2xl p-10 space-y-10 sticky top-32">
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2 mb-2">
                                          <Store className="w-4 h-4 text-primary" />
                                           <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Kitchen</span>
                                       </div>
                                       <p className="text-3xl font-black tracking-tighter italic uppercase leading-none truncate">{order.restaurant_id?.name || 'KITCHEN'}</p>
                                    </div>
                                    
                                    <div className="h-px w-full bg-primary/10" />
                                    
                                    <div className="space-y-8">
                                       <div className="flex justify-between items-end">
                                          <div className="space-y-1">
                                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Total Amount</span>
                                             <p className="text-5xl font-black tracking-tighter italic leading-none">Rs. {order.totalAmount.toFixed(2)}</p>
                                          </div>
                                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                             <TrendingUp className="w-7 h-7 text-primary" />
                                          </div>
                                       </div>
                                       
                                       <div className="flex items-center gap-4 p-6 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-center justify-center">
                                          <CheckCircle2 size={24} className="animate-pulse" />
                                           <span className="text-sm">Payment Confirmed</span>
                                       </div>
                                    </div>
                                    
                                    <div className="pt-4 flex gap-4 p-6 rounded-2xl bg-background/50 border border-primary/5 items-center">
                                       <Activity className="w-6 h-6 text-primary flex-shrink-0" />
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wide italic">Secure payment confirmed. Your driver is on the way.</p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
