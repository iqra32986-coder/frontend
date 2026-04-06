import React, { useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  X as CloseIcon,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  Fingerprint
} from 'lucide-react';
import gsap from 'gsap';
import { Button } from './ui/Button';

const InfoModal = ({ 
  isOpen, 
  type = 'info', 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmText = 'Got it', 
  cancelText = 'Cancel',
  icon: CustomIcon
}) => {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        gsap.to(backdropRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(modalRef.current, 
          { opacity: 0, scale: 0.9, y: 20 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      });
      return () => ctx.revert();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      accent: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: <CheckCircle2 size={40} className="text-primary animate-pulse" />,
      btn: 'btn-primary'
    },
    error: {
      accent: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: <XCircle size={40} className="text-red-500 animate-bounce" />,
      btn: 'bg-red-500 hover:bg-red-600 text-white'
    },
    confirm: {
      accent: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      icon: <AlertTriangle size={40} className="text-primary" />,
      btn: 'btn-primary'
    },
    info: {
      accent: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/10',
      icon: <Info size={40} className="text-primary" />,
      btn: 'bg-secondary text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 opacity-0"
        onClick={onCancel}
      ></div>
      
      {/* Modal Card */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-lg bg-black border ${config.border} rounded-[3rem] overflow-hidden shadow-2xl opacity-0`}
      >
        {/* Cinematic Header Asset */}
        <div className="absolute top-0 right-0 p-8 pt-10 pointer-events-none opacity-[0.03]">
           <Fingerprint className="w-64 h-64 -rotate-12" />
        </div>

        <div className="absolute top-6 right-6 z-10">
            <button 
                onClick={onCancel} 
                className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-white transition-all hover:rotate-90"
            >
                <CloseIcon size={20}/>
            </button>
        </div>

        <div className="p-12 flex flex-col items-center text-center relative z-10">
          <div className={`w-24 h-24 rounded-[2rem] ${config.bg} flex items-center justify-center mb-8 border ${config.border} shadow-2xl transition-transform hover:rotate-12`}>
            {CustomIcon || config.icon}
          </div>
          
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-px bg-primary/20" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Notification</span>
          </div>

          <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-6 leading-none">
            {title}
          </h3>
          
          <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-12 opacity-80 uppercase tracking-tight italic">
            "{description}"
          </p>
          
          <div className="flex gap-4 w-full">
            {type === 'confirm' && (
              <Button 
                variant="ghost"
                onClick={onCancel}
                className="flex-1 h-20 rounded-[2rem] bg-secondary/30 border border-primary/5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"
              >
                {cancelText}
              </Button>
            )}
            <Button 
              onClick={() => {
                if(onConfirm) onConfirm();
                if(type !== 'confirm') onCancel(); // Auto-close for notifications
              }}
              className={`flex-1 h-20 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/10 group ${config.btn}`}
            >
              <span className="relative z-10">{confirmText}</span>
              {type !== 'error' && <Zap size={16} className="ml-2 group-hover:scale-125 transition-transform" />}
            </Button>
          </div>
        </div>

        {/* Tactical Footer Badge */}
        <div className="h-2 bg-primary/5 w-full flex">
           <div className="h-full bg-primary animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
