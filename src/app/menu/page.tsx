import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";

// Server-side helper to copy generated assets to the public folder during runtime
function copyGeneratedAssets() {
  const srcDir = 'C:\\Users\\vyshakh k\\.gemini\\antigravity-ide\\brain\\367e881d-adcb-49c8-9905-265c6d5c7c85';
  const destDir = path.join(process.cwd(), 'public', 'images');
  
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const files = [
      { src: 'restaurant_interior_1783228205107.png', dest: 'restaurant_interior.png' },
      { src: 'chicken_mandi_1783228223725.png', dest: 'chicken_mandi.png' }
    ];
    
    files.forEach(file => {
      const srcPath = path.join(srcDir, file.src);
      const destPath = path.join(destDir, file.dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        // Successful copy
      }
    });
  } catch (err) {
    // Silent fail in production or if directories don't exist
    console.error("Asset copying failed:", err);
  }
}

export const metadata: Metadata = {
  title: "Menu | Ikkaye's Kitchen",
  description: "Explore our rich menu featuring traditional Mandi collections, fragrant Biriyani, Al Faham grills, and fresh seafood specialties at Ikkaye's Kitchen.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | Ikkaye's Kitchen",
    description: "Explore our rich menu featuring traditional Mandi collections, fragrant Biriyani, Al Faham grills, and fresh seafood specialties at Ikkaye's Kitchen.",
    type: "website",
    url: "/menu",
  },
};

export default function MenuPage() {
  // Trigger asset copying on server render
  copyGeneratedAssets();

  return (
    <main className="min-h-screen bg-brand-cream text-brand-dark flex justify-center w-full">
      <div className="w-full max-w-md bg-[#FDFBF7] min-h-screen shadow-lg flex flex-col relative border-x border-brand-gold/10">
        <MenuShell />
      </div>
    </main>
  );
}