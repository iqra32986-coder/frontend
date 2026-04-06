import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { 
  Search, 
  MapPin, 
  Plus, 
  Star, 
  ShoppingBag, 
  Filter, 
  Store, 
  ArrowUpRight, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Tag,
  ArrowRight
} from 'lucide-react';
import { addToCart } from '../features/cartSlice';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';


gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const ShopItemCard = ({ item, onAdd, onShowReviews }) => {
  return (
    <Card className="shop-item group rounded-2xl bg-secondary/30 border-transparent hover:border-primary/20 transition-all duration-500 hover:-translate-y-4 shadow-2xl shadow-black/5 flex flex-col h-full overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-xl m-2">
        <img 
            src={item.imageUrl || DEFAULT_IMAGE} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {item.discount > 0 && (
           <Badge className="absolute top-4 left-4 px-4 py-2 bg-primary text-black font-black uppercase border-0 shadow-lg">-{item.discount}%</Badge>
        )}
        <div className="absolute inset-x-3 bottom-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
           <Button onClick={() => onAdd(item)} className="w-full bg-background/80 backdrop-blur-xl text-foreground font-black uppercase h-14 rounded-xl border border-primary/20 hover:bg-primary hover:text-black">
              Add to Cart
           </Button>
        </div>
      </div>
      
      <CardContent className="p-8 pt-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/restaurant-view/${item.restaurant_id?._id}`} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5">
               <Store className="w-3 h-3" />
               <span className="truncate max-w-[120px]">{item.restaurant_id?.name || 'Gourmet Kitchen'}</span>
            </Link>
            <button 
                onClick={() => onShowReviews(item)}
                className="flex items-center gap-1 text-[9px] font-black text-muted-foreground hover:text-primary transition-colors"
                title="View Performance Reviews"
            >
                <Star className="w-3 h-3 fill-primary/30 group-hover:fill-primary" />
                 <span>REVIEWS</span>
            </button>
          </div>
          
          <h3 className="text-2xl font-black tracking-tight mb-4 uppercase truncate leading-none">{item.name}</h3>
          
          <div className="mt-auto flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none"><span className="text-primary mr-1">rs.</span>{item.price.toFixed(2)}</span>
                 <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 mt-1">{item.category || 'MENU SELECTION'}</span>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500">
                <Plus className="w-5 h-5 text-primary" />
             </div>
          </div>
      </CardContent>
    </Card>
  );
};

