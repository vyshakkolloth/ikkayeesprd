"use client";

import Image from "next/image";
import { Phone, MapPin, Clock, Mail, ArrowRight } from "lucide-react";

const INFO_CARDS = [
  {
    icon: <Phone className="size-5 text-[#8A5A36]" />,
    title: "Call Us",
    line1: "+91 90373 72020",
    line2: "Mon-Sun, 9am-11pm",
  },
  {
    icon: <MapPin className="size-5 text-[#8A5A36]" />,
    title: "Visit Us",
    line1: "Grand Hyper Market Building",
    line2: "Abbasiya 85601, Kuwait",
  },
  {
    icon: <Clock className="size-5 text-[#8A5A36]" />,
    title: "Opening Hours",
    line1: "Lunch: 12PM - 3:30PM",
    line2: "Dinner: 7PM - 11PM",
  },
  {
    icon: <Mail className="size-5 text-[#8A5A36]" />,
    title: "Email Us",
    line1: "hello@ikkayees.com",
    line2: "Response within 24 hrs",
  },
];

const PRESENCE_LOCATIONS = [
  { name: "THE GRAND IKKAYEES", location: "Liverpool, UK" },
  { name: "IKKAYEES LIVERPOOL", location: "Liverpool, UK" },
  { name: "IKKAYEES KUWAIT", location: "Abbasiya 85601, Kuwait" },
  { name: "WRAPS AND SHAKES", location: "Liverpool, UK" },
  { name: "INDO CURRY", location: "Liverpool, UK" },
];

