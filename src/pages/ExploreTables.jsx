import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api';
import { 
  Users, 
  MapPin, 
  CalendarDays, 
  CheckCircle, 
  Navigation,
  ArrowRight,
  Layout,
  AlertCircle,
  X,
  Clock,
  Phone,
  Zap,
  Loader2,
  ChevronRight,
  Monitor,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import InfoModal from '../components/InfoModal';
import gsap from 'gsap';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const ExploreTables = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [floorLocation, setFloorLocation] = useState('MAIN HALL');
    const [modal, setModal] = useState({ 
        isOpen: false, 
        type: 'info', 
        title: '', 
        description: '', 
        onConfirm: null 
    });


    const navigate = useNavigate();
    const containerRef = useRef(null);

    const openModal = (config) => setModal({ ...config, isOpen: true });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: tableData } = await api.get('/reservations/tables');
                setTables(tableData);
                
                const { data: settingsData } = await api.get('/admin/settings');
                const location = settingsData.find(s => s.key === 'sittingAreaLocation');
                if (location) setFloorLocation(location.value);
                
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000); 
        return () => clearInterval(interval);
    }, []);

    // Entrance Animation
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.table-card', 
                { opacity: 0, y: 30, scale: 0.95 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
            gsap.fromTo('.header-animate', 
                { opacity: 0, x: -30 }, 
                { opacity: 1, x: 0, duration: 1, ease: 'expo.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading]);



    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Monitor className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting tables ready...</p>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black pb-32">
            
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-10 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary rounded-full blur-[200px]" />
            </div>



            {/* Header Content */}
            <div className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="header-animate flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="space-y-8">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-px bg-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Seating Layout</span>
                         </div>
                         <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                        Available <span className="text-primary italic">Tables.</span>
                    </h2>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-40 max-w-md">
                            Browse and reserve tables in the <span className="text-primary opacity-100">{floorLocation.toUpperCase()}</span> area. See real-time availability.
                        </p>
                    </div>
 
                    <div className="flex items-center gap-6 bg-secondary/20 p-6 rounded-[2rem] border border-primary/5 backdrop-blur-md">
                         <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse" />
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">AVAILABLE</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full bg-secondary border border-primary/20" />
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">OCCUPIED</span>
                             </div>
                         </div>
                         <div className="w-px h-10 bg-primary/10 mx-2" />
                         <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">TABLES OPEN</p>
                             <p className="text-3xl font-black italic">{tables.filter(t => t.status === 'Available').length}</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Hall Full Banner */}
            {tables.length > 0 && tables.every(t => t.status !== 'Available') && (
                <div className="px-6 lg:px-12 max-w-7xl mx-auto mb-10 z-20 relative">
                    <Card className="bg-destructive/10 border-destructive/20 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-destructive text-white flex flex-shrink-0 items-center justify-center animate-pulse shadow-xl shadow-destructive/20">
                                    <AlertCircle size={32}/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-destructive leading-none mb-2">Hall is Full. <span className="not-italic opacity-50">No Place to Sit.</span></h3>
                                    <p className="text-destructive/80 font-black uppercase tracking-widest text-[10px]">Tables will be empty in 5 minutes. Please wait.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Table Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 px-6 lg:px-12 max-w-7xl mx-auto z-10 relative">
                {tables.filter(table => table.status === 'Available').map(table => (
                    <Card key={table._id} className="table-card group relative rounded-[3.5rem] bg-secondary/30 border-primary/5 hover:border-primary/30 transition-all duration-700 overflow-hidden shadow-2xl backdrop-blur-md">
                        
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all duration-700 ${table.status === 'Available' ? 'bg-primary' : 'bg-secondary'}`} />
 
                        <CardContent className="p-10 lg:p-12 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                 <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                     <Users size={28}/>
                                 </div>
                                 <Badge className={`h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${table.status === 'Available' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                                     {table.status === 'Available' ? 'Available' : table.status === 'Pending' ? 'In Progress' : 'Booked'}
                                 </Badge>
                            </div>

                            <div className="space-y-2 mb-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">{table.restaurantName}</span>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{table.tableName || `Table ${table.tableNumber}`}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-50 italic pt-2">
                                     <MapPin size={12} className="text-primary/60"/> {table.placement || 'Standard Area'}
                                </div>
                            </div>
 
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                 <div className="p-5 rounded-[1.8rem] bg-background/50 border border-primary/5 group-hover:border-primary/20 transition-all">
                                     <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">CAPACITY</p>
                                     <p className="text-2xl font-black italic tracking-tighter">{table.capacity} Person</p>
                                 </div>
                                 <div className="p-5 rounded-[1.8rem] bg-background/50 border border-primary/5 group-hover:border-primary/20 transition-all">
                                     <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">VIEW</p>
                                     <p className="text-xs font-black uppercase tracking-widest leading-none mt-2">{table.isWindowSeat ? 'WINDOW' : 'STANDARD'}</p>
                                 </div>
                            </div>
 
                            <div className="mt-auto">
                                {table.status === 'Available' ? (
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Navigating to reserve-table with info:', table.restaurant_id);
                                            navigate(`/reserve-table?restaurantId=${table.restaurant_id}&tableNumber=${table.tableNumber}`);
                                        }}
                                        className="w-full h-16 bg-secondary/50 border border-primary/10 hover:bg-primary hover:text-black hover:border-primary rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-between px-8 group/btn"
                                    >
                                        <span>RESERVE TABLE DIRECTLY</span> <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </Button>
                                ) : table.status === 'Pending' ? (
                                    <div className="w-full h-16 rounded-[2rem] bg-background/40 border border-primary/10 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                                        <Loader2 size={20} className="animate-spin text-primary"/>
                                        <span>UPDATING...</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-16 rounded-[2rem] bg-secondary/50 border border-transparent flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                                        <ShieldCheck size={20}/>
                                        <span>BOOKED</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {tables.length === 0 && (
                <div className="py-40 text-center space-y-8 max-w-lg mx-auto">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto text-primary/20 animate-pulse">
                        <Activity size={48}/>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter italic opacity-30 leading-none mb-3">No <span className="not-italic text-primary">Tables Found.</span></h3>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-30 leading-relaxed">
                            We couldn't find any available tables at the moment. Please check back later or try another restaurant.
                        </p>
                    </div>
                </div>
            )}

            <InfoModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                description={modal.description}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
            />
        </div>
    );
};

export default ExploreTables;
