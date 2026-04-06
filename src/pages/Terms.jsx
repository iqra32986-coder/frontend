const Terms = () => {
    const list = [
        "Once you place an order, it starts right away—so we can’t cancel it.",
        "Prices are set by the restaurant. Please check the price before you pay.",
        "Table bookings depend on availability. Please arrive within 10 minutes.",
        "JazzCash payments are confirmed inside the app after transfer.",
        "Restaurants are responsible for the food quality."
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-px bg-primary" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Service Terms</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-16">
                    Terms <br/> & <span className="text-primary mr-1">Rules.</span>
                </h1>

                <div className="space-y-6 mb-24">
                    {list.map((item, idx) => (
                        <div key={idx} className="group flex items-start gap-8 p-8 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all duration-500">
                            <div className="text-4xl font-black text-primary opacity-20 group-hover:opacity-100 transition-opacity leading-none">0{idx+1}</div>
                            <p className="text-lg font-medium leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">{item}</p>
                        </div>
                    ))}
                </div>

                <div className="p-12 rounded-2xl bg-secondary/50 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
                    <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">SMARTDINE POLICY</div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Agreement</h3>
                        <p className="text-muted-foreground font-medium max-w-xl">By using the SmartDine platform, you agree to the terms outlined above. These rules ensure a reliable and seamless dining experience for all users.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
