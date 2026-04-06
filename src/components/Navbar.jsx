import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut, History, Star, Info, ShieldAlert, Utensils, Store, Tag, Scale, CalendarClock } from 'lucide-react';
import { logout } from '../features/authSlice';
import { useThemeStore } from '../store/themeStore';
import ThemeToggle from './ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from './ui/Sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import navbaricon from '../assets/icons/favicon-32x32.png'
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { theme } = useThemeStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Shop', path: '/shop', icon: <Store className="w-4 h-4" /> },
    { name: 'Deals & Promotions', path: '/deals', icon: <Tag className="w-4 h-4" /> },
    { name: 'Table Reservation', path: '/explore-tables', icon: <CalendarClock className="w-4 h-4" /> },
    { name: 'Compare', path: '/compare', icon: <Scale className="w-4 h-4" /> },
  ];

  const isActive = (path) => location.pathname === path;
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/restaurant');

  if (isDashboard) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl py-3 border-b border-border/50 shadow-2xl shadow-primary/5'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-black tracking-tighter transition-all hover:scale-105 active:scale-95 group flex items-center gap-2 sm:gap-3"
        >
          <div className="bg-transparent p-1.5 rounded-lg  group-hover:rotate-12 transition-transform shrink-0">
             <img src={navbaricon} alt="" className="w-10 h-10 rounded-full text-black" />
          </div>
          <div className="flex flex-col items-center justify-center sm:flex-row sm:gap-2 leading-none">
            <span className="text-foreground">Smart Dine</span>
            <span className="text-primary  text-[10px] sm:text-2xl tracking-[0.2em] sm:tracking-tighter uppercase sm:normal-case mt-1 sm:mt-0">Food Court</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                isActive(link.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all duration-500 ${
                isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground outline-none flex items-center gap-1 transition-colors">
              More <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 w-48 p-2 card-modern">
               <DropdownMenuItem onClick={() => navigate('/about')} className="rounded-xl cursor-pointer py-3">
                  <Info className="w-4 h-4 mr-2" /> About Us
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => navigate('/reviews')} className="rounded-xl cursor-pointer py-3">
                  <Star className="w-4 h-4 mr-2" /> Reviews
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
             <ThemeToggle />
          </div>

          {/* Cart Trigger (Sheet) */}
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="relative group p-3 rounded-2xl bg-secondary/50 hover:bg-primary transition-all duration-500 hover:rotate-6 shadow-xl shadow-primary/5 active:scale-90"
              >
                <ShoppingCart className="w-5 h-5 group-hover:text-black transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black border-2 border-background animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-2xl border-l border-primary/10">
              <SheetHeader className="border-b border-border/50 pb-6 mb-6">
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter">Your <span className="text-primary">Cart</span></SheetTitle>
                <SheetDescription className="sr-only">
                  Detailed view of items added to your shopping cart.
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto px-2">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <ShoppingCart className="w-20 h-20 mb-6 stroke-[1]" />
                    <p className="text-sm font-medium">Your cart is empty.</p>
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/shop')}
                        className="mt-2 text-primary font-bold"
                    >
                        Browse the Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item, index) => (
                      <div
                        key={item._id || item.menuItem || item.dealId || item.product || index}
                        className="group flex items-center gap-5 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all duration-500"
                      >
                        <div className="relative overflow-hidden rounded-2xl h-16 w-16 bg-muted">
                            <img
                             src={item.image || item.imageUrl || "/placeholder.png"}
                             alt={item.name}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm uppercase truncate tracking-tight">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                             <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[9px] font-black uppercase">qty: {item.qty}</Badge>
                             </div>
                             <span className="text-xs font-bold text-primary">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-8 mt-4 border-t border-border/50 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Subtotal</span>
                        <span className="text-2xl font-black tracking-tighter leading-none">
                          <span className="text-primary mr-1">rs.</span>
                          {cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate('/cart')}
                        className="w-full btn-primary h-14"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Account Profile */}
          {userInfo ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer group active:scale-95 transition-transform">
                   <div className="w-11 h-11 rounded-2xl bg-primary border-2 border-primary group-hover:rotate-6 transition-all duration-500 overflow-hidden shadow-xl shadow-primary/20">
                      {userInfo.avatar ? (
                        <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black font-black uppercase tracking-tighter">
                           {userInfo.name.charAt(0)}
                        </div>
                      )}
                   </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-4 w-64 p-3 card-modern border-primary/10">
                <div className="p-4 mb-2 bg-primary/5 rounded-2xl border border-primary/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Logged in as</p>
                   <p className="font-black text-foreground uppercase tracking-tight truncate">{userInfo.name}</p>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">{userInfo.role}</p>
                </div>
                
                <DropdownMenuSeparator className="bg-primary/5 my-2" />
                
                {(userInfo.role === 'Admin' || userInfo.role === 'Restaurant') && (
                    <DropdownMenuItem 
                      onClick={() => navigate(userInfo.role === 'Admin' ? '/admin' : '/restaurant')}
                      className="rounded-xl cursor-pointer py-3 group"
                    >
                      {userInfo.role === 'Admin' ? <ShieldAlert className="w-4 h-4 mr-2 text-primary" /> : <Store className="w-4 h-4 mr-2 text-primary" />}
                      <span className="uppercase text-[10px] font-black tracking-wider">Dashboard</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => navigate('/myorders')} className="rounded-xl cursor-pointer py-3 group">
                   <History className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                   <span className="uppercase text-[10px] font-black tracking-wider group-hover:text-primary transition-colors">Order History</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/myreviews')} className="rounded-xl cursor-pointer py-3 group">
                   <Star className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="uppercase text-[10px] font-black tracking-wider group-hover:text-primary transition-colors">My Reviews</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-primary/5 my-2" />
                
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-3 bg-destructive/5 hover:bg-destructive/10 text-destructive border border-transparent hover:border-destructive/20 mt-2">
                   <LogOut className="w-4 h-4 mr-2" />
                    <span className="uppercase text-[10px] font-black tracking-wider leading-none">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
               <Button className="btn-primary px-8 h-12 hidden sm:flex">
                  Sign In
               </Button>
               <div className="sm:hidden p-3 rounded-2xl bg-primary text-black">
                  <User className="w-5 h-5" />
               </div>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 rounded-2xl bg-secondary/50 text-foreground transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-background/95 backdrop-blur-2xl z-40 animate-in fade-in slide-in-from-top-4 duration-500 overflow-y-auto">
          <div className="p-8 space-y-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Navigation</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-6 group"
                >
                  <div className="bg-secondary/50 p-4 rounded-3xl group-hover:bg-primary group-hover:text-black transition-all duration-500 group-hover:rotate-6">
                     {link.icon}
                  </div>
                  <span className="text-4xl font-black uppercase tracking-tighter transition-all group-hover:translate-x-4">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="pt-12 border-t border-border/50">
               <div className="flex flex-col gap-6">
                 <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">About Us</Link>
                 <Link to="/reviews" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Feedback</Link>
               </div>
            </div>

            <div className="pt-8">
               <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
