import Header from "@/components/clientLayout/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-dark overflow-x-hidden">
      {/* Navigation Header */}
      <Header />
      
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative bg-gradient-to-b from-brand-cream via-brand-cream to-[#FAF2E5]">
        {/* Soft background glow highlights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Badge */}
          <span className="text-brand-gold font-semibold tracking-widest text-[11px] uppercase mb-4 bg-brand-gold/10 px-4 py-1.5 rounded-full border border-brand-gold/20 inline-block">
            Welcome to Ikkaye's Kitchen
          </span>
          
          {/* Main Title with Serif styling for culinary feel */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold tracking-tight text-brand-dark mb-6 leading-tight max-w-3xl">
            Where Tradition Meets <span className="text-brand-gold italic">Culinary Art</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-brand-dark-light max-w-2xl mb-10 leading-relaxed font-sans font-light">
            Indulge in our carefully selected artisanal dishes prepared with organic ingredients, heritage spices, and absolute passion. Customize your dining selection today.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            <Link
              href="/menu"
              className="w-full sm:w-auto flex h-12 items-center justify-center rounded-full bg-brand-gold px-8 text-sm font-semibold text-brand-cream shadow-lg hover:bg-brand-gold/90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer select-none"
            >
              Explore Menu
            </Link>
            
            <Link
              href="/selection"
              className="w-full sm:w-auto flex h-12 items-center justify-center rounded-full border border-brand-gold px-8 text-sm font-semibold text-brand-gold hover:bg-brand-gold/5 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer select-none"
            >
              View My Selection
            </Link>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-brand-cream border-t border-brand-gold/10 py-6 text-center text-xs text-brand-dark-light">
        <p>&copy; {new Date().getFullYear()} Ikkaye's Kitchen. Crafted with Love. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
