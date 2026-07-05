import Link from "next/link";
import { Utensils, Coffee, Star } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#1F1209] text-brand-cream py-16 transition-colors duration-300 border-t border-brand-gold/10">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 items-start">
                    
                    {/* Brand Section */}
                    <div className="flex flex-col items-start">
                        <Link href="/" className="font-playfair text-3xl font-bold tracking-wide text-brand-cream hover:text-brand-gold transition-colors duration-300">
                            Ikayees
                        </Link>
                        <p className="text-[13px] leading-relaxed text-brand-cream/60 mt-5 max-w-[260px] font-sans font-light select-none">
                            © 2024 Ikayees Restaurant. Culinary Craftsmanship Since 1995.
                        </p>
                    </div>

                    {/* Menu Section */}
                    <div className="flex flex-col items-start">
                        <h3 className="font-sans font-medium text-[15px] text-brand-cream tracking-wide mb-5">
                            Menu
                        </h3>
                        <nav className="flex flex-col gap-3">
                            <Link 
                                href="/heritage" 
                                className="text-[14px] text-brand-cream/60 hover:text-brand-gold transition-colors duration-200 font-sans font-light"
                            >
                                About Us
                            </Link>
                            <Link 
                                href="/menu" 
                                className="text-[14px] text-brand-cream/60 hover:text-brand-gold transition-colors duration-200 font-sans font-light"
                            >
                                Reservations
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col items-start">
                        <h3 className="font-sans font-medium text-[15px] text-brand-cream tracking-wide mb-5">
                            Contact
                        </h3>
                        <nav className="flex flex-col gap-3">
                            <Link 
                                href="/contact" 
                                className="text-[14px] text-brand-cream/60 hover:text-brand-gold transition-colors duration-200 font-sans font-light"
                            >
                                Privacy Policy
                            </Link>
                            <Link 
                                href="/contact" 
                                className="text-[14px] text-brand-cream/60 hover:text-brand-gold transition-colors duration-200 font-sans font-light"
                            >
                                Terms of Service
                            </Link>
                        </nav>
                    </div>

                    {/* Social/Icons Section */}
                    <div className="flex items-center gap-6 sm:justify-start lg:justify-end w-full lg:pt-1">
                        <Link 
                            href="/menu" 
                            className="text-brand-cream/80 hover:text-brand-gold transition-all duration-300 hover:scale-110 active:scale-95"
                            aria-label="Menu"
                        >
                            <Utensils className="size-[22px] stroke-[1.5]" />
                        </Link>
                        <Link 
                            href="/menu" 
                            className="text-brand-cream/80 hover:text-brand-gold transition-all duration-300 hover:scale-110 active:scale-95"
                            aria-label="Dining"
                        >
                            <Coffee className="size-[22px] stroke-[1.5]" />
                        </Link>
                        <Link 
                            href="/selection" 
                            className="text-brand-cream/80 hover:text-brand-gold transition-all duration-300 hover:scale-110 active:scale-95"
                            aria-label="Selection"
                        >
                            <Star className="size-[22px] stroke-[1.5]" />
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}