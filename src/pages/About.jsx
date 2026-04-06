import { useState, useEffect, useRef } from 'react';
import { 
  Info, 
  Utensils, 
  Users, 
  Globe, 
  Target, 
  Zap, 
  ShieldCheck, 
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const containerRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero parallax
            gsap.fromTo('.hero-image', 
                { scale: 1.1, y: 0 }, 
                { 
                    scale: 1, 
                    y: 50, 
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );

            // Stagger animations
            gsap.fromTo('.about-section', 
                { opacity: 0, y: 50 }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
                    stagger: 0.2, 
                    scrollTrigger: {
                        trigger: '.about-section',
                        start: 'top 80%'
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black pb-32">
            
            {/* --- HERO SECTION --- */}
            <div ref={heroRef} className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img 
                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
                      alt="Gourmet Environment" 
                      className="hero-image w-full h-full object-cover grayscale-[0.2]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background" />
                </div>
                
                <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Our Story</span>
                        <div className="w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-4">
                        Elite <span className="text-primary italic">Selection.</span>
                    </h2>
                    <p className="text-white/60 font-black uppercase tracking-widest text-xs opacity-80">A New Era of Dining</p>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-primary/40 animate-bounce">
                    <span className="text-[8px] font-black uppercase tracking-widest">Scroll Down</span>
                    <ArrowRight className="rotate-90" size={16} />
                </div>
            </div>

            {/* --- STORY MODULE --- */}
            <div className="about-section max-w-7xl mx-auto px-6 lg:px-12 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Info size={16} className="text-primary"/> 
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">About SmartDine</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-cursive tracking-wider lowercase text-foreground leading-none mb-8">
               Elite <span className="text-primary italic">Dining.</span>
            </h1>
                        <div className="space-y-8">
                            <p className="text-2xl font-black italic tracking-tight leading-relaxed opacity-80">
                                Simplifying how the community <span className="text-primary not-italic">experiences food.</span>
                            </p>
                            <div className="w-20 h-1 bg-primary/20" />
                            <div className="space-y-6 text-muted-foreground font-medium leading-relaxed opacity-60">
                                <p>We've created a seamless connection between diners and premium restaurants. Excellence isn't just about the food—it's about the entire experience.</p>
                                <p>SmartDine provides a unified platform for curated menus, real-time comparisons, and effortless ordering.</p>
                            </div>
                        </div>
                    </div>
                    <Button className="h-16 px-10 btn-primary rounded-2xl text-[11px] font-black shadow-2xl flex items-center gap-4 uppercase tracking-[0.2em] group">
                        Start Exploring <ArrowRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                </div>
                
                <div className="relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <Card className="rounded-[4rem] bg-secondary/30 border-primary/10 overflow-hidden shadow-3xl p-10 lg:p-20 relative z-10">
                        <div className="grid grid-cols-2 gap-10">
                             <div className="space-y-2">
                                 <p className="text-5xl font-black italic tracking-tighter text-primary">500+</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Restaurants</p>
                             </div>
                             <div className="space-y-2">
                                 <p className="text-5xl font-black italic tracking-tighter text-foreground">10M+</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Orders Served</p>
                             </div>
                             <div className="space-y-2">
                                 <p className="text-5xl font-black italic tracking-tighter text-foreground">99.9%</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Service Quality</p>
                             </div>
                             <div className="space-y-2 text-primary">
                                 <p className="text-5xl font-black italic tracking-tighter">Gold</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Service Rating</p>
                             </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- CORE VALUES GRID --- */}
            <div className="about-section max-w-7xl mx-auto px-6 lg:px-12 pt-48">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em]">Core Values</Badge>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic">Committed to <span className="text-primary not-italic">Excellence.</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { 
                            icon: <Zap size={32}/>, 
                            title: 'Fast Ordering', 
                            desc: 'Place your order effortlessly with our optimized menu systems.', 
                            color: 'text-primary' 
                        },
                        { 
                            icon: <ShieldCheck size={32}/>, 
                            title: 'Safe Checkout', 
                            desc: 'Secure transactions and verified restaurant partners for peace of mind.', 
                            color: 'text-foreground' 
                        },
                        { 
                            icon: <Command size={32}/>, 
                            title: 'Unified Management', 
                            desc: 'A single platform to manage all your dining experiences and orders.', 
                            color: 'text-primary' 
                        }
                    ].map((pillar, i) => (
                        <Card key={i} className="group relative rounded-[3rem] bg-secondary/30 border-primary/5 p-12 hover:border-primary/30 transition-all duration-700 hover:bg-white/5 overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-20 h-20 bg-background border border-primary/10 rounded-[1.5rem] flex items-center justify-center mb-12 shadow-2xl rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 scale-110 group-hover:scale-100">
                                <span className={pillar.color}>{pillar.icon}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Elite Management</h3>
                            <p className="text-muted-foreground font-medium italic opacity-60 leading-relaxed text-sm pr-6">"A single platform for your dining needs."</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* --- VISION STRIP --- */}
            <div className="about-section max-w-7xl mx-auto px-6 lg:px-12 pt-48">
                <Card className="rounded-[4rem] bg-primary p-12 lg:p-24 flex flex-col lg:flex-row items-center gap-16 shadow-3xl relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-10%] w-[40rem] h-[40rem] bg-white/20 rounded-full blur-[120px] animate-pulse" />
                    
                    <div className="flex-1 space-y-8 relative z-10 text-black">
                        <div className="flex items-center gap-4">
                            <Sparkles size={24} />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-60">Our Vision</span>
                        </div>
                        <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">
                            The Future <br/> of <span className="bg-black text-white px-3 py-1 not-italic">Dining.</span>
                        </h2>
                        <p className="text-xl font-black italic tracking-tight opacity-70 max-w-xl">
                            We focus on quality and convenience—ensuring that every meal you order is a memorable culinary experience.
                        </p>
                    </div>
                    
                    <div className="lg:w-96 space-y-6 relative z-10">
                        {[
                            { 
                                label: 'Verification', 
                                icon: <ShieldCheck size={20}/>, 
                                text: 'Quality checks on every restaurant partner.' 
                            },
                            { 
                                label: 'Intelligence', 
                                icon: <TrendingUp size={20}/>, 
                                text: 'Helpful comparison tools to find the best value.' 
                            },
                            { 
                                label: 'Accessibility', 
                                icon: <Globe size={20}/>, 
                                text: 'Easy-to-use interface for everyone.' 
                            }
                        ].map((val, i) => (
                            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-black/10 backdrop-blur-md border border-white/10 hover:bg-black/20 transition-all cursor-default">
                                <div className="p-3 bg-black text-primary rounded-xl shrink-0">
                                    {val.icon}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-black">{val.label}</h4>
                                    <p className="text-xs font-medium text-black/60 italic leading-tight pr-4">"{val.text}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default About;
