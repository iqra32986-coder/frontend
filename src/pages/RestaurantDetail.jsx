import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  MapPin, 
  Clock, 
  User, 
  Search, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Info, 
  DollarSign, 
  Users, 
  Plus, 
  Share2, 
  Heart,
  Calendar,
  Utensils,
  Store,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag
} from 'lucide-react';
import { addToCart, setSelectedTable } from '../features/cartSlice';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_ITEM_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const MenuCard = ({ item, onAdd }) => {
  return (
    <Card className="menu-item group rounded-2xl bg-secondary/30 border-transparent hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden shadow-2xl shadow-black/5">
      <div className="relative aspect-square sm:aspect-video overflow-hidden rounded-xl m-2">
        <img 
            src={item.imageUrl || DEFAULT_ITEM_IMG} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {item.discount > 0 && (
           <Badge className="absolute top-4 left-4 px-4 py-2 bg-primary text-black font-black uppercase border-0 shadow-lg">-{item.discount}%</Badge>
        )}
        <div className="absolute inset-x-3 bottom-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
           <Button onClick={() => onAdd(item)} className="w-full bg-background/80 backdrop-blur-xl text-foreground font-black uppercase h-14 rounded-xl border border-primary/20 hover:bg-primary hover:text-black">
              Add to Order
           </Button>
        </div>
      </div>
      
      <CardContent className="p-8 pt-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">{item.category || 'Chef Selection'}</span>
             <div className="w-3 h-3 rounded-full bg-primary/20 animate-pulse" />
          </div>
          
          <h3 className="text-2xl font-black tracking-tight mb-4 uppercase truncate leading-none">{item.name}</h3>
          
          <div className="mt-auto flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none"><span className="text-primary mr-1">Rs.</span>{item.price.toFixed(2)}</span>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-secondary border border-primary/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-black" />
             </div>
          </div>
      </CardContent>
    </Card>
  );
};

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useThemeStore();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    
    const containerRef = useRef(null);

    const [searchParams] = useSearchParams();
    const tableNumberFromUrl = searchParams.get('tableNumber');
    const { selectedTable } = useSelector(state => state.cart);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data: resData } = await api.get(`/restaurants/${id}`);
                setRestaurant(resData);
                const { data: menuData } = await api.get(`/menus/restaurant/${id}`);
                setMenu(menuData);
                setLoading(false);

                // Auto-select table if coming from seating plan
                if (tableNumberFromUrl && resData.tables) {
                    const table = resData.tables.find(t => t.tableNumber === tableNumberFromUrl);
                    if (table) {
                        dispatch(setSelectedTable(table));
                    }
                }
            } catch (error) {
                console.error("Error fetching detail", error);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, tableNumberFromUrl, dispatch]);

    // Entrance and Scroll Animations
    useEffect(() => {
        if (loading || !restaurant) return;
        
        const ctx = gsap.context(() => {
            gsap.fromTo('.restaurant-hero-content',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
            );

            gsap.utils.toArray('.menu-item').forEach((item, i) => {
                gsap.fromTo(item,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        delay: (i % 3) * 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 95%',
                        }
                    }
                );
            });
        }, containerRef);
        return () => ctx.revert();
    }, [loading, restaurant]);

    const handleAdd = (item) => {
        dispatch(addToCart({
            menuItem: item._id,
            restaurant_id: id,
            restaurant_name: restaurant.name,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: 1
        }));
    };

    const categories = useMemo(() => {
        return ['All', ...new Set(menu.map(item => item.category).filter(Boolean))];
    }, [menu]);

    const filteredMenu = useMemo(() => {
        return menu.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                                item.category?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menu, search, activeCategory]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary font-black uppercase tracking-widest text-xs">Getting details ready...</p>
                </div>
            </div>
        );
    }
    
    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <Utensils size={80} className="text-muted-foreground opacity-20 mb-8" />
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Restaurant <span className="text-primary">Not Found.</span></h2>
                <p className="text-muted-foreground font-medium mb-8">The requested restaurant is currently unavailable or missing.</p>
                <Button onClick={() => navigate('/shop')} className="btn-primary px-12 h-14">Return to Menu</Button>
            </div>
        );
    }

    const availablePayments = [
        restaurant.payments?.cod?.enabled && 'COD',
        restaurant.payments?.jazzcash?.enabled && 'JazzCash'
    ].filter(Boolean);

    return (
        <div ref={containerRef} className="bg-background min-h-screen overflow-x-hidden">
            
            {/* Immersive Profile Hero */}
            <section className="relative h-[65vh] lg:h-[75vh] w-full overflow-hidden">
                <img 
                   src={restaurant.imageUrl || DEFAULT_IMAGE} 
                   alt={restaurant.name} 
                   className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 grain-overlay opacity-20 pointer-events-none" />
                
                {/* Floating Controls */}
                <div className="absolute top-28 left-6 lg:left-12 flex gap-4">
                   <Button 
                      variant="outline" 
                      onClick={() => navigate(-1)} 
                      className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-xl border-primary/20 text-foreground group"
                   >
                      <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                   </Button>
                </div>
                <div className="absolute top-28 right-6 lg:right-12 flex gap-2">
                   <Button variant="outline" className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-xl border-primary/20 text-foreground">
                      <Heart className="w-5 h-5" />
                   </Button>
                   <Button variant="outline" className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-xl border-primary/20 text-foreground">
                      <Share2 className="w-5 h-5" />
                   </Button>
                </div>

                {/* Hero Content Overlay */}
                <div className="restaurant-hero-content absolute bottom-0 left-0 right-0 p-6 lg:p-12 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                   <div className="max-w-3xl">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="hero-badge flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Restaurant</span>
                         </div>
                         <Badge className="bg-secondary/80 text-foreground font-black tracking-widest text-[9px] uppercase h-9 px-4 rounded-full border-primary/10 backdrop-blur-sm">4.9 Overall Rating</Badge>
                      </div>
                      <h1 className="text-6xl lg:text-[7rem] font-cursive tracking-widest lowercase leading-[0.8] mb-4">{restaurant.name}</h1>
                      <div className="flex flex-wrap items-center gap-8 mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                         <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> {restaurant.location || 'Main Branch'}</div>
                         <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-primary" /> {restaurant.timings || '11:00 — 23:00'}</div>
                         <div className="flex items-center gap-3"><User className="w-4 h-4 text-primary" /> Owner: {restaurant.ownerName || 'Restaurant Manager'}</div>
                      </div>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 mb-2">
                      <Button 
                         onClick={() => navigate('/explore-tables')}
                         className="btn-primary h-16 px-12 text-lg shadow-2xl shadow-primary/20 w-fit rounded-xl"
                      >
                         <Calendar className="w-5 h-5 mr-3" /> Book a Table
                      </Button>
                   </div>
                </div>
            </section>

            {/* Restaurant Details */}
            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
                   
                   {/* About / Bio Module */}
                   <div className="lg:col-span-2 space-y-10">
                      <div className="p-12 rounded-xl bg-secondary/30 border border-primary/10 relative overflow-hidden group">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-[2s]" />
                         <div className="flex items-center gap-3 mb-6">
                            <Info className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Restaurant Information</span>
                         </div>
                         <h3 className="text-4xl font-cursive tracking-wider lowercase mb-8">Our <span className="text-primary italic">Story.</span></h3>
                         <p className="text-2xl font-black tracking-tight leading-relaxed text-foreground opacity-80 mb-8">"{restaurant.bio || 'Crafting memories through exceptional flavor and tradition.'}"</p>
                         <div className="h-px w-full bg-border/50 mb-8" />
                         <p className="text-muted-foreground font-medium leading-[1.8]">{restaurant.description || 'Experience a unique blend of heritage and modern culinary techniques. Every dish is a testament to our passion for perfection, designed to provide the ultimate dining experience.'}</p>
                      </div>
                   </div>

                   {/* Operational Info */}
                   <div className="space-y-6">
                      <div className="p-8 rounded-xl bg-secondary/50 border border-primary/5 flex flex-col justify-between h-48 group hover:bg-secondary/80 transition-colors">
                         <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Payment Options</span>
                            <DollarSign className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-muted-foreground uppercase opacity-40 mb-1">We Accept</p>
                            <div className="flex flex-wrap gap-2">
                               {availablePayments.map(p => (
                                 <Badge key={p} variant="outline" className="bg-primary/5 border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">{p}</Badge>
                               ))}
                            </div>
                         </div>
                      </div>
 
                      <div className="p-8 rounded-xl bg-secondary/50 border border-primary/5 flex flex-col justify-between h-48 group hover:bg-secondary/80 transition-colors">
                         <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Seating Capacity</span>
                            <Users className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-muted-foreground uppercase opacity-40 mb-1">Available Tables</p>
                            <p className="text-3xl font-black tracking-tighter">{restaurant.tables?.length || 0} <span className="text-lg uppercase text-primary/60">Available</span></p>
                         </div>
                      </div>
                      
                      <Button onClick={() => navigate('/reviews')} variant="outline" className="w-full h-20 rounded-xl border-primary/20 flex items-center justify-between px-10 group hover:border-primary/50 transition-all">
                         <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Reviews</p>
                            <p className="text-lg font-black tracking-tighter uppercase">Customer Reviews</p>
                         </div>
                         <ArrowUpRight className="w-6 h-6 text-primary group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </Button>
                   </div>
                </div>

                {/* The Menu Module */}
                <div className="space-y-16">
                   <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/50 pb-12">
                      <div>
                         <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter opacity-30">Arrive <span className="text-primary">on Time.</span></h3>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Menu</span>
                         </div>
                         <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                             The <span className="text-primary italic">Selection.</span>
                          </h2>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                         {/* Search Module */}
                         <div className="relative w-full sm:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                            <Input 
                               type="text" 
                               placeholder="Search menu..." 
                               className="pl-12 h-12 rounded-2xl bg-secondary/30 border-primary/10 transition-all font-bold"
                               value={search}
                               onChange={(e) => setSearch(e.target.value)}
                            />
                         </div>
                         
                         {/* Category Pills */}
                         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto pb-2 sm:pb-0">
                            {categories.map((cat) => (
                               <button
                                  key={cat}
                                  onClick={() => setActiveCategory(cat)}
                                  className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                                      activeCategory === cat
                                          ? 'bg-primary text-black scale-105'
                                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent'
                                  }`}
                               >
                                  {cat}
                               </button>
                            ))}
                         </div>
                      </div>
                   </header>

                   {/* Kinetic Menu Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                      {filteredMenu.length === 0 ? (
                         <div className="col-span-full py-32 text-center opacity-30">
                            <p className="text-3xl font-black uppercase tracking-tighter">No Items Found.</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Adjust search parameters</p>
                         </div>
                      ) : (
                         filteredMenu.map(item => (
                            <MenuCard key={item._id} item={item} onAdd={handleAdd} />
                         ))
                      )}
                   </div>
                </div>
            </main>

            {/* Sticky Bottom CTA Banner (Mobile Only) */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40 animate-in slide-in-from-bottom-full duration-700">
               <Button onClick={() => navigate('/cart')} className="w-full btn-primary h-16 shadow-2xl flex items-center justify-between px-8 rounded-3xl">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                     </div>
                     <div className="text-left">
                        <p className="text-black font-black uppercase tracking-tighter leading-none">View Order</p>
                        <p className="text-[9px] font-bold text-black/60 uppercase">Cart</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black" />
               </Button>
            </div>
        </div>
    );
};

export default RestaurantDetail;
