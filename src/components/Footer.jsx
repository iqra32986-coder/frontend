import { Link, useNavigate } from 'react-router-dom';
import { Globe, Send, Play, Camera, Utensils, ArrowUpRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const Footer = () => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '#' },
      { name: 'Press Kit', href: '#' },
    ],
    support: [
      { name: 'Help Hub', href: '#' },
      { name: 'Safety', href: '#' },
      { name: 'Policy', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
    ],
    business: [
      { name: 'Partner Hub', href: '#' },
      { name: 'For Drivers', href: '#' },
      { name: 'Enterprise', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Camera, href: '#', label: 'Instagram' },
    { icon: Send, href: '#', label: 'Twitter' },
    { icon: Globe, href: '#', label: 'Facebook' },
    { icon: Play, href: '#', label: 'Youtube' },
  ];

  return (
    <footer 
      className="py-24 section-padding relative overflow-hidden bg-background border-t border-border/50"
    >
      {/* Decorative Gradient Blob */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="text-3xl font-black tracking-tighter transition-all hover:opacity-80 flex items-center gap-2 group"
            >
              <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
                 <Utensils className="w-6 h-6 text-black" />
              </div>
              <span>Smart<span className="text-primary">Dine</span></span>
            </Link>
            <p className="mt-6 text-sm font-medium leading-relaxed max-w-sm text-muted-foreground">
              The premier dining platform for the refined diner. Experience effortless ordering, real-time tracking, and verified restaurant reviews all in one bold interface.
            </p>
            
            <div className="flex gap-4 mt-10">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 hover:bg-primary hover:text-black hover:-translate-y-2 border border-border shadow-xl shadow-primary/5 active:scale-90"
                   style={{
                    backgroundColor: theme === 'dark' ? '#111' : '#f9f9f9',
                  }}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl bg-secondary/50 border border-primary/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
               <h4 className="text-xl font-black uppercase tracking-tighter mb-2 relative z-10">Join the <span className="text-primary">Kitchen</span></h4>
               <p className="text-xs font-medium text-muted-foreground mb-6 relative z-10">Scale your restaurant operations with the platform designed for precision.</p>
               <button 
                  onClick={() => navigate('/register')}
                  className="btn-primary w-full shadow-2xl hover:rotate-0"
               >
                   Become a Partner
               </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} SmartDine Platform.</span>
            <span className="hidden md:inline">|</span>
            <div className="flex gap-4">
                <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Platform Status: Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
