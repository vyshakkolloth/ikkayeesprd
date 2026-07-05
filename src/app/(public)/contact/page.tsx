import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ContactShell from "@/components/contact/ContactShell";

// Server-side helper to copy the generated map asset to the public folder during runtime
function copyMapAsset() {
  const srcDir = 'C:\\Users\\vyshakh k\\.gemini\\antigravity-ide\\brain\\367e881d-adcb-49c8-9905-265c6d5c7c85';
  const destDir = path.join(process.cwd(), 'public', 'images');
  
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const srcPath = path.join(srcDir, 'golden_compass_map_1783233850872.png');
    const destPath = path.join(destDir, 'golden_compass_map.png');
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  } catch (err) {
    console.error("Map asset copying failed:", err);
  }
}

export const metadata: Metadata = {
  title: "Contact Us | Ikkaye's Kitchen",
  description: "Get in touch with Ikkaye's Kitchen. Make a reservation, plan a visit, or send us a message. Find contacts for Kuwait, Kozhikode, and UK branches.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Ikkaye's Kitchen",
    description: "Get in touch with Ikkaye's Kitchen. Make a reservation, plan a visit, or send us a message. Find contacts for Kuwait, Kozhikode, and UK branches.",
    type: "website",
    url: "/contact",
  },
};

export default function ContactPage() {
  // Copy generated map image during server render
  copyMapAsset();

  return <ContactShell />;
}