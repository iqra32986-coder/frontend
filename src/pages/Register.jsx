import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  ShieldCheck, 
  ChevronRight, 
  Activity, 
  Terminal, 
  Mail, 
  Lock, 
  User, 
  Key,
  ArrowRight,
  Database,
  Fingerprint,
  CheckCircle2,
  UserCircle
} from 'lucide-react';
import { setCredentials } from '../features/authSlice';
import api from '../api';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const { cartItems } = useSelector((state) => state.cart);
    
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.register-card', 
                { opacity: 0, scale: 0.9, y: 20 }, 
                { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power4.out' }
            );
            gsap.fromTo('.stagger-reveal', 
                { opacity: 0, x: -10 }, 
                { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            dispatch(setCredentials(data));
            
            // Success animation before navigation
            gsap.to('.register-card', {
                scale: 1.05,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    if (cartItems.length > 0) {
                        navigate('/billing');
                    } else {
                        navigate('/');
                    }
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setIsLoading(false);
            // Error shake animation
            gsap.to('.register-card', { x: 10, duration: 0.1, repeat: 3, yoyo: true });
        }
    };

    return (
        <div ref={containerRef} className="bg-background min-h-screen flex items-center justify-center p-6 pt-32">
            <div className="absolute inset-0 z-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px]" />
               <div className="absolute inset-0 grain-overlay opacity-10" />
            </div>

            <Card className="register-card w-full max-w-md bg-secondary/30 border-primary/20 rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10">
                <CardContent className="p-10 lg:p-14">
                    
                    {/* Header Module */}
                    <header className="mb-12 text-center">
                        <div className="flex justify-center mb-8">
                           <div className="relative group cursor-pointer">
                              <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full" />
                              <div className="relative w-20 h-20 rounded-[2rem] bg-background border border-primary/20 flex items-center justify-center -rotate-12 transition-transform duration-500 hover:rotate-0">
                                 <UserCircle className="w-10 h-10 text-primary" />
                              </div>
                           </div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-8 text-center md:text-left">
                           Create <span className="text-primary italic">Account.</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] stagger-reveal">Join SmartDine Gourmet</p>
                    </header>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                             <Terminal className="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-2 stagger-reveal">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                <Input 
                                    type="text" 
                                    required 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="pl-14 h-16 rounded-[1.5rem] bg-background/50 border-primary/10 transition-all font-bold"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 stagger-reveal">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                <Input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="pl-14 h-16 rounded-[1.5rem] bg-background/50 border-primary/10 transition-all font-bold"
                                    placeholder="operative@network.com"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2 stagger-reveal">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                <Input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="pl-14 h-16 rounded-[1.5rem] bg-background/50 border-primary/10 transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <Button 
                           type="submit" 
                           disabled={isLoading} 
                           className="w-full btn-primary h-20 text-xl font-black shadow-2xl flex items-center justify-between px-10 group overflow-hidden mt-8 stagger-reveal"
                        >
                            <div className="relative z-10 flex items-center gap-4">
                               {isLoading ? (
                                  <Activity size={24} className="animate-spin" />
                               ) : (
                                  <span>Register Now</span>
                               )}
                            </div>
                            {!isLoading && <ChevronRight size={28} className="relative z-10 group-hover:translate-x-2 transition-transform opacity-40 group-hover:opacity-100" />}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </Button>
                    </form>
                    
                    <div className="mt-12 text-center stagger-reveal">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Already registered?</p>
                        <Link 
                           to="/login" 
                           className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-lg hover:gap-4 transition-all"
                        >
                            Login <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="mt-10 p-4 rounded-2xl bg-secondary flex items-center gap-3 stagger-reveal border border-primary/5">
                       <ShieldCheck className="w-5 h-5 text-primary/40" />
                       <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">By registering, you agree to our terms of service and privacy policy.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
