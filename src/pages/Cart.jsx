import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Plus, 
  Minus, 
  Check, 
  Info, 
  ChevronRight,
  Package,
  TrendingDown,
  ShieldCheck,
  Zap,
  MapPin,
  Store,
  Activity
} from 'lucide-react';
import { removeFromCart, updateCartQty, toggleItemSelection } from '../features/cartSlice';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const Cart = () => {
    const { cartItems, selectedTable } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    
    const containerRef = useRef(null);

    // Entrance animations
    useEffect(() => {
        if (cartItems.length === 0) return;
        
        const ctx = gsap.context(() => {
            gsap.fromTo('.cart-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
            gsap.fromTo('.restaurant-group',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
            );
            gsap.fromTo('.summary-card',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'power4.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [cartItems.length > 0]);

    const handleRemove = (id) => {
        gsap.to(`#cart-item-${id}`, {
            opacity: 0,
            x: 50,
            duration: 0.4,
            onComplete: () => dispatch(removeFromCart(id))
        });
    };

    const handleUpdateQty = (id, qty, isDeal = false) => {
        if (qty < 1) return;
        dispatch(updateCartQty({ id, qty, isDeal }));
    };

    const handleToggleSelect = (id, isDeal = false) => {
        dispatch(toggleItemSelection({ id, isDeal }));
    };

    const groupedCart = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const name = item.restaurant_name || 'Standard Order';
            if(!acc[name]) acc[name] = [];
            acc[name].push(item);
            return acc;
        }, {});
    }, [cartItems]);

    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((a, c) => a + c.price * c.qty, 0);

    return (
        <div ref={containerRef} className="bg-background min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* Header Section */}
                <header className="cart-header mb-16">
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-white/20" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Your Cart</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                                Your <span className="text-primary italic">Cart.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                Review your selected items and proceed to checkout. Experience premium dining at your fingertips.
                            </p>
                        </div>
                        {cartItems.length > 0 && (
                           <div className="flex flex-col items-end">
                              <span className="text-4xl font-black tracking-tighter italic leading-none">{cartItems.length}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total items</span>
                           </div>
                        )}
                    </div>
                </header>

                {cartItems.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-primary/10 rounded-[4rem] flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
                        <div className="relative">
                           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                           <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center border border-primary/10">
                              <ShoppingBag className="w-10 h-10 text-primary/40" />
                           </div>
                        </div>
                        <div>
                           <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-3">Your Cart is <span className="text-primary not-italic">Empty.</span></h2>
                           <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Add some delicious items to get started</p>
                        </div>
                        <Button 
                            onClick={() => navigate('/')} 
                            className="btn-primary px-12 h-16 text-lg shadow-2xl shadow-primary/20 group"
                        >
                           Explore Menu <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Cart Items */}
                        <div className="lg:col-span-8 space-y-12">
                            {Object.entries(groupedCart).map(([restName, items], gIdx) => (
                                <section key={gIdx} className="restaurant-group space-y-6">
                                    <div className="flex items-center gap-4 px-4">
                                        <Package className="w-5 h-5 text-primary" />
                                        <h3 className="text-xl font-black uppercase tracking-tight italic">{restName}</h3>
                                        <div className="h-px flex-1 bg-border/50" />
                                        <Badge variant="outline" className="bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border-primary/20">{items.length} Items</Badge>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {items.map((item, i) => (
                                            <Card 
                                                key={item.isDeal ? `${item.dealId}-${i}` : `${item.menuItem}-${i}`} 
                                                id={`cart-item-${item.isDeal ? item.dealId : item.menuItem}`}
                                                className="group relative rounded-[2.5rem] bg-secondary/30 border-transparent hover:border-primary/20 transition-all duration-500 overflow-hidden shadow-xl shadow-black/5"
                                            >
                                                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                                                    {/* Item Selection */}
                                                    <button 
                                                        onClick={() => handleToggleSelect(item.isDeal ? item.dealId : item.menuItem, item.isDeal)}
                                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                                                            item.selected 
                                                            ? 'bg-primary border-primary text-black' 
                                                            : 'bg-transparent border-primary/20 text-transparent hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <Check size={20} className={item.selected ? 'scale-100' : 'scale-0'} />
                                                    </button>

                                                    {/* Item Preview */}
                                                    <div className="relative w-32 h-32 flex-shrink-0 group-hover:scale-105 transition-transform duration-700">
                                                        <img 
                                                           src={item.imageUrl || DEFAULT_IMAGE} 
                                                           alt={item.name} 
                                                           className="w-full h-full object-cover rounded-[1.8rem] shadow-2xl" 
                                                        />
                                                        {item.isDeal && (
                                                           <div className="absolute -top-2 -right-2 bg-primary text-black p-2 rounded-xl shadow-lg border border-black/10 animate-bounce">
                                                              <Zap className="w-4 h-4 fill-black" />
                                                           </div>
                                                        )}
                                                    </div>

                                                    {/* Item Details */}
                                                    <div className="flex-1 text-center md:text-left">
                                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                            <p className="text-xl font-black tracking-tight uppercase leading-none">{item.name}</p>
                                                            {item.isDeal && <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black uppercase">Special Offer</Badge>}
                                                        </div>
                                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Price: rs.{item.price.toFixed(2)}</p>
                                                        
                                                        {/* Select Quantity */}
                                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                                           <div className="flex items-center bg-background/50 rounded-2xl border border-primary/10 p-1">
                                                              <Button 
                                                                  variant="ghost" 
                                                                  size="icon-sm"
                                                                  onClick={() => handleUpdateQty(item.isDeal ? item.dealId : item.menuItem, item.qty - 1, item.isDeal)}
                                                                  disabled={item.qty <= 1}
                                                                  className="rounded-xl hover:bg-primary hover:text-black transition-colors"
                                                              >
                                                                  <Minus size={12}/>
                                                              </Button>
                                                              <span className="w-10 text-center font-black text-sm italic">{item.qty}</span>
                                                              <Button 
                                                                  variant="ghost" 
                                                                  size="icon-sm"
                                                                  onClick={() => handleUpdateQty(item.isDeal ? item.dealId : item.menuItem, item.qty + 1, item.isDeal)}
                                                                  className="rounded-xl hover:bg-primary hover:text-black transition-colors"
                                                              >
                                                                  <Plus size={12}/>
                                                              </Button>
                                                           </div>
                                                        </div>
                                                    </div>

                                                    {/* Item Total */}
                                                    <div className="flex flex-col items-center md:items-end gap-3 min-w-[120px]">
                                                        <div className="text-right">
                                                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 leading-none mb-1">Subtotal</p>
                                                           <p className="text-2xl font-black tracking-tighter italic">rs.{(item.qty * item.price).toFixed(2)}</p>
                                                        </div>
                                                        <Button 
                                                           onClick={() => handleRemove(item.isDeal ? item.dealId : item.menuItem)} 
                                                           variant="ghost" 
                                                           size="icon"
                                                           className="rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                        >
                                                            <Trash2 size={18}/>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* Summary Interface */}
                        <div className="lg:col-span-4 sticky top-32">
                            <Card className="summary-card relative rounded-[3.5rem] bg-secondary/50 border-primary/20 overflow-hidden shadow-2xl shadow-primary/5">
                                <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-5">
                                    <ShoppingBag className="w-64 h-64" />
                                </div>
                                
                                <CardContent className="p-12 relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                       <Activity className="w-5 h-5 text-primary" />
                                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Order Details</span>
                                    </div>
                                    
                                    <h3 className="text-4xl font-black uppercase tracking-tighter mb-10 italic">Order <span className="not-italic text-primary">Summary.</span></h3>
                                    
                                    <div className="space-y-6 mb-12">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>Selected Items</span>
                                            <span className="text-foreground">{selectedItems.length} Items</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Total</span>
                                            <span className="text-xl font-bold tracking-tight">rs.{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="h-px w-full bg-border/50" />
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                               {selectedTable && (
                                                   <div className="flex items-center gap-2 mb-2 p-3 bg-primary/10 border border-primary/20 rounded-xl w-fit">
                                                      <ShoppingBag size={14} className="text-primary" />
                                                      <span className="text-[9px] font-black uppercase text-primary tracking-widest">{selectedTable.tableName || `Table ${selectedTable.tableNumber}`} Selected</span>
                                                   </div>
                                               )}
                                               <span className="text-4xl font-black tracking-tighter italic">rs.{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                               <TrendingDown className="w-6 h-6 text-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    {selectedItems.length === 0 ? (
                                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 text-center italic">
                                            <p className="text-[11px] font-bold text-primary/70 uppercase">Please select items to proceed to checkout.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                           {!userInfo ? (
                                               <Button 
                                                   onClick={() => navigate('/login')}
                                                   className="w-full btn-primary h-20 text-xl font-black shadow-2xl flex items-center justify-between px-10 group"
                                               >
                                                   <span>Login to Continue</span>
                                                   <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                               </Button>
                                           ) : (
                                               <Button 
                                                   onClick={() => navigate('/billing')}
                                                   className="w-full btn-primary h-20 text-xl font-black shadow-2xl flex items-center justify-between px-10 group"
                                               >
                                                   <span>Checkout Now</span>
                                                   <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                               </Button>
                                           )}
                                        </div>
                                    )}

                                    <div className="mt-12 flex gap-4 p-6 rounded-2xl bg-secondary border border-primary/5">
                                        <Info size={24} className="text-primary flex-shrink-0" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wide">
                                           Unselected items will remain in your cart for next time.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
