import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";

// Server-side helper to copy generated assets to the public folder during runtime
function copyGeneratedAssets() {
  const oldSrcDir = 'C:\\Users\\vyshakh k\\.gemini\\antigravity-ide\\brain\\367e881d-adcb-49c8-9905-265c6d5c7c85';
  const newSrcDir = 'C:\\Users\\vyshakh k\\.gemini\\antigravity-ide\\brain\\3a45dd88-188d-452d-8e7a-37d79e0af585';
  const destDir = path.join(process.cwd(), 'public', 'images');

  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = [
      { dir: oldSrcDir, src: 'restaurant_interior_1783228205107.png', dest: 'restaurant_interior.png' },
      { dir: oldSrcDir, src: 'chicken_mandi_1783228223725.png', dest: 'chicken_mandi.png' },
      { dir: oldSrcDir, src: 'mixed_grill_1783230740869.png', dest: 'mixed_grill.png' },
      { dir: oldSrcDir, src: 'seafood_platter_1783230777583.png', dest: 'seafood_platter.png' },
      { dir: oldSrcDir, src: 'kunafa_1783230799466.png', dest: 'kunafa.png' },
      { dir: newSrcDir, src: 'chicken_shawarma_1783387741874.png', dest: 'chicken_shawarma.png' },
      { dir: newSrcDir, src: 'mint_limeade_1783387755642.png', dest: 'mint_limeade.png' },
      { dir: newSrcDir, src: 'thalassery_biryani_1783387770961.png', dest: 'thalassery_biryani.png' },
      { dir: newSrcDir, src: 'all_dishes_1783387783600.png', dest: 'all_dishes.png' }
    ];

    files.forEach(file => {
      const srcPath = path.join(file.dir, file.src);
      const destPath = path.join(destDir, file.dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  } catch (err) {
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

function getMenuData() {
  try {
    const filePath = path.join(process.cwd(), "content", "menu.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading menu.json:", err);
  }
  return [];
}

export default function MenuPage() {
  // Trigger asset copying on server render
  copyGeneratedAssets();
  const dishes = getMenuData();

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-brand-dark flex justify-center w-full">
      <div className="w-full min-h-screen flex flex-col relative">
        <MenuShell initialDishes={dishes} />
      </div>
    </main>
  );
}