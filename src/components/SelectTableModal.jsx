import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
  Users, 
  MapPin, 
  X,
  Clock,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Armchair
} from 'lucide-react';
import gsap from 'gsap';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

const SelectTableModal = ({ isOpen, onClose, onSelect, restaurantId }) => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchTables = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/reservations/tables');
                // Fetch all available tables across all restaurants
                const availableTables = data.filter(t => t.status === 'Available');
                setTables(availableTables);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchTables();
    }, [isOpen, restaurantId]);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(modalRef.current, 
                { opacity: 0, scale: 0.9, y: 20 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
            <Card ref={modalRef} className="relative w-full max-w-4xl max-h-[85vh] bg-card border-primary/10 rounded-[3rem] shadow-3xl overflow-hidden flex flex-col">
                
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <header className="p-10 lg:p-12 border-b border-primary/5 flex items-center justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Armchair className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Table Selection</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter italic">Select Your <span className="text-primary not-italic text-shadow-glow">Table.</span></h3>
                    </div>
                    <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:rotate-90">
                        <X size={24}/>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 lg:p-12 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Checking Seating...</p>
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-12">
                            <p className="text-xl font-black uppercase tracking-tighter opacity-30 italic mb-2">No Available Tables.</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">All tables are currently occupied or reserved.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tables.map(table => (
                                <Card 
                                    key={table._id} 
                                    className="group relative rounded-[2.5rem] bg-secondary/30 border-primary/5 hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-xl"
                                    onClick={() => onSelect(table)}
                                >
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-background border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                                                <Users size={24}/>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 italic mb-1 block">{table.restaurantName}</span>
                                                <p className="text-2xl font-black tracking-tighter italic leading-none">{table.tableName || `Table ${table.tableNumber}`}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{table.capacity} Person — {table.placement}</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="p-8 bg-primary/5 border-t border-primary/10 flex items-center justify-center gap-4">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Real-time availability for our guests</span>
                </footer>
            </Card>
        </div>
    );
};

export default SelectTableModal;
