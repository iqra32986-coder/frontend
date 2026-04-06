import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Search, 
  MapPin, 
  Scale, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  Clock, 
  Zap,
  Star,
  Store,
  Tag,
  ArrowUpRight,
  Filter,
  Utensils,
  Plus,
  Minus,
  ArrowRight,
  Users
} from 'lucide-react';
import { addToCart } from '../features/cartSlice';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import heroImage from '../assets/hero_elite.png';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const Home = () => {
  const [items, setItems] = useState([]);
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    restaurants: 0,
    customers: 0,
    avgRating: 4.9,
    totalReviews: 0
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Fetch Items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, dealsRes, statsRes] = await Promise.all([
           api.get('/menus'),
           api.get('/deals'),
           api.get('/restaurants/summary')
        ]);
        setItems(menusRes.data);
        setDeals(dealsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (loading) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      tl.fromTo('.hero-badge', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2 }
      )
      .fromTo('.hero-title', 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        '-=0.4'
      )
      .fromTo('.hero-subtitle', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      )
      .fromTo('.hero-search', 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8 },
        '-=0.4'
      )
      .fromTo('.hero-stats', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4'
      );
    }, heroRef);

    return () => ctx.revert();
  }, [loading]);

  // Scroll animations
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.section-title').forEach((title) => {
        gsap.fromTo(title,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: title,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      gsap.utils.toArray('.stagger-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: (i % 3) * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const handleAdd = (item, qty = 1) => {
    dispatch(addToCart({
      menuItem: item._id,
      restaurant_id: item.restaurant_id?._id,
      restaurant_name: item.restaurant_id?.name,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      qty: qty
    }));
  };

  const isComparisonMode = search.trim().length >= 3;

  const results = useMemo(() => {
    if (!search.trim()) return items;

    const filtered = items.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.category?.toLowerCase().includes(search.toLowerCase()) ||
      i.restaurant_id?.name.toLowerCase().includes(search.toLowerCase())
    );

    if (isComparisonMode) {
      const groups = filtered.reduce((acc, item) => {
        const key = item.name.toLowerCase().trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      Object.values(groups).forEach(group => {
        group.sort((a, b) => a.price - b.price);
      });

      return Object.values(groups);
    }

    return filtered;
  }, [items, search, isComparisonMode]);

  const groupedFeaturedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const restId = item.restaurant_id?._id || 'global';
      const restName = item.restaurant_id?.name || 'SmartDine Selection';
      if (!acc[restId]) {
        acc[restId] = { name: restName, items: [] };
      }
      acc[restId].items.push(item);
      return acc;
    }, {});
  }, [items]);

  const categories = [
    { name: 'Burgers', icon: <Utensils /> },
    { name: 'Pizza', icon: <Utensils /> },
    { name: 'Sushi', icon: <Utensils /> },
    { name: 'Desserts', icon: <Utensils /> },
    { name: 'Drinks', icon: <Utensils /> },
    { name: 'Salads', icon: <Utensils /> },
  ];

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-primary font-black uppercase tracking-widest text-xs">Getting things ready...</p>
           </div>
        </div>
     );
  }

  return (
    <div ref={containerRef} className="bg-background text-foreground overflow-x-hidden">
      
      {/* Dynamic Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[95vh] flex items-center justify-center pt-20 pb-32"
      >
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
           <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[120px]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 grain-overlay" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
            {/* Artistic Badge */}
            <div className="hero-badge flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/80 border border-primary/20 backdrop-blur-md mb-8">
               <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Discover Premium Dining</span>
            </div>

            {/* Kinetic Title */}
                <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl font-cursive tracking-wider lowercase leading-[0.8] mb-12">
                  Eat <span className="text-primary italic">Better.</span><br />
                  Live <span className="text-primary italic">Smarter.</span>
                </h1>

            {/* Editorial Subtitle */}
            <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed mb-12">
               Discover the exquisite world of high-end dining. One unified platform for real-time tracking, price comparison, and seamless reservations.
            </p>

            {/* Kinetic Search */}
            <div className="hero-search w-full max-w-3xl relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                <div className="relative flex items-center bg-secondary/80 backdrop-blur-2xl border border-primary/20 p-2 rounded-2xl shadow-2xl transition-all duration-500 hover:border-primary/50">
                   <div className="flex-1 flex items-center px-6">
                      <Search className="w-6 h-6 text-primary mr-4" />
                      <input 
                         type="text"
                         placeholder="Search for a dish, restaurant, or cuisine..."
                         className="w-full bg-transparent border-none outline-none text-lg font-bold placeholder:text-muted-foreground/50 transition-all"
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                      />
                   </div>
                </div>
            </div>

            {/* Kinetic Stats */}
            <div className="hero-stats grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mt-28">
               {[
                  { label: 'Restaurants', value: stats.restaurants, icon: <Store /> },
                  { label: 'Happy Customers', value: stats.customers, icon: <TrendingUp /> },
                  { label: 'Rating', value: stats.avgRating, icon: <Star /> },
                  { label: 'Reviews', value: stats.totalReviews, icon: <Tag /> },
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <p className="text-4xl font-black text-primary tracking-tighter mb-1">
                        {stat.label === 'Rating' ? stat.value : `${stat.value}+`}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <span className="opacity-50 scale-75">{stat.icon}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* --- HOT DEALS SWIPER --- */}
      {deals.length > 0 && !isComparisonMode && (
         <section className="py-24 relative overflow-hidden bg-secondary/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
               <div className="flex items-end justify-between mb-12">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Limited Time</span>
                     </div>
                     <h2 className="text-5xl lg:text-7xl font-cursive tracking-widest lowercase leading-none">Hot <span className="text-primary italic">Deals.</span></h2>
                  </div>
               </div>

               <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={30}
                  slidesPerView={1}
                  breakpoints={{
                     640: { slidesPerView: 1 },
                     1024: { slidesPerView: 2 },
                  }}
                  autoplay={{
                     delay: 5000,
                     disableOnInteraction: false,
                  }}
                  pagination={{ clickable: true }}
                  navigation={true}
                  className="deals-swiper pb-20"
               >
                  {deals.map((deal) => (
                     <SwiperSlide key={deal._id}>
                        <div className="relative group h-[400px] rounded-[2.5rem] overflow-hidden border border-primary/10 bg-background/40 backdrop-blur-3xl p-8 flex flex-col justify-end transition-all duration-700 hover:border-primary/30">
                           {/* BG IMAGE */}
                           <div className="absolute inset-0 z-0">
                              <img 
                                 src={deal.imageUrl || DEFAULT_IMAGE} 
                                 alt={deal.title} 
                                 className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-40"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                           </div>

                           <div className="relative z-10 space-y-6">
                              <div className="flex items-center gap-4">
                                 <Badge className="bg-primary text-black font-black px-4 py-2 rounded-xl text-xs">-{deal.discountPercentage || 25}% OFF</Badge>
                                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">From: {deal.restaurant_id?.name || 'Exclusive Partner'}</span>
                              </div>
                              <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none max-w-lg">{deal.title}</h3>
                              <p className="text-muted-foreground font-medium text-lg line-clamp-2 max-w-md">{deal.description}</p>
                              
                              <div className="flex items-center gap-6 pt-4">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Price</span>
                                    <span className="text-3xl font-black tracking-tighter italic">Rs. {deal.price}</span>
                                 </div>
                                 <Link to="/deals">
                                    <Button className="h-16 px-10 rounded-2xl bg-secondary hover:bg-primary hover:text-black transition-all font-black uppercase text-xs tracking-widest">
                                       View Offer <ArrowUpRight className="w-4 h-4 ml-3" />
                                    </Button>
                                 </Link>
                              </div>
                           </div>
                        </div>
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </section>
      )}

      {/* Main Content Modules */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        
        {isComparisonMode ? (
          <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-700">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-12">
                <div>
                   <h2 className="section-title text-4xl font-black uppercase tracking-tighter">
                      Price <span className="text-primary">Comparison</span>
                   </h2>
                   <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-2">Analysis for: "{search}"</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center gap-2">
                       <Scale className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase">Best value first</span>
                   </div>
                </div>
             </div>

             {results.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-[3rem]">
                    <p className="text-2xl font-black uppercase tracking-tighter opacity-30 italic leading-none">No Results Found.</p>
                </div>
             ) : (
                <div className="space-y-24">
                   {results.map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-8">
                         <div className="flex items-center gap-3"><Users className="w-4 h-4 text-primary" /> Owner: {group[0].restaurant_id?.ownerName || 'Restaurant Manager'}</div>
                         <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">{group[0].name}</h3>
                            <div className="h-px flex-1 bg-border/50" />
                             <Badge variant="outline" className="px-4 py-1.5 rounded-full uppercase font-black text-[9px]">{group.length} Restaurants</Badge>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {group.map((item, i) => (
                               <Card key={item._id} className="stagger-card group rounded-2xl bg-secondary/30 border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-4 shadow-2xl shadow-black/5 flex flex-col h-full overflow-hidden">
                                  <div className="relative aspect-[4/3] overflow-hidden">
                                     <img src={item.imageUrl || DEFAULT_IMAGE} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                     {i === 0 && (
                                        <div className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                            <Check className="w-3 h-3" /> Best Value
                                        </div>
                                     )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  </div>
                                  <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                     <div>
                                        <Link to={`/restaurant-view/${item.restaurant_id?._id}`} className="group/link flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-2">
                                           <MapPin className="w-3 h-3" />
                                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Restaurant</span>
                                        </Link>
                                        <h4 className="text-xl font-bold tracking-tight mb-4 leading-tight">{item.name}</h4>
                                     </div>
                                     
                                     <div className="flex items-end justify-between mt-auto">
                                        <div className="flex flex-col">
                                           <span className="text-2xl font-black tracking-tighter leading-none"><span className="text-primary mr-1">rs.</span>{item.price.toFixed(2)}</span>
                                           {i === 0 && group.length > 1 && (
                                              <span className="text-[9px] font-black text-primary uppercase mt-1">Save {Math.round(((group[group.length-1].price - item.price) / group[group.length - 1].price) * 100)}%</span>
                                           )}
                                        </div>
                                        <Button 
                                           onClick={() => handleAdd(item)}
                                           size="icon-lg"
                                           className="rounded-2xl transition-all duration-500 group-hover:rotate-12"
                                        >
                                           <Plus className="w-5 h-5" />
                                        </Button>
                                     </div>
                                  </CardContent>
                               </Card>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        ) : (
          <div className="space-y-32">
             {/* Categories Carousel Simulation */}
             <div className="space-y-12">
                <div className="flex items-end justify-between">
                   <div>
                       <h2 className="section-title text-3xl font-black uppercase tracking-tighter">Popular <span className="text-primary">Categories</span></h2>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Filter by culinary category</p>
                   </div>
                </div>
                <div className="w-full overflow-hidden">
                   <Swiper
                       slidesPerView="auto"
                       spaceBetween={16}
                       loop={true}
                       className="w-full overflow-visible"
                   >
                       {categories.map((cat, i) => (
                           <SwiperSlide key={i} style={{ width: 'auto' }}>
                              <div 
                                 className="stagger-card group cursor-pointer flex items-center gap-4 px-6 py-4 rounded-full bg-secondary/40 border border-primary/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl shadow-primary/5 relative z-20"
                              >
                                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 group-hover:rotate-12">
                                    <span className="scale-75">{cat.icon}</span>
                                 </div>
                                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                                    {cat.name}
                                 </span>
                              </div>
                           </SwiperSlide>
                       ))}
                   </Swiper>
                </div>
             </div>

              {/* Featured Menu Module Grouped by Restaurant */}
              <div className="space-y-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
                   <div>
                      <h2 className="section-title text-4xl font-black uppercase tracking-tighter">Featured <span className="text-primary">Dishes</span></h2>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Selected by experts at our partner venues</p>
                   </div>
                   <Link to="/shop">
                      <Button variant="outline" className="rounded-full px-8 py-6 uppercase font-black tracking-widest text-[10px] group">
                         View Full Menu <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </Button>
                   </Link>
                </div>

                {Object.entries(groupedFeaturedItems).map(([restId, group]) => (
                    <div key={restId} className="space-y-12">
                        <div className="flex items-center gap-4 group/rest cursor-pointer" onClick={() => navigate(`/restaurant-view/${restId}`)}>
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/rest:bg-primary group-hover/rest:text-black transition-all">
                                <Store size={18} />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic group-hover/rest:text-primary transition-colors">{group.name}</h3>
                            <div className="h-px flex-1 bg-primary/10" />
                            <ChevronRight size={24} className="text-primary opacity-30 group-hover/rest:translate-x-2 group-hover/rest:opacity-100 transition-all" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                           {group.items.slice(0, 3).map((item) => (
                              <Card key={item._id} className="stagger-card group rounded-2xl bg-secondary/30 border-transparent hover:border-primary/20 transition-all duration-500 hover:-translate-y-4 hover:rotate-1 flex flex-col h-full">
                                 <div className="relative aspect-square overflow-hidden rounded-xl m-2">
                                     <img src={item.imageUrl || DEFAULT_IMAGE} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                     {item.discount > 0 && (
                                        <Badge className="absolute top-6 left-6 px-4 py-2 bg-primary text-black font-black uppercase border-0">-{item.discount}%</Badge>
                                     )}
                                     <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <Button onClick={() => handleAdd(item)} className="w-full bg-background/80 backdrop-blur-xl text-foreground font-black uppercase h-14 rounded-xl border border-primary/20 hover:bg-primary hover:text-black">
                                           Add to Cart
                                        </Button>
                                     </div>
                                 </div>
                                 <CardContent className="p-8 pt-4 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black tracking-tight mb-4 uppercase truncate">{item.name}</h3>
                                    <div className="mt-auto flex items-center justify-between">
                                       <div className="flex flex-col">
                                          <span className="text-2xl font-black tracking-tighter leading-none"><span className="text-primary mr-1">Rs.</span>{item.price.toFixed(2)}</span>
                                       </div>
                                       <div className="flex gap-2">
                                          <div className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center opacity-30">
                                             <Utensils className="w-4 h-4 text-primary" />
                                          </div>
                                       </div>
                                    </div>
                                 </CardContent>
                              </Card>
                           ))}
                        </div>
                    </div>
                ))}
             </div>

             {/* Features Module */}
             <div className="py-24 px-12 rounded-2xl bg-primary relative overflow-hidden text-black group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                   <div>
                      <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                         A Premium Era <br /> of Dining.
                      </h2>
                      <p className="mt-8 text-lg font-bold text-black/60 max-w-md">Experience dining with real-time tracking and trusted restaurant partners.</p>
                      <div className="flex gap-4 mt-12">
                         <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                            <Clock className="w-8 h-8 text-primary shadow-primary" />
                         </div>
                         <div className="py-2">
                            <p className="font-black uppercase tracking-widest text-[10px]">Average Status</p>
                            <p className="text-2xl font-black tracking-tighter">15min Delivery Average</p>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      {[
                        { title: 'Verified', label: 'Restaurants' },
                        { title: 'Secure', label: 'Payments' },
                        { title: 'Elite', label: 'Menus' },
                        { title: 'Real-Time', label: 'Tracking' },
                      ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-black/5 border border-black/10 transition-all hover:bg-black/10">
                           <p className="text-2xl font-black tracking-tighter leading-none mb-1">{item.title}</p>
                           <p className="text-sm font-black text-muted-foreground uppercase opacity-40 mb-1">Available Tables</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Kinetic Footer CTA */}
      <section className="py-32 section-padding text-center bg-background relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-primary to-transparent" />
         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10">
               Ready to <span className="text-primary">Start?</span>
            </h2>
            <p className="text-muted-foreground font-medium leading-[1.8]">Experience a unique blend of heritage and modern culinary techniques. Every dish is a testament to our passion for perfection, designed to provide the ultimate dining experience.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Button onClick={() => navigate('/register')} className="btn-primary h-16 px-12 text-lg shadow-2xl shadow-primary/20">
                  Register Account
               </Button>
               <Button onClick={() => navigate('/shop')} variant="outline" className="h-16 px-12 text-lg rounded-full border-primary/20 text-muted-foreground hover:text-primary hover:border-primary transition-all">
                  View Full Menu
               </Button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