export default function ContactShell() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* ----------------------------------------------------
          Section 1: Get In Touch (Banner)
          ---------------------------------------------------- */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* Left: Text Info */}
        <div className="md:col-span-6 flex flex-col gap-4 text-start">
          <h1 className="font-playfair text-4xl sm:text-[45px] font-bold text-brand-dark tracking-tight leading-tight">
            Get In Touch
          </h1>
          <p className="text-sm sm:text-base text-brand-dark-light/80 font-sans leading-relaxed font-light">
            Whether you&apos;re planning a visit, making a reservation, organizing an event, or
            simply have a question, we&apos;d love to hear from you.
          </p>
        </div>

        {/* Right: Elegant Dining Room Image */}
        <div className="md:col-span-6 w-full">
          <div className="relative w-full aspect-[16/10] rounded-[24px] overflow-hidden shadow-md border border-brand-gold/10 group">
            <Image
              src="/images/ourHeritage/Elegant interior of Ikayees Restaurant showing premium dining setup with golden accents and ambient lighting. (2).png"
              alt="Ikkayees luxury dining room reservation setup"
              fill
              sizes="(max-w-xl) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-102"
              priority
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          Section 2: Contact Quick Info Cards
          ---------------------------------------------------- */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {INFO_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/50 rounded-2xl border border-brand-gold/10 p-6 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-brand-gold/25 transition-all duration-300 group"
            >
              {/* Icon Circle */}
              <div className="size-11 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold transition-all duration-300 group-hover:bg-[#B88E4C] group-hover:text-white">
                {card.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5 justify-center">
                <h3 className="font-sans text-sm font-extrabold tracking-wide text-brand-dark">
                  {card.title}
                </h3>
                <span className="font-sans text-xs sm:text-sm font-semibold text-brand-dark-light leading-snug">
                  {card.line1}
                </span>
                <span className="font-sans text-[11px] sm:text-xs text-brand-dark-light/65 leading-none">
                  {card.line2}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------
          Section 3: Flagship Restaurant (Kuwait) - Google Map Embed
          ---------------------------------------------------- */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* Left: Original Interactive Google Map Embed */}
        <div className="md:col-span-6 w-full flex justify-center">
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-[24px] overflow-hidden shadow-lg border border-brand-gold/20 bg-brand-cream/20">
            <iframe
              title="IKKAYEES RESTAURANT KUWAIT Google Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6961.702608468481!2d47.93366374363143!3d29.257324557579317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf990054e196f7%3A0xe438a06084f9ce9a!2sIKKAYEES%20RESTAURANT%20KUWAIT!5e0!3m2!1sen!2sin!4v1784861818387!5m2!1sen!2sin"
              className="w-full h-full border-0 rounded-[24px]"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        {/* Right: Flagship Description & CTAs */}
        <div className="md:col-span-6 flex flex-col gap-6 text-start items-start">
          {/* Gold Badge */}
          <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/25 text-[10px] sm:text-[11px] font-bold tracking-widest px-3.5 py-1.5 rounded-full uppercase leading-none">
            Flagship Restaurant
          </span>

          <h2 className="font-playfair text-3xl sm:text-[36px] font-bold text-brand-dark tracking-wide leading-tight">
            Ikkayees Kuwait
          </h2>

          <p className="text-xs sm:text-sm text-brand-dark-light/80 font-sans leading-relaxed font-light">
            The flagship Ikkayees location where our journey of authentic Malabar hospitality continues
            every day. Experience the rich heritage and culinary artistry in a setting that reflects
            centuries of tradition.
          </p>

          {/* Quick Info Details */}
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex items-start gap-3">
              <MapPin className="size-4.5 text-brand-gold shrink-0 mt-0.5" />
              <span className="font-sans text-xs sm:text-sm text-brand-dark font-medium leading-relaxed">
                7W6V+227 Grand Hyper Market Building, Khaled El Arabi Al Ashhab Street, Abbasiya 85601, Kuwait
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4.5 text-brand-gold shrink-0" />
              <span className="font-sans text-xs sm:text-sm text-brand-dark font-medium">
                +91 90373 72020
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-4 mt-4 w-full">
            <a
              href="tel:+919037372020"
              className="h-11 px-7 bg-brand-dark hover:bg-brand-dark-light text-brand-cream font-sans text-xs font-semibold rounded-full shadow-md transition-all duration-200 cursor-pointer active:scale-97 flex items-center justify-center gap-2"
            >
              <Phone className="size-3.5" />
              Call to Reserve
            </a>
            <a
              href="https://www.google.com/maps/place/IKKAYEES+RESTAURANT+KUWAIT/@29.2573246,47.9336637,17z/data=!3m1!4b1!4m6!3m5!1s0x3fcf990054e196f7:0xe438a06084f9ce9a"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-7 bg-white hover:bg-brand-gold/5 text-brand-gold border border-brand-gold/40 hover:border-brand-gold font-sans text-xs font-semibold rounded-full shadow-sm transition-all duration-200 cursor-pointer active:scale-97 flex items-center justify-center gap-2"
            >
              <MapPin className="size-3.5 text-brand-gold" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          Section 4: Our Global Presence
          ---------------------------------------------------- */}
      <section className="w-full bg-[#FAF6EE]/50 border-y border-brand-gold/10 py-16 sm:py-20 flex justify-center">
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-10">
          <h2 className="font-playfair text-3xl font-bold text-brand-dark tracking-wide">
            Our Global Presence
          </h2>

          {/* Location details card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {PRESENCE_LOCATIONS.map((loc, idx) => (
              <div
                key={idx}
                className="bg-white border border-brand-gold/10 rounded-[20px] p-6 flex flex-col gap-4 text-start hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 group"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-playfair text-base sm:text-[17px] font-bold text-brand-dark tracking-wide">
                    {loc.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand-gold" />
                    <span className="font-sans text-[11px] sm:text-xs text-brand-dark-light font-light">
                      {loc.location}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-brand-gold/5 flex items-center justify-between">
                  <button className="font-sans text-xs font-semibold text-brand-gold group-hover:text-[#8A5A36] flex items-center gap-1 transition-colors">
                    View Details
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          Section 5: Send Us a Message (Contact Form)
          ---------------------------------------------------- */}
      <section className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
        <div className="w-full bg-[#FDFBF7] rounded-[24px] border border-brand-gold/15 shadow-md px-6 sm:px-10 lg:px-12 py-10 sm:py-12 flex flex-col items-center gap-8">
          <div className="text-center flex flex-col gap-2">
            <h2 className="font-playfair text-3xl font-bold text-brand-dark tracking-wide">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-brand-dark-light/75 font-sans font-light">
              Have a specific inquiry? Fill out the form below and our team will get back to you.
            </p>
          </div>

          {/* Form */}
          <form className="w-full flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-2 items-start">
                <label className="font-sans text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full h-11 bg-white border border-brand-gold/15 rounded-lg px-4 text-sm font-sans focus:outline-none focus:border-brand-gold transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-2 items-start">
                <label className="font-sans text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full h-11 bg-white border border-brand-gold/15 rounded-lg px-4 text-sm font-sans focus:outline-none focus:border-brand-gold transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div className="flex flex-col gap-2 items-start">
                <label className="font-sans text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555 567 8900"
                  className="w-full h-11 bg-white border border-brand-gold/15 rounded-lg px-4 text-sm font-sans focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2 items-start">
                <label className="font-sans text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="General Inquiry"
                  className="w-full h-11 bg-white border border-brand-gold/15 rounded-lg px-4 text-sm font-sans focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2 items-start">
              <label className="font-sans text-xs font-bold text-brand-dark uppercase tracking-wider">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="How can we help you today?"
                className="w-full bg-white border border-brand-gold/15 rounded-lg p-4 text-sm font-sans focus:outline-none focus:border-brand-gold transition-all resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="w-full flex justify-center mt-3">
              <button
                type="submit"
                className="h-11 px-10 bg-brand-dark hover:bg-brand-dark-light text-brand-cream font-sans text-xs font-semibold rounded-full shadow-md transition-all duration-200 cursor-pointer active:scale-97"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
