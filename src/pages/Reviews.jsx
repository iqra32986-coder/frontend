import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
  Star, 
  MessageSquare, 
  User as UserIcon, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Quote, 
  Zap, 
  ArrowUpRight, 
  Activity, 
  Terminal, 
  Edit2, 
  Trash2, 
  X,
  ChevronRight,
  Send,
  MapPin
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import gsap from 'gsap';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const Reviews = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    
    // Form for new review
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', targetType: 'Restaurant', targetId: '' });
    const [restaurants, setRestaurants] = useState([]);
    
    // Edit mode
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Entrance Animation
    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.review-card', 
                { opacity: 0, y: 30, scale: 0.98 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
            gsap.fromTo('.header-animate', 
                { opacity: 0, x: -30 }, 
                { opacity: 1, x: 0, duration: 1, ease: 'expo.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading]);

    const fetchData = async () => {
        try {
            const { data: resData } = await api.get('/restaurants');
            setRestaurants(resData);
            if (resData.length > 0 && !editId) setNewReview(prev => ({ ...prev, targetId: resData[0].user_id }));
            
            const { data: revData } = await api.get('/reviews');
            setAllReviews(revData);
            
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            toast.error('Please sign in to share your experience.');
            return;
        }
        try {
            if (editId) {
                await api.put(`/reviews/${editId}`, newReview);
                setEditId(null);
            } else {
                await api.post('/reviews', newReview);
            }
            // Reset to first restaurant
            setNewReview({ rating: 5, comment: '', targetType: 'Restaurant', targetId: restaurants.length > 0 ? restaurants[0].user_id : '' });
            fetchData();
        } catch (error) {
            console.error('Review submission failed', error);
            toast.error('Failed to save review.');
        }
    };

    const handleEdit = (rev) => {
        setEditId(rev._id);
        setNewReview({
            rating: rev.rating,
            comment: rev.comment,
            targetType: rev.targetType,
            targetId: rev.targetId
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            fetchData();
        } catch(error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete review.');
        }
    };

    const cancelEdit = () => {
        setEditId(null);
        setNewReview({ rating: 5, comment: '', targetType: 'Restaurant', targetId: restaurants.length > 0 ? restaurants[0].user_id : '' });
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Getting customer reviews...</p>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black pb-32 pt-32">
            
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-10 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] bg-primary rounded-full blur-[200px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-secondary rounded-full blur-[200px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 z-10 relative">
                
                {/* --- HEADER & FORM SECTION --- */}
                <div className="flex flex-col lg:flex-row justify-between gap-24 mb-32 items-start">
                    <div className="lg:w-1/2 space-y-10 header-animate">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-px bg-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Verified Customer Reviews</span>
                         </div>
                         <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                            Dine <span className="text-primary italic">Reviews.</span>
                        </h2>
                         <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] opacity-40 max-w-md leading-relaxed pr-10">
                            The real-world pulse of the <span className="text-primary opacity-100 italic">SmartDine Network.</span> Honest testimonials from diners across our restaurant community.
                         </p>
                         <div className="pt-10 flex gap-12 border-t border-primary/10">
                            <div className="space-y-2">
                                <p className="text-4xl font-black italic tracking-tighter text-primary">{allReviews.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Total Reviews</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-4xl font-black italic tracking-tighter">4.9</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Average Rating</p>
                            </div>
                         </div>
                    </div>
                    
                    <Card className="lg:w-1/2 w-full relative rounded-[3.5rem] bg-secondary/30 backdrop-blur-md border-primary/10 p-10 lg:p-14 overflow-hidden shadow-3xl">
                        
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
                        
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none">{editId ? 'UPDATE' : 'POST A'} <span className="text-primary font-cursive lowercase">Review.</span></h3>
                                <div className="flex items-center gap-3">
                                     {editId && <button onClick={cancelEdit} className="w-10 h-10 rounded-full bg-background border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:rotate-90 transition-all shadow-xl" title="Cancel"><X size={18}/></button>}
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl">
                                        <Send size={24}/>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitReview} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Select Restaurant</label>
                                         <select 
                                             className="w-full h-14 bg-background px-6 rounded-2xl border-primary/10 text-xs font-bold uppercase tracking-tight focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                             value={newReview.targetId} 
                                             onChange={(e) => setNewReview({...newReview, targetId: e.target.value})}
                                             disabled={editId !== null}
                                         >
                                             {restaurants.map(r => (
                                                 <option key={r._id} value={r.user_id}>{r.name} — {r.location}</option>
                                             ))}
                                         </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Your Rating</label>
                                         <div className="flex items-center h-14 bg-background px-6 rounded-2xl border border-primary/10 justify-between">
                                             {[1,2,3,4,5].map(nu => (
                                                 <button 
                                                   key={nu}
                                                   type="button"
                                                   onClick={() => setNewReview({...newReview, rating: nu})}
                                                   className={`transition-all ${newReview.rating >= nu ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : 'text-muted-foreground opacity-30 hover:opacity-100'}`}
                                                 >
                                                     <Star size={24} fill={newReview.rating >= nu ? 'currentColor' : 'none'}/>
                                                 </button>
                                             ))}
                                         </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Your Review</label>
                                     <Textarea 
                                         className="min-h-[140px] px-8 py-6 rounded-[2.5rem] bg-background border-primary/10 font-bold uppercase tracking-tight leading-relaxed text-sm"
                                         placeholder="Share your dining experience..." 
                                         required
                                         value={newReview.comment}
                                         onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                     />
                                </div>

                                <Button className="w-full h-20 bg-primary text-black rounded-[2rem] text-xl font-black shadow-2xl flex items-center justify-between px-10 group/btn mt-8">
                                   <span>{editId ? 'UPDATE REVIEW' : 'POST REVIEW'}</span> <ArrowUpRight size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* --- FEED GRID --- */}
                <div className="space-y-12 mb-20 header-animate">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter leading-none">Customer <span className="text-primary font-cursive lowercase">Reviews.</span></h2>
                        <div className="flex items-center gap-4 text-muted-foreground opacity-40">
                             <span className="text-[9px] font-black uppercase tracking-widest">LIVE FEED</span>
                             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {allReviews.slice().reverse().map((rev, i) => {
                        const isOwner = userInfo && userInfo._id === (rev.customer_id?._id || rev.customer_id);
                        const isAdmin = userInfo && userInfo.role === 'Admin';
                        
                        return (
                            <Card key={rev._id || i} className="review-card group relative rounded-[3.5rem] bg-secondary/30 border-primary/5 p-10 lg:p-12 hover:border-primary/20 transition-all duration-700 overflow-hidden shadow-2xl backdrop-blur-md">
                                 
                                 {/* Top Header: User Profile & Actions */}
                                 <div className="flex justify-between items-start mb-8">
                                     <div className="flex items-center gap-5">
                                         <div className="w-14 h-14 rounded-[1.2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-black shadow-xl shrink-0">
                                             {rev.customer_id?.name?.charAt(0) || 'G'}
                                         </div>
                                         <div className="overflow-hidden">
                                             <div className="text-[11px] font-black uppercase tracking-widest truncate leading-tight mb-1">
                                                 {rev.customer_id?.name || 'Guest User'}
                                             </div>
                                             <div className="flex items-center gap-1">
                                                 {[...Array(5)].map((_, j) => (
                                                     <Star key={j} size={10} className={j < rev.rating ? 'text-primary fill-primary' : 'text-muted-foreground opacity-30'}/>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>

                                     {/* Edit / Delete Actions */}
                                      {(isOwner || isAdmin) && (
                                         <div className="flex gap-2">
                                             {isOwner && (
                                                 <button onClick={() => handleEdit(rev)} className="w-10 h-10 rounded-full bg-background/50 border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-xl" title="Edit Review">
                                                     <Edit2 size={14}/>
                                                 </button>
                                             )}
                                             <button onClick={() => handleDelete(rev._id)} className="w-10 h-10 rounded-full bg-background/50 border border-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all shadow-xl" title="Delete Review">
                                                 <Trash2 size={14}/>
                                             </button>
                                         </div>
                                      )}
                                 </div>

                                 {/* Body: The Review Text */}
                                 <div className="relative mb-10 min-h-[100px]">
                                     <Quote size={32} className="text-primary/10 absolute -top-4 -left-4" />
                                     <p className="text-sm font-black tracking-tight leading-relaxed opacity-80 pl-6 border-l-2 border-primary/10">
                                         "{rev.comment}"
                                     </p>
                                 </div>

                                 {/* Footer: Date / Edited Status / Target */}
                                 <div className="pt-8 border-t border-primary/5 flex flex-col gap-4">
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase tracking-widest">
                                             <ShieldCheck size={12}/> VERIFIED DINER
                                         </div>
                                         <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                                            {rev.status === 'Edited' && 'EDITED'}
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 overflow-hidden">
                                         <MapPin size={12}/> 
                                         <span className="truncate">{restaurants.find(r => r.user_id === rev.targetId)?.name || 'Restaurant'}</span>
                                     </div>
                                 </div>
                            </Card>
                        );
                    })}
                </div>

                {allReviews.length === 0 && (
                    <div className="py-40 text-center space-y-10 border-2 border-dashed border-primary/10 rounded-[5rem] animate-pulse">
                         <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/10 text-primary/20">
                             <Activity size={64}/>
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter opacity-30 leading-none">Customer Reviews <span className="text-primary font-cursive lowercase">Soon.</span></h3>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-20 max-w-xs mx-auto">Be the first to share your dining experience with the community.</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