const Shop = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [reviewsData, setReviewsData] = useState({ item: null, reviews: [], loading: false });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const sectionRef = useRef(null);

    const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data } = await api.get('/menus');
                setItems(data);
            } catch (error) {
                console.error("Error fetching shop items", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Entrance animations
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.shop-header',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
            );
            gsap.fromTo('.shop-item',
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.shop-item',
                        start: 'top 95%',
                    }
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, [loading]);

    const handleAdd = (item, qty = 1) => {
        dispatch(addToCart({
            menuItem: item._id,
            restaurant_id: item.restaurant_id?._id || null,
            restaurant_name: item.restaurant_id?.name || 'Unknown',
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: qty
        }));
    };

    const fetchReviews = async (item) => {
        setReviewsData({ item, reviews: [], loading: true });
        try {
            const { data } = await api.get(`/reviews/restaurant/${item.restaurant_id?._id}`);
            setReviewsData(prev => ({ ...prev, reviews: data, loading: false }));
        } catch (error) {
            console.error(error);
            setReviewsData(prev => ({ ...prev, loading: false }));
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                                item.category?.toLowerCase().includes(search.toLowerCase()) ||
                                item.restaurant_id?.name?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, selectedCategory]);

    const groupedItems = useMemo(() => {
        return filteredItems.reduce((acc, item) => {
            const restId = item.restaurant_id?._id || 'other';
            if (!acc[restId]) {
                acc[restId] = {
                    info: item.restaurant_id || { name: 'Gourmet Selection' },
                    items: []
                };
            }
            acc[restId].items.push(item);
            return acc;
        }, {});
    }, [filteredItems]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                     <p className="text-primary font-black uppercase tracking-widest text-xs">Getting the menu ready...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={sectionRef} className="bg-background min-h-screen pt-32 pb-24">
            
            {/* Shop Header */}
            <header className="shop-header max-w-7xl mx-auto px-6 lg:px-12 mb-16">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-px bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">All Dishes</span>
                </div>
                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                     The <span className="text-primary">Menu.</span>
                 </h1>
                <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
                    Explore all dishes from our premier restaurant partners. Compare prices and order from multiple locations in one go.
                </p>
            </header>

            {/* Sticky Discovery Bar */}
            <div className="sticky top-[73px] z-30 bg-background/80 backdrop-blur-xl border-y border-border/50 py-6 mb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 justify-between">
                    
                    {/* Dynamic Logic: Result Count */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-3xl font-black tracking-tighter leading-none">{filteredItems.length}</span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Dishes matching</span>
                        </div>
                        <div className="h-10 w-px bg-border/50 hidden lg:block" />
                        
                        {/* Search Input */}
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform duration-500" />
                            <Input 
                                type="text"
                                placeholder="Search dishes or restaurants..."
                                className="pl-12 h-12 rounded-xl bg-secondary/50 border-primary/10 transition-all font-bold"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
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
                                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 block ${
                                            selectedCategory === cat
                                                ? 'bg-primary text-black scale-105 shadow-xl shadow-primary/20'
                                                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-primary/20'
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

            {/* Results Grid Grouped by Restaurant */}
            <main className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
                {Object.keys(groupedItems).length > 0 ? (
                    Object.entries(groupedItems).map(([restId, group]) => (
                        <div key={restId} className="space-y-12">
                            {/* Restaurant Section Title */}
                            <div className="flex items-center gap-4 group/rest cursor-pointer" onClick={() => navigate(`/restaurant-view/${restId}`)}>
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/rest:bg-primary group-hover/rest:text-black transition-all">
                                    <Store size={22} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight group-hover/rest:text-primary transition-colors">
                                        {group.info.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                                        <TrendingUp size={10} className="text-primary"/> 
                                        <span>Official Partner Venue</span>
                                        <ChevronRight size={10} className="group-hover/rest:translate-x-1 transition-transform"/>
                                    </div>
                                </div>
                            </div>

                            {/* Item Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                {group.items.map((item) => (
                                    <ShopItemCard 
                                        key={item._id} 
                                        item={item} 
                                        onAdd={handleAdd} 
                                        onShowReviews={fetchReviews}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center">
                        <div className="inline-flex w-24 h-24 rounded-[2rem] bg-secondary items-center justify-center mb-8 border border-primary/10">
                           <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">No matching dishes</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium lead-relaxed">
                            Try adjusting your filters or search query to find the perfect gourmet selection.
                        </p>
                    </div>
                )}
            </main>

            {/* Customer Reviews Dialog */}
            {reviewsData.item && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setReviewsData({ item: null, reviews: [], loading: false })} />
                    
                    <Card className="relative w-full max-w-2xl bg-secondary/50 border-primary/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.1)]">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setReviewsData({ item: null, reviews: [], loading: false })}
                            className="absolute top-8 right-8 z-10 rounded-full hover:bg-primary hover:text-black"
                         >
                            <Plus className="w-6 h-6 rotate-45" />
                         </Button>

                         <div className="p-12">
                            <header className="mb-10">
                                <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                                   <Star className="w-4 h-4 fill-primary" /> Customer Reviews
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{reviewsData.item.restaurant_id?.name}</h2>
                            </header>

                            <div className="max-h-[50vh] overflow-y-auto pr-6 custom-scrollbar">
                               {reviewsData.loading ? (
                                   <div className="py-12 flex flex-col items-center gap-4">
                                      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                      <p className="text-[10px] font-black uppercase text-primary/60">Getting reviews...</p>
                                   </div>
                               ) : reviewsData.reviews.length > 0 ? (
                                   <div className="space-y-10">
                                      {reviewsData.reviews.map((rev, i) => (
                                         <div key={rev._id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="flex justify-between items-start mb-3">
                                               <div>
                                                  <p className="font-black uppercase tracking-tight text-foreground">{rev.customer_id?.name || 'Customer'}</p>
                                                  <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                               </div>
                                               <div className="flex gap-1">
                                                  {[...Array(5)].map((_, i) => (
                                                     <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                                                  ))}
                                               </div>
                                            </div>
                                             <p className="text-muted-foreground text-sm font-medium leading-relaxed border-l-2 border-primary/20 pl-4 py-1">"{rev.comment}"</p>
                                         </div>
                                      ))}
                                   </div>
                               ) : (
                                   <div className="py-12 text-center opacity-30">
                                      <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                      <p className="text-sm font-black uppercase">No reviews for this restaurant yet.</p>
                                   </div>
                               )}
                            </div>
                            
                            <div className="mt-12 flex gap-4">
                               <Button onClick={() => setReviewsData({ item: null, reviews: [], loading: false })} className="flex-1 btn-primary h-14">Close</Button>
                               <Button onClick={() => navigate(`/restaurant-view/${reviewsData.item.restaurant_id?._id}`)} variant="outline" className="flex-1 h-14 rounded-full border-primary/20 uppercase font-black text-[10px] tracking-widest">Visit Restaurant</Button>
                            </div>
                         </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Shop;
