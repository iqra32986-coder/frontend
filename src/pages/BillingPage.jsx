import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { 
  CreditCard, 
  CheckCircle, 
  Info, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Phone, 
  ArrowLeft, 
  Package, 
  Armchair, 
  CheckCircle2, 
  Zap,
  Activity,
  History,
  Navigation,
  Globe
} from 'lucide-react';
import { removeSelectedFromCart, setSelectedTable } from '../features/cartSlice';
import api from '../api';
import SelectTableModal from '../components/SelectTableModal';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const BillingPage = () => {
    const { cartItems, selectedTable } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useThemeStore();

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isProcessing, setIsProcessing] = useState(false);
    const [ordersPlaced, setOrdersPlaced] = useState([]);
    const [contactInfo, setContactInfo] = useState({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: ''
    });
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [jazzCashPayload, setJazzCashPayload] = useState(null);

    const containerRef = useRef(null);
    const successRef = useRef(null);
    const jcFormRef = useRef(null);

    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((a, c) => a + c.price * c.qty, 0);

    useEffect(() => {
        if (selectedItems.length === 0 && ordersPlaced.length === 0) {
            navigate('/cart');
        }
    }, [selectedItems, ordersPlaced.length, navigate]);

    // Entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.billing-header', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
            gsap.fromTo('.billing-card', 
                { opacity: 0, x: -20 }, 
                { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handlePlaceOrder = async () => {
        if (!userInfo) {
            toast.error("Please sign in to complete your order.");
            navigate('/register');
            return;
        }
        if (!contactInfo.name || !contactInfo.phone || !selectedTable) {
            return;
        }
        
        setIsProcessing(true);
        try {
            const { data } = await api.post('/orders', {
                orderItems: selectedItems.map(item => ({
                    ...item,
                    tableNumber: selectedTable.tableNumber 
                })),
                paymentMethod,
                customerContact: contactInfo,
                tableNumber: selectedTable.tableNumber,
                restaurant_id: selectedItems[0].restaurant_id
            });
            // Route based on payment method
            if (data.isJazzCash) {
                setJazzCashPayload(data.jazzCashParams);
                dispatch(removeSelectedFromCart());
                setTimeout(() => {
                    if (jcFormRef.current) jcFormRef.current.submit();
                }, 500);
            } else {
                gsap.to('.billing-content-grid', {
                    opacity: 0,
                    y: -50,
                    duration: 0.5,
                    onComplete: () => {
                        toast.success("New order placed successfully!");
                        dispatch(removeSelectedFromCart());
                        setOrdersPlaced(data.orders);
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Order failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // Success Entrance
    useEffect(() => {
        if (ordersPlaced.length > 0) {
            gsap.fromTo(successRef.current, 
                { opacity: 0, scale: 0.9 }, 
                { opacity: 1, scale: 1, duration: 1, ease: 'power4.out' }
            );
        }
    }, [ordersPlaced.length]);

    if (ordersPlaced.length > 0) {
        return (
            <div ref={successRef} className="min-h-screen bg-background flex items-center justify-center p-6 pt-32">
                <div className="absolute inset-0 z-0 pointer-events-none">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
                   <div className="absolute inset-0 grain-overlay opacity-20" />
                </div>
                
                <Card className="relative w-full max-w-3xl bg-secondary/30 border-primary/20 rounded-[4rem] overflow-hidden shadow-2xl shadow-primary/5">
                    <CardContent className="p-12 lg:p-20 text-center flex flex-col items-center">
                        <div className="relative mb-12">
                           <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                           <div className="relative w-32 h-32 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12">
                              <CheckCircle className="w-16 h-16 text-black" />
                           </div>
                        </div>
                        <div>
                            <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                                Order <span className="text-primary italic">Confirmed.</span>
                            </h2>
                        </div>
                        <p className="text-xl text-muted-foreground font-medium max-w-md mb-12">
                           Your order has been sent to the restaurant. Your selected table is ready for your arrival.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-16">
                           {ordersPlaced.map((order, idx) => (
                               <div key={idx} className="p-8 rounded-[2.5rem] bg-background/50 border border-primary/10 text-left">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-2">Order ID</p>
                                  <p className="text-2xl font-black tracking-tighter italic mb-1 truncate">{order.trackingId}</p>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                     <Activity className="w-3 h-3" /> Preparing Your Meal
                                  </div>
                               </div>
                           ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 w-full">
                            <Button 
                                onClick={() => navigate('/track')} 
                                className="flex-1 btn-primary h-20 text-xl font-black shadow-2xl flex items-center justify-center gap-4 group"
                            >
                                Track Progress <Navigation className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                            <Button 
                                onClick={() => navigate('/')} 
                                variant="outline"
                                className="flex-1 h-20 rounded-[2rem] border-primary/20 text-lg uppercase font-black hover:bg-secondary transition-all"
                            >
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="bg-background min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* Header Section */}
                <header className="billing-header mb-16">
                    <div className="flex items-center gap-4 mb-8">
                       <Button 
                          variant="ghost" 
                          onClick={() => navigate('/cart')}
                          className="group rounded-2xl bg-secondary/50 border border-primary/5 text-muted-foreground hover:text-primary transition-all px-6 h-12"
                       >
                          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Cart
                       </Button>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Checkout</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                        Checkout <span className="text-primary not-italic">Summary.</span>
                    </h1>
                </header>

                <div className="billing-content-grid grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Primary Flow: Summary and Details */}
                    <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Column 1: Verification Data */}
                        <div className="space-y-12">
                           {/* Venue Details Module */}
                           <section className="billing-card space-y-6">
                              <div className="flex items-center gap-4 px-4">
                                 <Armchair className="w-5 h-5 text-primary" />
                                 <h3 className="text-xl font-black uppercase tracking-tight italic">Dining <span className="not-italic text-primary">Table.</span></h3>
                                 <div className="h-px flex-1 bg-border/50" />
                              </div>
                              
                               {selectedTable ? (
                                 <Card className="rounded-[3rem] bg-secondary/30 border-transparent overflow-hidden shadow-2xl shadow-black/5 group hover:border-primary/20 transition-all cursor-pointer" onClick={() => setIsTableModalOpen(true)}>
                                    <CardContent className="p-8 flex items-center justify-between">
                                       <div className="flex items-center gap-6">
                                          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center rotate-6 shadow-2xl shadow-primary/20">
                                             <Navigation className="w-8 h-8 text-black" />
                                          </div>
                                          <div>
                                             <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Your Table</p>
                                             <p className="text-3xl font-black tracking-tighter italic leading-none">{selectedTable.tableName || `Table ${selectedTable.tableNumber}`}</p>
                                             <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest mt-2">{selectedTable.placement || 'Main Area'} — {selectedTable.capacity || 2} Person Capacity</p>
                                          </div>
                                       </div>
                                       <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                          <CheckCircle2 className="w-6 h-6 text-primary" />
                                       </div>
                                    </CardContent>
                                 </Card>
                               ) : (
                                 <Button 
                                    onClick={() => setIsTableModalOpen(true)}
                                    className="w-full h-40 rounded-[3rem] bg-secondary/30 border-2 border-dashed border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary group"
                                 >
                                    <div className="w-16 h-16 rounded-2xl bg-background border border-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                       <Armchair className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                       <p className="text-sm font-black uppercase tracking-widest">Select Your Table</p>
                                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Required to place order</p>
                                    </div>
                                 </Button>
                               )}
                           </section>

                           {/* Settlement Manifest Module */}
                           <section className="billing-card space-y-6">
                              <div className="flex items-center gap-4 px-4">
                                 <Package className="w-5 h-5 text-primary" />
                                 <h3 className="text-xl font-black uppercase tracking-tight italic">Your <span className="not-italic text-primary">Order.</span></h3>
                                 <div className="h-px flex-1 bg-border/50" />
                              </div>
                              
                              <Card className="rounded-[3rem] bg-secondary/30 border-transparent overflow-hidden shadow-2xl shadow-black/5">
                                 <CardContent className="p-10 space-y-8">
                                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                       {selectedItems.map((item, idx) => (
                                          <div key={idx} className="flex items-center justify-between group">
                                             <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-background border border-primary/10 rounded-2xl flex items-center justify-center text-lg font-black italic text-primary group-hover:scale-110 transition-transform">
                                                   {item.qty}x
                                                </div>
                                                <div>
                                                   <p className="font-black uppercase tracking-tight text-foreground leading-none mb-1">{item.name}</p>
                                                   <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Price: Rs. {item.price.toLocaleString()}</p>
                                                </div>
                                             </div>
                                             <div className="text-right">
                                                <p className="text-xl font-black tracking-tighter italic leading-none">Rs. {(item.qty * item.price).toLocaleString()}</p>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                    
                                    <div className="pt-8 border-t border-border/50">
                                       <div className="flex justify-between items-end">
                                          <div>
                                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-1">Total Payable</p>
                                             <p className="text-4xl font-black tracking-tighter leading-none italic">Rs. {subtotal.toLocaleString()}</p>
                                          </div>
                                          <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase opacity-40">
                                             <ShieldCheck className="w-3 h-3" /> Encrypted Transaction
                                          </div>
                                       </div>
                                    </div>
                                 </CardContent>
                              </Card>
                           </section>
                        </div>

                        {/* Column 2: Authentication & Payment Form */}
                        <div className="space-y-12">
                           <section className="billing-card space-y-6">
                              <div className="flex items-center gap-4 px-4">
                                 <User className="w-5 h-5 text-primary" />
                                 <h3 className="text-xl font-black uppercase tracking-tight italic">Your <span className="not-italic text-primary">Info.</span></h3>
                                 <div className="h-px flex-1 bg-border/50" />
                              </div>
                              
                              <Card className="rounded-[3rem] bg-secondary/50 border-primary/20 overflow-hidden shadow-2xl">
                                 <CardContent className="p-10 space-y-8">
                                    <div className="space-y-6">
                                       <div className="space-y-2">
                                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Full Name</label>
                                          <div className="relative group">
                                             <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                             <Input 
                                                type="text" 
                                                placeholder="Enter your name..." 
                                                className="pl-14 h-16 rounded-[1.5rem] bg-background/50 border-primary/10 transition-all font-bold"
                                                value={contactInfo.name}
                                                onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                                             />
                                          </div>
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Phone Number</label>
                                          <div className="relative group">
                                             <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                             <Input 
                                                type="tel" 
                                                placeholder="+92 XXX XXXXXXX" 
                                                className="pl-14 h-16 rounded-[1.5rem] bg-background/50 border-primary/10 transition-all font-bold"
                                                value={contactInfo.phone}
                                                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                                             />
                                          </div>
                                       </div>
                                    </div>

                                    {/* Settlement Selection */}
                                    <div className="space-y-6 pt-4">
                                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Payment Method</label>
                                       <div className="grid grid-cols-2 gap-4">
                                          {['COD', 'JazzCash'].map((meth) => (
                                             <button 
                                                key={meth}
                                                onClick={() => setPaymentMethod(meth)}
                                                className={`h-24 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all duration-500 border-2 ${
                                                    paymentMethod === meth 
                                                    ? 'bg-primary/10 border-primary text-primary scale-105 shadow-xl shadow-primary/10' 
                                                    : 'bg-background/20 border-primary/5 text-muted-foreground hover:border-primary/20'
                                                }`}
                                             >
                                                <CreditCard className={`w-6 h-6 ${paymentMethod === meth ? 'text-primary' : 'text-muted-foreground/30'}`} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{meth}</span>
                                             </button>
                                          ))}
                                       </div>
                                    </div>

                                    <div className="pt-8 space-y-6">
                                       <Button 
                                          onClick={handlePlaceOrder} 
                                          disabled={isProcessing || !contactInfo.name || !contactInfo.phone || !selectedTable}
                                          className="w-full btn-primary h-24 text-2xl font-black shadow-2xl flex items-center justify-between px-12 group overflow-hidden"
                                       >
                                          <div className="relative z-10 flex items-center gap-4">
                                             {isProcessing ? (
                                                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                             ) : (
                                                <span>Place Order</span>
                                             )}
                                          </div>
                                          {!isProcessing && <CreditCard size={32} className="relative z-10 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />}
                                          <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                       </Button>
                                       
                                       <div className="flex gap-4 p-6 rounded-2xl bg-primary/5 border border-primary/10 items-center justify-center">
                                          <ShieldCheck size={20} className="text-primary" />
                                          <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wide">Secure checkout — Delivery to your table</p>
                                       </div>
                                    </div>
                                 </CardContent>
                              </Card>
                           </section>
                        </div>
                    </div>
                </div>
            </div>

            <SelectTableModal 
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                onSelect={(table) => {
                    dispatch(setSelectedTable(table));
                    setIsTableModalOpen(false);
                }}
                restaurantId={selectedItems[0]?.restaurant_id}
            />

            {jazzCashPayload && (
                <form 
                    action="https://sandbox.jazzcash.com.pk/CustomerPortal/transaction/Checkout" 
                    method="POST" 
                    ref={jcFormRef} 
                    className="hidden"
                >
                    {Object.entries(jazzCashPayload).map(([key, value]) => (
                        <input key={key} type="hidden" name={key} value={value} />
                    ))}
                </form>
            )}
        </div>
    );
};

export default BillingPage;
