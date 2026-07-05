"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "My Selection", href: "/selection" },
    { label: "Our Heritage", href: "/heritage" },
    { label: "Contact", href: "/contact" },
];

export default function Header() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close mobile drawer when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

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
                        {/* My Selection Button */}
                        <Link
                            href="/selection"
                            className="inline-flex h-11 items-center justify-center rounded-full border border-brand-gold px-6 text-sm font-medium text-brand-gold hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-gold/50 shadow-sm cursor-pointer select-none"
                        >
                            My Selection
                        </Link>
                    </div>

                    {/* Mobile Actions and Burger Menu Trigger */}
                    <div className="flex md:hidden items-center gap-3">
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

            {/* Mobile Drawer (Sheet Overlay) */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            <div
                className={cn(
                    "fixed top-0 bottom-0 right-0 z-50 w-[300px] max-w-[85vw] bg-brand-cream p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4 mb-6">
                    <span className="font-playfair text-lg font-bold text-brand-dark">Navigation</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-gold/20 text-brand-dark hover:text-brand-gold transition-colors"
                        aria-label="Close navigation menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Vertical Menu Links */}
                <nav className="flex flex-col gap-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center h-12 px-4 rounded-lg text-base font-medium transition-all duration-200 border border-transparent",
                                    isActive
                                        ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20 font-semibold"
                                        : "text-brand-dark hover:bg-brand-gold/5 hover:text-brand-gold"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile My Selection Button at the bottom */}
                <div className="mt-auto pt-6 border-t border-brand-gold/10">
                    <Link
                        href="/selection"
                        className="flex h-12 w-full items-center justify-center rounded-full bg-brand-gold text-brand-cream text-base font-medium hover:bg-brand-gold/90 transition-colors shadow-md cursor-pointer select-none"
                    >
                        My Selection
                    </Link>
                </div>
            </div>
        </header>
    );
}