"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cartStore";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    // { label: "My Selection", href: "/selection" },
    { label: "Our Heritage", href: "/heritage" },
    { label: "Contact", href: "/contact" },
];

export default function Header() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { items } = useCart();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return (
        <header className="sticky top-0 z-50 w-full bg-brand-cream/95 backdrop-blur-md border-b border-brand-gold/10 transition-colors shadow-sm duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="relative overflow-hidden rounded-full border border-brand-gold/20 p-1 bg-white transition-all duration-300 group-hover:scale-105 group-hover:border-brand-gold">
                                <Image
                                    src="/logos/ikkayeslogo.png"
                                    alt="Ikkayes Kitchen Logo"
                                    width={56}
                                    height={56}
                                    className="rounded-full object-cover"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_ITEMS.map((item) => {
                            // Active check: matches exactly or matches parent path
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group relative py-2 text-sm font-medium transition-colors font-sans tracking-wide",
                                        isActive
                                            ? "text-brand-gold font-sans font-semibold"
                                            : "text-brand-dark font-sans hover:text-brand-gold"
                                    )}
                                >
                                    {item.label}
                                    {/* Sliding underline active indicator */}
                                    <span
                                        className={cn(
                                            "absolute bottom-0 inset-x-0 h-[2px] bg-brand-gold transition-transform duration-300 origin-center",
                                            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                        )}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Action Section (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/selection"
                            className="relative flex size-11 cursor-pointer items-center justify-center rounded-full border border-brand-gold/20 text-brand-dark hover:text-brand-gold hover:border-brand-gold transition-all duration-300 bg-brand-cream/50 hover:bg-white hover:scale-105 shadow-sm"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="size-5.5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Actions: burger + cart */}
                    <div className="flex md:hidden items-center gap-2">
                        <Link
                            href="/selection"
                            className="relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-gold/20 text-brand-dark hover:text-brand-gold hover:border-brand-gold transition-colors bg-brand-cream/50"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold size-4.5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-gold/20 text-brand-dark hover:text-brand-gold hover:border-brand-gold transition-colors bg-brand-cream/50"
                            aria-label="Open navigation menu"
                            aria-expanded={isOpen}
                        >
                            <Menu className="size-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    overlayClassName="bg-black/40 backdrop-blur-sm"
                    className="flex h-full w-[300px] max-w-[85vw] flex-col gap-0 border-l border-brand-gold/10 !bg-[#FAF6EE] p-6 shadow-2xl sm:max-w-[85vw] md:hidden"
                >
                    <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
                        <SheetTitle className="font-playfair text-lg font-bold text-brand-dark">
                            Navigation
                        </SheetTitle>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-gold/20 text-brand-dark transition-colors hover:text-brand-gold"
                            aria-label="Close navigation menu"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <nav className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto bg-[#FAF6EE]">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex h-12 items-center rounded-lg border px-4 text-base font-medium transition-colors duration-200",
                                        isActive
                                            ? "border-brand-gold/40 bg-[#FAF6EE] font-semibold text-brand-gold"
                                            : "border-brand-gold/25 bg-[#FAF6EE] text-brand-dark hover:border-brand-gold/40 hover:text-brand-gold"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}