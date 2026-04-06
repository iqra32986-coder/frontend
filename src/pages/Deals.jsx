import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { 
  Tag, 
  Sparkles, 
  ChevronRight, 
  ShoppingBag, 
  Utensils, 
  X, 
  Star, 
  MapPin, 
  Quote, 
  Zap, 
  Plus, 
  Minus, 
  ArrowRight,
  Activity,
  Layers,
  ArrowUpRight,
  Info,
  Store,
  Search,
  Filter
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import gsap from 'gsap';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const DEFAULT_DEAL_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
const DEFAULT_DISH_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

const AtelierDealItem = ({ item, restName, restId, onAdd }) => {
    return (
        <div key={item._id} className="group flex flex-col p-6 rounded-3xl bg-background/40 border border-primary/5 hover:border-primary/20 transition-all duration-500">
            <div className="w-full h-48 rounded-2xl overflow-hidden flex-shrink-0 relative mb-6">
                <img 
                    src={item.imageUrl || DEFAULT_DISH_IMAGE} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 w-full flex flex-col">
                <div className="text-left mb-6">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-1 leading-none">{item.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">From: {restName || 'Restaurant Partner'}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black italic tracking-tighter text-primary">Rs. {item.price}</span>
                    <Button 
                        size="sm" 
                        onClick={() => onAdd(item, restName, restId, 1)} 
                        className="h-10 px-6 rounded-xl bg-secondary hover:bg-primary hover:text-black text-[9px] font-black transition-all shadow-xl"
                    >
                        ADD
                    </Button>
                </div>
            </div>
        </div>
    );
};
 
const Deals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [reviews, setReviews] = useState([]);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const drawerRef = useRef(null);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const { data } = await api.get('/deals');
                setDeals(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    // Page entrance animation
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.deal-header', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
            );
            gsap.fromTo('.deal-card', 
                { opacity: 0, y: 40 }, 
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading]);

    // Drawer animation
    useEffect(() => {
        if (selectedDeal) {
            gsap.fromTo(drawerRef.current, 
                { x: '100%', opacity: 0 }, 
                { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }
            );
        }
    }, [selectedDeal]);

    const fetchReviews = async (restId) => {
        try {
            const { data } = await api.get(`/reviews/restaurant/${restId}`);
            setReviews(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBrowseMenu = (deal) => {
        setSelectedDeal(deal);
        if (deal.restaurant_id?._id || deal.restaurant_id) {
            fetchReviews(deal.restaurant_id?._id || deal.restaurant_id);
        }
    };

    const handleAdd = (item, restName, restId, qty = 1) => {
        dispatch(addToCart({
            menuItem: item._id,
            restaurant_id: restId,
            restaurant_name: restName,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: qty
        }));
    };

    const handleAddDeal = () => {
        if (!selectedDeal) return;
        dispatch(addToCart({
            dealId: selectedDeal._id,
            isDeal: true,
            restaurant_id: selectedDeal.restaurant_id?._id,
            restaurant_name: selectedDeal.restaurant_id?.name || 'Platform Deal',
            name: selectedDeal.title,
            price: selectedDeal.price,
            imageUrl: selectedDeal.imageUrl || DEFAULT_DEAL_IMAGE,
            qty: 1
        }));
        setSelectedDeal(null);
    };

    const categories = ['All', ...new Set(deals.map(d => d.type).filter(Boolean))];

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase()) || 
                                 deal.restaurant_id?.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || deal.type === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [deals, search, selectedCategory]);

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Tag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting offers ready...</p>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black pb-32">
            
            {/* Dynamic Background Element */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            {/* --- DEAL DETAILS OVERLAY (DRAWER) --- */}
            {selectedDeal && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div 
                        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setSelectedDeal(null)} 
                    />
                    
                    <div 
                        ref={drawerRef}
                        className="relative w-full max-w-5xl h-full bg-background border-l border-primary/10 shadow-3xl flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar"
                    >
                        {/* Main Content Area */}
                        <div className="flex-1 lg:h-full lg:overflow-y-auto no-scrollbar p-6 lg:p-16 flex flex-col shrink-0">
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedDeal(null)} 
                                className="w-14 h-14 rounded-2xl bg-secondary/50 border border-primary/10 mb-12 hover:bg-destructive hover:text-white transition-all self-start"
                            >
                                <X size={24}/>
                            </Button>
                            
                            <div className="mb-16 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Store className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-black uppercase tracking-widest text-primary">
                                           From: {selectedDeal.restaurant_id?.name || 'Exclusive Partner'}
                                        </span>
                                    </div>
                                    <h2 className="text-6xl lg:text-8xl font-cursive tracking-widest lowercase leading-none">{selectedDeal.title}</h2>
                                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-40">This exclusive deal is available for a limited time.</p>
                                </div>
                                
                                <Button 
                                    onClick={handleAddDeal}
                                    className="h-20 px-10 btn-primary rounded-[2rem] text-xl font-black shadow-2xl flex items-center justify-between w-full lg:w-auto group"
                                >
                                    GET COMPLETE DEAL <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </div>
 
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedDeal.items?.map((item) => (
                                    <AtelierDealItem 
                                        key={item._id} 
                                        item={item} 
                                        restName={selectedDeal.restaurant_id?.name} 
                                        restId={selectedDeal.restaurant_id?._id} 
                                        onAdd={handleAdd} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Lateral Info Panel */}
                        <div className="w-full lg:w-96 bg-secondary/30 lg:border-l border-t lg:border-t-0 border-primary/5 flex flex-col p-6 lg:p-12 lg:h-full lg:overflow-y-auto no-scrollbar shrink-0">
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <Info className="w-4 h-4 text-primary" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Restaurant Details</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter italic leading-tight mb-4">{selectedDeal.restaurant_id?.name}</h4>
                                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest bg-background/50 p-4 rounded-xl border border-primary/10">
                                    <MapPin size={16} className="text-primary"/> {selectedDeal.restaurant_id?.location || 'Main Location'}
                                </div>
                            </div>
 
                            <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0">Customer Reviews</h5>
                                    <Badge className="bg-primary/20 text-primary border-0 rounded-full px-4">{reviews.length}</Badge>
                                </div>

                                <div className="space-y-6">
                                    {reviews.map((rev) => (
                                        <div key={rev._id} className="p-8 rounded-[2.5rem] bg-background border border-primary/5 relative group overflow-hidden">
                                            <Quote size={60} className="absolute -top-4 -left-4 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                                            <div className="flex items-center gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        fill={i < rev.rating ? "currentColor" : "none"} 
                                                        className={i < rev.rating ? "text-primary" : "text-muted-foreground/20"}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm font-medium italic leading-relaxed text-foreground/80 mb-6">"{rev.comment}"</p>
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary italic">
                                                     {rev.user_id?.name?.charAt(0) || 'A'}
                                                 </div>
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">— {rev.user_id?.name || 'Verified Guest'}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && (
                                        <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-[3rem] opacity-30">
                                            <Activity size={40} className="mx-auto mb-4"/>
                                            <p className="text-xs font-black uppercase tracking-widest">No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CATALOG VIEW --- */}
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32">
                
                {/* Header Section */}
                <div className="deal-header mb-24 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Curated Selections</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                                Prime <span className="text-primary italic">Deals.</span>
                            </h2>
                            <div className="flex items-center gap-3 mt-4">
                                <Store className="w-4 h-4 text-primary" />
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-60">
                                    Powered by <span className="text-primary opacity-100">SmartDine Network</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            <div className="relative w-full sm:w-80 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                <Input 
                                    type="text" 
                                    placeholder="Search deals or restaurants..." 
                                    className="pl-14 h-16 rounded-[2rem] bg-secondary/30 border-primary/10 transition-all font-bold text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="w-full lg:w-auto overflow-hidden">
                                <Swiper
                                    slidesPerView="auto"
                                    spaceBetween={8}
                                    loop={true}
                                    className="w-full"
                                >
                                    {categories.map((cat) => (
                                        <SwiperSlide key={cat} style={{ width: 'auto' }}>
                                            <button
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap block border ${
                                                    selectedCategory === cat
                                                        ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105'
                                                        : 'bg-secondary/50 text-muted-foreground border-primary/5 hover:bg-secondary hover:border-primary/20'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
                    {filteredDeals.map((deal) => (
                        <Card key={deal._id} className="deal-card group relative rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-2xl hover:border-primary/40 transition-all duration-700">
                            
                            {/* Cinematic Visual */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img 
                                    src={deal.imageUrl || DEFAULT_DEAL_IMAGE} 
                                    alt={deal.title} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                
                                {/* Badge Overlay */}
                                <div className="absolute top-8 left-8 flex items-center gap-2">
                                     <div className="px-5 py-2.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center gap-2">
                                         <Zap size={12} className="animate-pulse" /> {deal.discountValue}
                                     </div>
                                </div>

                                {/* Floating Store Tag */}
                                <div className="absolute bottom-10 left-10 right-10">
                                     <Link to={`/restaurant-view/${deal.restaurant_id?._id}`} className="group/link inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:text-black transition-all mb-4">
                                         <MapPin size={12} />
                                         <span className="text-[9px] font-black uppercase tracking-widest">{deal.restaurant_id?.name || 'Authorized Venue'}</span>
                                     </Link>
                                     <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-white transition-transform group-hover:-translate-y-1">{deal.title}</h3>
                                </div>
                            </div>
  
                            {/* Card Details */}
                            <CardContent className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black italic tracking-tighter">Rs. {deal.price || 'COMMUNICATION ERROR'}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="w-10 h-10 rounded-xl bg-background border-2 border-secondary overflow-hidden shadow-xl scale-9 group-hover:scale-100 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                                                    <img src={deal.items?.[i]?.imageUrl || DEFAULT_DISH_IMAGE} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {deal.items?.length > 3 && (
                                                 <div className="w-10 h-10 rounded-xl bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-black italic">
                                                     +{deal.items.length - 3}
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm font-medium italic leading-relaxed text-muted-foreground opacity-60 line-clamp-2">
                                    "{deal.description}"
                                </p>
                                
                                <Button 
                                    onClick={() => handleBrowseMenu(deal)}
                                    className="w-full h-18 bg-secondary/80 border border-primary/10 hover:bg-primary hover:text-black hover:border-primary rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-between px-10 group"
                                >
                                    <span>VIEW DETAILS</span> <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredDeals.length === 0 && (
                    <div className="py-40 text-center space-y-10 border-2 border-dashed border-primary/10 rounded-[5rem] animate-pulse">
                        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/10">
                             <Layers size={40} className="text-primary/20"/>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic opacity-30">No Current <span className="not-italic text-primary">Offers.</span></h3>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] max-w-xs mx-auto opacity-20">We're currently updating our selection. Please check back later for new exclusive deals.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;
