import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import api from '../api';
import { 
  Scale, 
  Search, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Award,
  Box,
  Layers,
  ArrowUpRight,
  Star,
  MapPin,
  Store
} from 'lucide-react';
import gsap from 'gsap';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const DEFAULT_ITEM_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

const Compare = () => {
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [comparedItems, setComparedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data } = await api.get('/menus');
                setItems(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching items", error);
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Page Entrance
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.compare-header', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setComparedItems([]);
            return;
        }

        setIsAnalyzing(true);
        setComparedItems([]);

        // Comparison Animation Sequence
        setTimeout(() => {
            const lowerQuery = searchQuery.toLowerCase().trim();
            const matches = items.filter(i => 
                i.name.toLowerCase().includes(lowerQuery) || 
                (i.category && i.category.toLowerCase().includes(lowerQuery))
            );
            
            matches.sort((a,b) => a.price - b.price);
            setComparedItems(matches.slice(0, 2)); // Take top 2
            setIsAnalyzing(false);
            
            // Result Entrance
            gsap.fromTo('.comparison-grid', 
                { opacity: 0, scale: 0.98 }, 
                { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }
            );
        }, 1500);
    };

    const handleAdd = (item) => {
        dispatch(addToCart({
            menuItem: item._id,
            restaurant_id: item.restaurant_id?._id || item.restaurant_id,
            restaurant_name: item.restaurant_id?.name || 'Authorized Venue',
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: 1
        }));
    };

    const renderComparisonValue = (item1, item2, field, isLowerBetter = true) => {
        const val1 = item1[field];
        const val2 = item2 ? item2[field] : null;
        
        let isWinner = false;
        if (val2 !== null) {
            isWinner = isLowerBetter ? val1 < val2 : val1 > val2;
        }

        return (
            <div className={`flex flex-col gap-1 transition-all duration-500 ${isWinner ? 'text-primary scale-110' : 'text-muted-foreground opacity-60'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-50">{field === 'price' ? 'Market Value' : 'Rating'}</span>
                <span className="text-xl font-black italic tracking-tighter">
                    {field === 'price' ? `Rs. ${val1}` : val1 || 'N/A'}
                    {isWinner && <Zap size={14} className="inline ml-2 animate-pulse"/>}
                </span>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Scale className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting menu items...</p>
        </div>
    );

    const hasResults = comparedItems.length > 0;
    const item1 = comparedItems[0];
    const item2 = comparedItems.length > 1 ? comparedItems[1] : null;

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black pb-32">
            
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary rounded-full blur-[180px]" />
            </div>

            <div className="pt-32 px-6 lg:px-12 max-w-7xl mx-auto z-10 relative">
                
                {/* Header Module */}
                <div className="compare-header flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-px bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Dish Comparison</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                            Compare <span className="text-primary italic">Venues.</span>
                        </h2>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] mt-6 opacity-40 max-w-md">
                            Find and compare the best value across all restaurants in the network. Fast, easy, and accurate.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="lg:w-96">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Search for a Dish</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors"/>
                                <Input 
                                    className="pl-16 h-20 rounded-[2rem] bg-secondary/30 backdrop-blur-md border-primary/10 font-bold uppercase tracking-tight" 
                                    placeholder="e.g. Burger, Pizza..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button 
                                    type="submit" 
                                    disabled={isAnalyzing} 
                                    className="absolute right-4 top-4 h-12 px-6 rounded-2xl bg-primary text-black font-black text-[9px] shadow-2xl hover:scale-105 transition-transform"
                                >
                                    {isAnalyzing ? <Activity className="animate-spin" size={16}/> : 'COMPARE'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Analysis Phase */}
                {isAnalyzing && (
                    <div className="py-40 flex flex-col items-center justify-center gap-10 text-center">
                         <div className="relative">
                             <div className="w-24 h-24 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                             <Scale className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse"/>
                         </div>
                         <div className="space-y-3">
                             <p className="text-[10px] font-black uppercase tracking-[0.8em] text-primary">Comparing Dishes...</p>
                             <div className="flex gap-1 h-1 w-40 bg-secondary/30 rounded-full overflow-hidden mx-auto">
                                 <div className="bg-primary h-full w-1/2 animate-[loading_1.5s_infinite_ease-in-out]" />
                             </div>
                         </div>
                    </div>
                )}

                {/* Matching Dishes */}
                {!isAnalyzing && hasResults && (
                    <div className="comparison-grid space-y-16">
                        
                        <div className="flex flex-col lg:flex-row items-center gap-10">
                            
                            {/* Dish 1 */}
                            <Card className="flex-1 w-full relative rounded-[4rem] bg-secondary/30 border-primary/5 p-8 lg:p-10 overflow-hidden group transition-all duration-700 hover:bg-secondary/40">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Badge className="absolute top-8 left-8 z-20 h-8 px-5 bg-primary text-black border-none text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">DISH A</Badge>
                                
                                <div className="flex flex-col gap-10">
                                    <div className="relative aspect-[16/11] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-background/50 group-hover:scale-[1.02] transition-all duration-700">
                                        <img src={item1.imageUrl || DEFAULT_ITEM_IMG} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-6 left-8 right-8">
                                            <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-white group-hover:text-primary transition-colors">{item1.name}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-8 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] italic">
                                                <Store size={14}/> {item1.restaurant_id?.name || 'Restaurant'}
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < 4 ? "fill-primary text-primary" : "text-primary/20"} />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-primary/10">
                                            {renderComparisonValue(item1, item2, 'price', true)}
                                            {renderComparisonValue(item1, item2, 'rating', false)}
                                        </div>

                                        <Button 
                                            onClick={() => handleAdd(item1)} 
                                            className="w-full h-20 bg-primary text-black rounded-[2.5rem] text-sm font-black uppercase tracking-widest shadow-2xl flex items-center justify-between px-10 group/btn hover:scale-[1.02] transition-all"
                                        >
                                            ADD TO CART <ArrowUpRight size={28} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Versus Divider */}
                            {item2 && (
                                <div className="relative group shrink-0">
                                    <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                                    <div className="relative w-28 h-28 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-3xl font-black italic shadow-3xl z-20 select-none group-hover:scale-110 transition-transform duration-500">
                                        VS
                                    </div>
                                </div>
                            )}

                            {/* Dish 2 */}
                            {item2 && (
                                <Card className="flex-1 w-full relative rounded-[4rem] bg-secondary/40 border-primary/10 p-8 lg:p-10 overflow-hidden group transition-all duration-700 hover:bg-secondary/50">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Badge className="absolute top-8 left-8 z-20 h-8 px-5 bg-secondary text-muted-foreground border-none text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">DISH B</Badge>
                                    
                                    <div className="flex flex-col gap-10">
                                        <div className="relative aspect-[16/11] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-background/50 group-hover:scale-[1.02] transition-all duration-700">
                                            <img src={item2.imageUrl || DEFAULT_ITEM_IMG} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-6 left-8 right-8">
                                                <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-white group-hover:text-primary transition-colors">{item2.name}</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-8 px-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] italic">
                                                    <Store size={14}/> {item2.restaurant_id?.name || 'Restaurant'}
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} className={i < 4 ? "fill-primary text-primary" : "text-primary/20"} />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-10 pt-8 border-t border-primary/10">
                                                {renderComparisonValue(item2, item1, 'price', true)}
                                                {renderComparisonValue(item2, item1, 'rating', false)}
                                            </div>

                                            <Button 
                                                onClick={() => handleAdd(item2)} 
                                                className="w-full h-20 bg-secondary/80 border border-primary/10 hover:bg-primary hover:text-black rounded-[2.5rem] text-sm font-black uppercase tracking-widest shadow-2xl flex items-center justify-between px-10 group/btn hover:scale-[1.02] transition-all"
                                            >
                                                ADD TO CART <ArrowUpRight size={28} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Analytic Verdict */}
                        {item2 && (
                            <div className="p-16 rounded-[4rem] bg-primary text-black flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl relative overflow-hidden group">
                                <div className="absolute top-[-50%] left-[-10%] w-[30rem] h-[30rem] bg-white/20 rounded-full blur-[100px] animate-pulse" />
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-24 h-24 rounded-[2rem] bg-black/10 flex items-center justify-center text-black">
                                        <TrendingUp size={48} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Our Recommendation</p>
                                        <h3 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter leading-none">
                                            <span className="bg-black text-white px-3 py-1 not-italic font-sans">{item1.name}</span> <span className="opacity-80 font-cursive lowercase">is the best value choice.</span>
                                        </h3>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleAdd(item1)} 
                                    className="relative z-10 h-20 px-12 bg-black text-primary rounded-[2rem] text-xl font-black italic shadow-2xl group/v"
                                >
                                    ADD TO CART <ArrowRight className="inline ml-4 group-hover/v:translate-x-2 transition-transform" size={24}/>
                                </Button>
                            </div>
                        )}
                        
                    </div>
                )}

                {/* Empty State */}
                {!loading && !hasResults && !isAnalyzing && (
                    <div className="py-40 text-center space-y-10 border-2 border-dashed border-primary/10 rounded-[5rem] animate-pulse">
                        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/10 text-primary/20">
                             <Layers size={40}/>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter opacity-30 leading-none">Dish Comparison <span className="text-primary font-cursive lowercase">Inactive.</span></h3>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] max-w-xs mx-auto opacity-20">Search for a dish to see how it compares across different restaurants.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compare;
