import type { Metadata } from "next";
import ContactShell from "@/components/contact/ContactShell";

export const metadata: Metadata = {
  title: "Contact Us | Ikkaye's Kitchen",
  description: "Get in touch with Ikkaye's Kitchen. Make a reservation, plan a visit, or send us a message. Find location and directions for 7W6V+227 Grand Hyper Market Building, Khaled El Arabi Al Ashhab Street, Abbasiya 85601, Kuwait.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Ikkaye's Kitchen",
    description: "Get in touch with Ikkaye's Kitchen. Make a reservation, plan a visit, or send us a message. Find location and directions for 7W6V+227 Grand Hyper Market Building, Khaled El Arabi Al Ashhab Street, Abbasiya 85601, Kuwait.",
    type: "website",
    url: "/contact",
  },
};

export default function ContactPage() {
  return <ContactShell />;
}