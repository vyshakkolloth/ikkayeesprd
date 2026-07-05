import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Award, Heart, Briefcase, UtensilsCrossed } from "lucide-react";

export const metadata: Metadata = {
    title: "Our Heritage | Ikkaye's Kitchen",
    description: "Learn about the heritage of Ikkaye's Kitchen. From a humble food truck in Kozhikode to a global Malabar culinary ambassador rooted in community empowerment.",
    alternates: {
        canonical: "/heritage",
    },
    openGraph: {
        title: "Our Heritage | Ikkaye's Kitchen",
        description: "Learn about the heritage of Ikkaye's Kitchen. From a humble food truck in Kozhikode to a global Malabar culinary ambassador rooted in community empowerment.",
        type: "website",
        url: "/heritage",
    },
};

// SVG Gold Push Pin decoration for the Polaroid food truck frame
const PushPin = () => (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] select-none pointer-events-none transform -rotate-12">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pin Body */}
            <path
                d="M16 11.5V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V11.5C8 12.6569 7.15685 13.5 6 13.5H18C16.8431 13.5 16 12.6569 16 11.5Z"
                fill="#B88E4C"
            />
            {/* Pin Top Cap */}
            <ellipse cx="12" cy="3" rx="4" ry="1.5" fill="#996E2E" />
            {/* Pin Needle Pinning through */}
            <rect x="11.5" y="13.5" width="1" height="8" rx="0.5" fill="#8C8C8C" />
            {/* Pin Highlight */}
            <path d="M10 5.5H11.5V11.5H10V5.5Z" fill="white" fillOpacity="0.25" />
        </svg>
    </div>
);

const MILESTONES = [
    {
        title: "FOOD TRUCK",
        subtitle: "Humble beginnings in Kozhikode."
    },
    {
        title: "KOZHIKODE RESTAURANT",
        subtitle: "Establishing our culinary roots."
    },
    {
        title: "COMMUNITY IMPACT",
        subtitle: "Focusing on empowerment."
    },
    {
        title: "GLOBAL EXPANSION",
        subtitle: "Taking Malabar to the world."
    }
];

const CHOOSE_US_ITEMS = [
    {
        icon: <Award className="size-6 text-brand-gold" />,
        title: "WOMEN EMPOWERMENT",
        text: "Actively supporting and elevating female leadership within our organization and supply chain."
    },
    {
        icon: <Heart className="size-6 text-brand-gold" />,
        title: "COMMUNITY FIRST",
        text: "Investing in local neighborhoods and ensuring our growth benefits those around us."
    },
    {
        icon: <Briefcase className="size-6 text-brand-gold" />,
        title: "INCLUSIVE EMPLOYMENT",
        text: "Creating opportunities for diverse talents and fostering a welcoming work environment."
    },
    {
        icon: <UtensilsCrossed className="size-6 text-brand-gold" />,
        title: "AUTHENTIC FLAVORS",
        text: "Uncompromising dedication to traditional recipes, premium spices, and culinary craftsmanship."
    }
];

const LOCATIONS = [
    { name: "The Grand Ikkayees", country: "United Kingdom" },
    { name: "Ikkayees Liverpool", country: "United Kingdom" },
    { name: "Ikkayees Kozhikode", country: "India" },
    { name: "Ikkayees Kuwait", country: "Kuwait" },
    { name: "Wings and Shakes", country: "United Kingdom" },
    { name: "Iraye Damy", country: "United Kingdom" }
];

