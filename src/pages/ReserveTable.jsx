import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import { 
  CalendarClock, 
  User, 
  Phone, 
  Clock, 
  Info,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ShoppingBag,
  Navigation,
  XCircle,
  CheckCircle
} from 'lucide-react';

const ReserveTable = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paramRestaurantId = searchParams.get('restaurantId') || '';
    const paramTableNumber = searchParams.get('tableNumber') || 'Unassigned';

    const [form, setForm] = useState({ 
        arrivalTime: '15 mins',
        guestName: userInfo?.name || '',
        guestPhone: ''
    });
    const [location, setLocation] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
    }, [userInfo, navigate]);

    const fetchLiveLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Location tracking is not supported by your browser.");
            return;
        }
        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: "Live Location Shared"
                });
                setFetchingLocation(false);
            },
            () => {
                toast.error("Failed to get your location.");
                setFetchingLocation(false);
            }
        );
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!form.guestName || !form.guestPhone) {
            toast.error('Please input your name and phone number.');
            return;
        }

        if (!paramRestaurantId || paramTableNumber === 'Unassigned') {
            toast.error("Please select a specific table from the layout.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/reservations', {
                restaurant_id: paramRestaurantId,
                tableNumber: paramTableNumber,
                ...form,
                liveLocation: location,
                preOrderedItems: [] 
            });
            toast.success("Spot secured! The admin has been notified.");
            setSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking request failed.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pt-32 text-center text-foreground selection:bg-primary selection:text-black">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
                </div>
                <div className="relative z-10 max-w-lg space-y-10">
                    <div className="w-32 h-32 mx-auto rounded-[2rem] bg-primary flex items-center justify-center rotate-12 shadow-2xl shadow-primary/20">
                        <CalendarClock size={64} className="text-black"/>
                    </div>
                    <div>
                        <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase mb-6 leading-none">Booking <br/> <span className="text-primary italic">Confirmed.</span></h2>
                        <p className="text-xl text-muted-foreground font-medium mb-12">
                            Your reservation has been received. You can view the status in your orders.
                        </p>
                        <button 
                            onClick={() => navigate('/myorders')} 
                            className="bg-primary text-black h-20 w-full rounded-[2rem] text-xl font-black uppercase flex items-center justify-center gap-4 hover:scale-105 transition-transform"
                        >
                            VIEW ORDERS <ArrowUpRight size={26} className=""/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pt-32 pb-32 text-foreground selection:bg-primary selection:text-black relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary"><ShoppingBag size={12} className="inline mr-2"/> Reservation</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-4">Book <span className="text-primary not-italic">Spot.</span></h2>
                    <p className="text-xl text-muted-foreground font-medium max-w-xl">
                        Secure your spot in the Gourmet Hall. Fast, effortless walk-in reservations.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Left Column: Visuals & Info */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border border-primary/10">
                            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" alt="Tables" className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-10 left-10 right-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-black mb-6 shadow-xl bg-primary">
                                    <Clock size={32}/>
                                </div>
                                <div className="space-y-2">
                                     <h3 className="text-3xl font-black tracking-tighter uppercase italic">Table <span className="not-italic text-primary">{paramTableNumber}.</span></h3>
                                    <p className="text-sm font-medium text-white/70">
                                        You are booking a confirmed spot at <span className="font-bold underline text-white">Table {paramTableNumber}</span>. 
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md w-max border text-primary border-primary/20">
                                   <Activity size={14} className="animate-pulse"/>
                                    <span>Live Monitoring</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-7 bg-secondary/30 rounded-[3rem] p-10 lg:p-14 border border-primary/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Guest <span className="not-italic text-primary">Details.</span></h3>
                            <Info size={24} className="text-muted-foreground opacity-50"/>
                        </div>
 
                        <form onSubmit={submitHandler} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Full Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="w-full h-16 bg-background rounded-[1.5rem] px-6 pl-14 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                                            placeholder="Your Name"
                                            required
                                            value={form.guestName}
                                            onChange={(e) => setForm({...form, guestName: e.target.value})}
                                        />
                                        <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary"/>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Phone Number</label>
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            className="w-full h-16 bg-background rounded-[1.5rem] px-6 pl-14 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                                            placeholder="+92 XXX XXXXXXX"
                                            required
                                            value={form.guestPhone}
                                            onChange={(e) => setForm({...form, guestPhone: e.target.value})}
                                        />
                                        <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary"/>
                                    </div>
                                </div>
                            </div>
 
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Expected Arrival Within</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full h-16 bg-background rounded-[1.5rem] px-6 pl-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20 appearance-none"
                                            value={form.arrivalTime}
                                            onChange={(e) => setForm({...form, arrivalTime: e.target.value})}
                                        >
                                            <option value="5 mins" className="bg-black text-white">05 Minutes</option>
                                            <option value="15 mins" className="bg-black text-white">15 Minutes</option>
                                            <option value="30 mins" className="bg-black text-white">30 Minutes</option>
                                            <option value="1 hour+" className="bg-black text-white">60+ Minutes</option>
                                        </select>
                                        <Clock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={fetchLiveLocation}
                                    disabled={fetchingLocation}
                                    type="button"
                                    className={`w-full h-16 rounded-[1.5rem] border-2 border-dashed flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${location ? 'border-primary bg-primary/10 text-primary' : 'border-primary/20 text-muted-foreground hover:border-primary/50'}`}
                                >
                                    <Navigation size={18} className={fetchingLocation ? 'animate-spin' : ''}/> {fetchingLocation ? 'Locating...' : location ? 'Location Shared' : 'Share Live Location (Optional)'}
                                </button>
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading || !paramRestaurantId}
                                    className="w-full h-20 bg-primary text-black rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'PLEASE WAIT...' : <>CONFIRM BOOKING <ArrowUpRight size={26} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/></>}
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 text-muted-foreground py-4 bg-background rounded-2xl border border-primary/5">
                                <ShieldCheck size={18} className="text-primary"/> 
                                <span className="text-[10px] font-bold uppercase tracking-widest">Booking is subject to real-time space availability.</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReserveTable;