export default function Heritage() {
    return (
        <div className="w-full flex flex-col items-center">
            {/* ----------------------------------------------------
          Section 1: More Than a Restaurant
          ---------------------------------------------------- */}
            <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center gap-6">
                <h1 className="font-playfair text-4xl sm:text-[44px] font-bold text-brand-dark tracking-tight leading-tight">
                    More Than a Restaurant
                </h1>
                <p className="max-w-3xl text-sm sm:text-base text-brand-dark-light/80 font-sans leading-relaxed font-light">
                    From a humble food truck to a global culinary ambassador, our journey is rooted in the rich
                    tapestry of Malabar traditions, community empowerment, and an unwavering commitment
                    to authentic flavor.
                </p>

                {/* Polaroid styled frame with sunset food truck image */}
                <div className="relative mt-8 max-w-2xl w-full bg-white p-3.5 sm:p-5 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-brand-gold/10 flex flex-col items-center group">
                    {/* Decorative Pin */}
                    <PushPin />

                    {/* Main Sunset Food Truck Image */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-md bg-[#FAF6EE] border border-brand-gold/5">
                        <Image
                            src="/images/ourHeritage/Elegant interior of Ikayees Restaurant showing premium dining setup with golden accents and ambient lighting. (2).png"
                            alt="Ikkayees vintage food truck on Kozhikode beach during sunset"
                            fill
                            sizes="(max-w-2xl) 100vw, 80vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-101.5"
                            priority
                        />
                    </div>

                    {/* Soft caption padding for polaroid look */}
                    <div className="h-6 sm:h-8" />
                </div>
            </section>

            {/* ----------------------------------------------------
          Section 2: Our Journey
          ---------------------------------------------------- */}
            <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
                {/* Left Column Text */}
                <div className="md:col-span-6 flex flex-col gap-5 text-start">
                    <h2 className="font-playfair text-3xl sm:text-[35px] font-bold text-brand-dark tracking-wide">
                        Our Journey
                    </h2>
                    <div className="flex flex-col gap-4 text-xs sm:text-sm text-brand-dark-light/80 font-sans leading-relaxed font-light">
                        <p>
                            What began as a passionate endeavor in a modest food truck in Kozhikode has blossomed
                            into a beacon of culinary excellence.
                        </p>
                        <p>
                            Ikkayees was born from a desire to share the rich, unadulterated tastes of Malabar
                            cuisine with the world.
                        </p>
                        <p>
                            Beyond the spices and recipes, our foundation is built on a mission of profound social impact.
                            We believe that a restaurant should nourish not just the body, but the community that surrounds it.
                        </p>
                    </div>
                </div>

                {/* Right Column Image */}
                <div className="md:col-span-6 w-full">
                    <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-md border border-brand-gold/10 group">
                        <Image
                            src="/images/ourHeritage/Chef carefully preparing a signature Malabar dish in a professional, well-lit kitchen..png"
                            alt="Professional chef carefully preparing a signature Malabar dish in a well-lit kitchen"
                            fill
                            sizes="(max-w-xl) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                    </div>
                </div>
            </section>

            {/* ----------------------------------------------------
          Section 3: Milestone Timeline
          ---------------------------------------------------- */}
            <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
                <div className="relative w-full">
                    {/* Horizontal connecting line (hidden on mobile, visible md+) */}
                    <div className="absolute top-[5px] inset-x-0 h-[2px] bg-brand-gold/20 hidden md:block" />

                    {/* Grid layout of milestones */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 text-start relative z-10">
                        {MILESTONES.map((milestone, idx) => (
                            <div key={idx} className="flex flex-col gap-2.5 md:pt-4">
                                {/* Milestone Node */}
                                <div className="flex items-center gap-3 md:block">
                                    <div className="size-2.5 rounded-full bg-[#8A5A36] border border-brand-gold/50 shadow shrink-0 md:mb-4" />
                                    <span className="font-sans text-[11px] sm:text-xs font-extrabold tracking-widest text-[#8A5A36] uppercase leading-none md:hidden">
                                        {milestone.title}
                                    </span>
                                </div>
                                {/* Desktop Text */}
                                <div className="flex flex-col gap-1 pl-5.5 md:pl-0">
                                    <span className="font-sans text-[11px] sm:text-xs font-extrabold tracking-widest text-[#8A5A36] uppercase leading-none hidden md:block">
                                        {milestone.title}
                                    </span>
                                    <p className="text-[11px] sm:text-xs text-brand-dark-light/75 font-sans font-light">
                                        {milestone.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ----------------------------------------------------
          Section 4: Message from the Director
          ---------------------------------------------------- */}
            <section className="w-full bg-[#F9F5EC] border-y border-brand-gold/10 flex justify-center py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
                    {/* Left Column: Portrait */}
                    <div className="md:col-span-5 w-full flex justify-center">
                        <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-brand-gold/15 group">
                            <Image
                                src="/images/ourHeritage/Portrait of Fulaij N, Founder & Director, looking thoughtfully off-camera in a sophisticated setting..png"
                                alt="Portrait of Fulaij N, Founder and Director of Ikkayees Kitchen"
                                fill
                                sizes="(max-w-md) 100vw, 40vw"
                                className="object-cover object-top transition-transform duration-700 group-hover:scale-103"
                            />
                        </div>
                    </div>

                    {/* Right Column: Quotes & Message */}
                    <div className="md:col-span-7 flex flex-col gap-6 text-start">
                        <h2 className="font-playfair text-3xl font-bold text-brand-dark tracking-wide">
                            Message from the Director
                        </h2>

                        {/* Premium Quote Block */}
                        <div className="border-s-4 border-brand-gold/60 ps-4 py-1">
                            <p className="font-playfair text-base sm:text-lg italic text-[#8A5A36] leading-relaxed font-medium">
                                &ldquo;My business is not about what and how much we make. It is
                                more about what the world gains from it.&rdquo;
                            </p>
                        </div>

                        {/* Message Body */}
                        <div className="flex flex-col gap-4 text-xs sm:text-sm text-brand-dark-light/85 font-sans leading-relaxed font-light">
                            <p>
                                Leadership to me is a service of love. It&apos;s about resilience in the face of
                                adversity and finding strength in community. Volunteering and actively
                                participating in social upliftment have shaped the core values of Ikkayees.
                            </p>
                            <p>
                                We don&apos;t just build restaurants; we build ecosystems where people feel valued,
                                where authentic stories are told through food, and where our impact reaches
                                far beyond our dining rooms.
                            </p>
                        </div>

                        {/* Signature Block */}
                        <div className="mt-2 flex flex-col">
                            <span className="font-sans text-xs sm:text-sm font-extrabold tracking-widest text-[#8A5A36] uppercase leading-none">
                                Fulaij N
                            </span>
                            <span className="font-sans text-[10px] sm:text-xs text-brand-dark-light/65 tracking-wider mt-1 uppercase font-semibold">
                                Founder & Director
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------------------------------------------
          Section 5: Why Choose Us
          ---------------------------------------------------- */}
            <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center gap-10">
                <div className="flex flex-col gap-2">
                    <h2 className="font-playfair text-3xl font-bold text-brand-dark tracking-wide">
                        Why Choose Us
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-dark-light/70 font-sans font-light">
                        The pillars that define our legacy and future.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {CHOOSE_US_ITEMS.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white/50 rounded-2xl border border-brand-gold/10 p-6 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 group"
                        >
                            {/* Icon Container */}
                            <div className="size-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-gold group-hover:text-white text-brand-gold">
                                {item.icon}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-sans text-xs sm:text-sm font-extrabold tracking-widest text-brand-dark uppercase">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-brand-dark-light/75 font-sans leading-relaxed font-light">
                                    {item.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ----------------------------------------------------
          Section 6: Our Global Presence
          ---------------------------------------------------- */}
            <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 text-center flex flex-col items-center gap-8">
                <h2 className="font-playfair text-3xl font-bold text-brand-dark tracking-wide">
                    Our Global Presence
                </h2>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                    {LOCATIONS.map((loc, idx) => (
                        <div
                            key={idx}
                            className="bg-[#FBF8F3] border border-brand-gold/8 rounded-xl px-5 py-4.5 flex items-center gap-3.5 text-start hover:border-brand-gold/25 transition-colors group"
                        >
                            {/* MapPin Icon */}
                            <div className="size-9 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold transition-all duration-300 group-hover:bg-[#B88E4C] group-hover:text-white">
                                <MapPin className="size-4.5" />
                            </div>

                            {/* Details */}
                            <div className="flex flex-col justify-center">
                                <span className="font-sans text-xs sm:text-sm font-extrabold tracking-wide text-brand-dark leading-snug">
                                    {loc.name}
                                </span>
                                <span className="font-sans text-[10px] sm:text-xs text-brand-dark-light/65 mt-0.5 tracking-wider font-semibold">
                                    {loc.country}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}