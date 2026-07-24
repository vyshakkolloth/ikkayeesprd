"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Edit3,
  Search,
  Save,
  Image as ImageIcon,
  Globe,
  Settings,
  Loader2,
  Check,
  X,
  Plus,
  UtensilsCrossed,
  ChefHat,
  TrendingUp,
  Sparkles,
  Compass,
  Layers,
  Heart,
  Trash2,
  Smartphone,
  Monitor,
  Upload,
  SlidersHorizontal,
  Eye,
  ArrowUp,
  ArrowDown,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BannerItem } from "@/lib/db/repositories/settings.repository"
import BannerCarousel from "@/components/home/banner-carousel"

interface Product {
  _id: string
  name: { en: string; ar: string }
  description: { en: string; ar: string }
  price: number
  image: string
  categoryId: string
  categoryName?: { en: string; ar: string }
  chefRecommended: boolean
  topPick: boolean
  tags: string[]
  active: boolean
}

interface Category {
  _id: string
  name: { en: string; ar: string }
}

interface HomeSettings {
  hero: {
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    imageUrl: string
    ctaText: { en: string; ar: string }
  }
  banners?: BannerItem[]
  sectionsOrder?: string[]
}

interface HomePageClientProps {
  initialSettings: HomeSettings
  products: Product[]
  categories: Category[]
}

export default function HomePageClient({ initialSettings, products, categories }: HomePageClientProps) {
  // Local states
  const [settings, setSettings] = useState<HomeSettings>(initialSettings)
  const [productsList, setProductsList] = useState<Product[]>(products)
  const [bannersList, setBannersList] = useState<BannerItem[]>(initialSettings.banners || [])
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(
    initialSettings.sectionsOrder || ["topPick", "chefRecommended", "trending", "mandi", "seafood", "heritage", "finish"]
  )
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en")
  
  // Dialog controls
  const [isHeroEditing, setIsHeroEditing] = useState(false)
  const [heroForm, setHeroForm] = useState(initialSettings.hero)

  // Banner Dialog controls
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null)
  const [bannerForm, setBannerForm] = useState<BannerItem>({
    id: "",
    title: { en: "", ar: "" },
    subtitle: { en: "", ar: "" },
    desktopImageUrl: "",
    mobileImageUrl: "",
    linkUrl: "/menu",
    ctaText: { en: "Explore Menu", ar: "استكشف القائمة" },
    active: true,
    sortOrder: 0
  })
  
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  
  const [isSaving, setIsSaving] = useState(false)

  const isRTL = previewLang === "ar"

  // Sections configuration
  const sections = useMemo(() => [
    {
      key: "topPick",
      title: { en: "Top Dishes", ar: "الأطباق المميزة" },
      subtitle: { en: "Bestselling dishes loved by our guests", ar: "أكثر الأطباق مبيعاً ومحبة من ضيوفنا" },
      icon: <Sparkles className="size-5 text-[#B88E4C]" />,
      badge: { en: "BESTSELLER", ar: "الأكثر مبيعاً" },
      filterFn: (p: Product) => p.topPick
    },
    {
      key: "chefRecommended",
      title: { en: "Chef's Recommendations", ar: "توصيات الشيف" },
      subtitle: { en: "Artisanal signature dishes selected by our head chef", ar: "أطباق حصرية مختارة بعناية من قبل رئيس الطهاة لدينا" },
      icon: <ChefHat className="size-5 text-[#B88E4C]" />,
      badge: { en: "CHEF'S SPECIAL", ar: "توصية الشيف" },
      filterFn: (p: Product) => p.chefRecommended
    },
    {
      key: "trending",
      title: { en: "Trending Today", ar: "الأكثر طلباً اليوم" },
      subtitle: { en: "Freshly prepared local favorites", ar: "المأكولات المحلية المفضلة والمحضرة طازجة" },
      icon: <TrendingUp className="size-5 text-[#B88E4C]" />,
      badge: { en: "TRENDING", ar: "رائج الآن" },
      filterFn: (p: Product) => p.tags.includes("Trending")
    },
    {
      key: "mandi",
      title: { en: "Signature Mandi Collection", ar: "مجموعة المندي المتميزة" },
      subtitle: { en: "Slow-cooked rice and meat dishes cooked to perfection", ar: "أرز ولحوم مطبوخة ببطء وعلى نيران هادئة لدرجة الكمال" },
      icon: <UtensilsCrossed className="size-5 text-[#B88E4C]" />,
      badge: { en: "POPULAR", ar: "شعبي" },
      filterFn: (p: Product) => {
        const cat = categories.find(c => c._id === p.categoryId)
        const inMandiCategory = cat?.name.en.toLowerCase().includes("mandi") || cat?.name.ar.includes("مندي")
        const hasMandiTag = p.tags.includes("Mandi")
        return inMandiCategory || hasMandiTag
      }
    },
    {
      key: "seafood",
      title: { en: "Seafood Highlights", ar: "روائع المأكولات البحرية" },
      subtitle: { en: "Fresh catches from the Arabian Sea prepared with traditional spices", ar: "صيد اليوم الطازج من البحر العربي والمعد بالتوابل التقليدية" },
      icon: <Compass className="size-5 text-[#B88E4C]" />,
      badge: { en: "FRESH CATCH", ar: "صيد طازج" },
      filterFn: (p: Product) => {
        const cat = categories.find(c => c._id === p.categoryId)
        const inSeafoodCategory = cat?.name.en.toLowerCase().includes("seafood") || cat?.name.en.toLowerCase().includes("fish") || cat?.name.ar.includes("بحري")
        const hasSeafoodTag = p.tags.includes("Seafood")
        return inSeafoodCategory || hasSeafoodTag
      }
    },
    {
      key: "heritage",
      title: { en: "Heritage Classics", ar: "كلاسيكيات التراث" },
      subtitle: { en: "Authentic recipes passed down through generations", ar: "وصفات أصيلة متوارثة عبر الأجيال" },
      icon: <Layers className="size-5 text-[#B88E4C]" />,
      badge: { en: "HERITAGE", ar: "تراثي" },
      filterFn: (p: Product) => p.tags.includes("Heritage")
    },
    {
      key: "finish",
      title: { en: "The Perfect Finish", ar: "الخاتمة المثالية" },
      subtitle: { en: "Sweet treats and refreshing beverages to end your meal", ar: "حلويات ومشروبات منعشة لتتوج بها وجبتك" },
      icon: <Heart className="size-5 text-[#B88E4C]" />,
      badge: { en: "SWEET ENDINGS", ar: "الحلو" },
      filterFn: (p: Product) => {
        const cat = categories.find(c => c._id === p.categoryId)
        const inDessertCategory = cat?.name.en.toLowerCase().includes("dessert") || cat?.name.en.toLowerCase().includes("beverage") || cat?.name.en.toLowerCase().includes("sweet") || cat?.name.ar.includes("حلويات") || cat?.name.ar.includes("مشروب")
        const hasDessertTag = p.tags.includes("Dessert") || p.tags.includes("Sweet")
    }
  ], [categories])

  // Compute ordered sections based on current sectionsOrder
  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => {
      const indexA = sectionsOrder.indexOf(a.key)
      const indexB = sectionsOrder.indexOf(b.key)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [sections, sectionsOrder])

  // Handle reordering sections
  const handleMoveSection = async (sectionKey: string, direction: "up" | "down") => {
    const currentIndex = sectionsOrder.indexOf(sectionKey)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sectionsOrder.length) return

    const newOrder = [...sectionsOrder]
    const [movedKey] = newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, movedKey)

    setSectionsOrder(newOrder)
    setIsSaving(true)

    try {
      const res = await fetch("/api/home-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionsOrder: newOrder })
      })
      if (res.ok) {
        toast.success("Section order updated successfully!")
      } else {
        toast.error("Failed to save section order")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error occurred while saving section order")
    } finally {
      setIsSaving(false)
    }
  }

  // Open product selector for a section
  const handleOpenSectionManager = (sectionKey: string) => {
    const section = sections.find(s => s.key === sectionKey)
    if (!section) return

    // Find products currently in this section
    const currentSectionProducts = productsList.filter(section.filterFn)
    const currentIds = currentSectionProducts.map(p => p._id)

    setSelectedProductIds(currentIds)
    setSearchQuery("")
    setCategoryFilter("all")
    setEditingSection(sectionKey)
  }

  // Handle saving Hero banner settings
  const handleSaveHero = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/home-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: heroForm })
      })
      const data = await res.json()
      if (res.ok) {
        setSettings({ ...settings, hero: heroForm })
        setIsHeroEditing(false)
        toast.success("Hero settings updated successfully!")
      } else {
        toast.error(data.error || "Failed to update Hero settings")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving Hero settings")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Banner Carousel Management
  const handleOpenAddBanner = () => {
    setEditingBannerIndex(null)
    setBannerForm({
      id: `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: { en: "", ar: "" },
      subtitle: { en: "", ar: "" },
      desktopImageUrl: "",
      mobileImageUrl: "",
      linkUrl: "/menu",
      ctaText: { en: "Explore Menu", ar: "استكشف القائمة" },
      active: true,
      sortOrder: bannersList.length + 1
    })
    setIsBannerModalOpen(true)
  }

  const handleOpenEditBanner = (index: number) => {
    setEditingBannerIndex(index)
    setBannerForm({ ...bannersList[index] })
    setIsBannerModalOpen(true)
  }

  const handleDeleteBanner = async (index: number) => {
    const updated = bannersList.filter((_, idx) => idx !== index)
    setBannersList(updated)
    setIsSaving(true)
    try {
      const res = await fetch("/api/home-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updated })
      })
      if (res.ok) {
        toast.success("Banner removed successfully!")
      } else {
        toast.error("Failed to remove banner")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to remove banner")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBannerSubmit = async () => {
    if (!bannerForm.desktopImageUrl && !bannerForm.mobileImageUrl) {
      toast.error("Please provide at least a desktop or mobile image for the banner")
      return
    }

    let updatedList = [...bannersList]
    if (editingBannerIndex !== null) {
      updatedList[editingBannerIndex] = bannerForm
    } else {
      updatedList.push(bannerForm)
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/home-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updatedList })
      })
      const data = await res.json()
      if (res.ok) {
        const savedBanners = data.payload?.banners || updatedList
        setBannersList(savedBanners)
        setIsBannerModalOpen(false)
        toast.success("Banner carousel updated successfully!")
      } else {
        toast.error(data.error || "Failed to update banner")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error occurred while saving banner")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "desktopImageUrl" | "mobileImageUrl") => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setBannerForm(prev => ({ ...prev, [field]: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle saving Section products
  const handleSaveSection = async () => {
    if (!editingSection) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/home-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: editingSection,
          productIds: selectedProductIds
        })
      })
      const data = await res.json()
      if (res.ok) {
        // Update local products flags/tags directly so preview refreshes instantly
        const updatedList = productsList.map(prod => {
          const isSelected = selectedProductIds.includes(prod._id)
          const updatedProd = { ...prod }

          if (editingSection === "topPick") {
            updatedProd.topPick = isSelected
          } else if (editingSection === "chefRecommended") {
            updatedProd.chefRecommended = isSelected
          } else {
            // Tag sections
            const tagMapping: Record<string, string> = {
              trending: "Trending",
              mandi: "Mandi",
              seafood: "Seafood",
              heritage: "Heritage",
              finish: "Dessert"
            }
            const tagName = tagMapping[editingSection]
            if (tagName) {
              const tagsWithoutThis = prod.tags.filter(t => t !== tagName)
              updatedProd.tags = isSelected ? [...tagsWithoutThis, tagName] : tagsWithoutThis
            }
          }
          return updatedProd
        })

        setProductsList(updatedList)
        setEditingSection(null)
        toast.success("Section updated successfully!")
      } else {
        toast.error(data.error || "Failed to update section items")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while updating section items")
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle single product selection in Dialog
  const handleToggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId))
    } else {
      setSelectedProductIds([...selectedProductIds, productId])
    }
  }

  // Filter products for display in selection dialog
  const filteredProductsForSelect = useMemo(() => {
    return productsList.filter(prod => {
      const matchSearch =
        prod.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.name.ar.includes(searchQuery)
      
      const matchCategory = categoryFilter === "all" || prod.categoryId === categoryFilter
      return matchSearch && matchCategory
    })
  }, [productsList, searchQuery, categoryFilter])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border p-6 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Home Page Content Management</h1>
          <p className="text-sm text-muted-foreground">
            Customize the landing page layout, hero text, banner image, and promote specific dishes.
          </p>
        </div>
        
        {/* Languages & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-md p-1 border">
            <button
              onClick={() => setPreviewLang("en")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
                previewLang === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="size-3.5" />
              English (LTR)
            </button>
            <button
              onClick={() => setPreviewLang("ar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
                previewLang === "ar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              العربية (RTL)
              <Globe className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="border bg-brand-cream rounded-xl shadow-md overflow-hidden relative" dir={isRTL ? "rtl" : "ltr"}>
        
        {/* Soft Background glow highlights to simulate actual screen layout */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#B88E4C]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#B88E4C]/10 blur-3xl pointer-events-none" />
        
        {/* BANNER CAROUSEL MANAGEMENT BLOCK */}
        <div className="border-b bg-background/90 p-4 sm:p-6 space-y-4 relative z-10 font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-[#B88E4C]" />
                <h3 className="font-bold text-base sm:text-lg text-foreground">Homepage Banner Scroll Carousel</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload separate images for Desktop and Mobile screens. Managed banners auto-scroll on the homepage.
              </p>
            </div>
            <Button
              onClick={handleOpenAddBanner}
              className="bg-[#B88E4C] hover:bg-[#B88E4C]/90 text-[#FAF6EE] text-xs flex items-center gap-1.5 shadow-sm rounded-full"
            >
              <Plus className="size-4" />
              Add Banner Slide
            </Button>
          </div>

          {/* Banner Slider Preview */}
          <div className="rounded-xl overflow-hidden border border-amber-900/15 shadow-sm relative group">
            <div className="absolute top-3 end-3 z-30 flex gap-2">
              <Badge className="bg-black/70 text-white backdrop-blur-sm text-[10px] flex items-center gap-1 font-sans border-0">
                <Eye className="size-3 text-[#B88E4C]" />
                Live Carousel Preview
              </Badge>
            </div>
            <BannerCarousel banners={bannersList} lang={previewLang} />
          </div>

          {/* Configured Banners List Cards */}
          {bannersList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {bannersList.map((banner, index) => (
                <div key={banner.id || index} className="bg-card border rounded-lg p-3 space-y-2 relative shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-[#B88E4C]">#{index + 1}</span>
                      <h4 className="font-semibold text-xs text-foreground truncate">
                        {banner.title?.[previewLang] || banner.title?.en || "Untitled Banner"}
                      </h4>
                    </div>
                    <Badge variant={banner.active ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
                      {banner.active ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  {/* Thumbnail Image Previews */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1">
                    <div className="space-y-1">
                      <span className="flex items-center gap-1">
                        <Monitor className="size-3 text-brand-gold" /> Desktop Image
                      </span>
                      <div className="aspect-[16/9] rounded overflow-hidden bg-muted border">
                        <img src={banner.desktopImageUrl || "/images/all_dishes.png"} alt="Desktop preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1">
                        <Smartphone className="size-3 text-brand-gold" /> Mobile Image
                      </span>
                      <div className="aspect-[9/16] max-h-16 rounded overflow-hidden bg-muted border mx-auto">
                        <img src={banner.mobileImageUrl || banner.desktopImageUrl || "/images/all_dishes.png"} alt="Mobile preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-1 pt-2 border-t mt-1">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEditBanner(index)}
                      className="text-[11px] h-7 px-2 flex items-center gap-1"
                    >
                      <Edit3 className="size-3 text-brand-gold" />
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteBanner(index)}
                      className="text-[11px] h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* HERO PREVIEW BLOCK */}
        <div 
          className="relative min-h-[450px] flex items-center justify-center text-center px-4 py-20 bg-cover bg-center transition-all duration-300 border-b"
          style={{ backgroundImage: `linear-gradient(rgba(44, 37, 32, 0.75), rgba(44, 37, 32, 0.75)), url(${settings.hero.imageUrl})` }}
        >
          {/* Admin Edit Hover Overlay */}
          <div className="absolute top-4 right-4 z-20">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsHeroEditing(true)}
              className="bg-background/95 hover:bg-background text-foreground text-xs flex items-center gap-1.5 shadow-md border-brand-gold/30 hover:border-brand-gold"
            >
              <Edit3 className="size-3.5 text-brand-gold" />
              Edit Hero Banner
            </Button>
          </div>

          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
            <span className="text-[#B88E4C] font-semibold tracking-widest text-[11px] uppercase mb-4 bg-[#B88E4C]/10 px-4 py-1.5 rounded-full border border-[#B88E4C]/20 inline-block font-sans">
              {previewLang === "en" ? "IKKAYE'S KITCHEN" : "مطبخ إيكايز"}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-5 leading-tight tracking-tight">
              {settings.hero.title[previewLang]}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-xl mb-8 leading-relaxed font-sans font-light">
              {settings.hero.subtitle[previewLang]}
            </p>

            <Button className="rounded-full bg-[#B88E4C] text-[#FAF6EE] hover:bg-[#B88E4C]/90 px-8 py-5 text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-not-allowed">
              {settings.hero.ctaText[previewLang]}
            </Button>
          </div>
        </div>

        {/* DYNAMIC SECTIONS RENDER */}
        <div className="py-12 space-y-20 px-4 sm:px-6 lg:px-8">
          
          {/* SECTION REORDERING BAR */}
          <div className="bg-background/80 backdrop-blur border rounded-xl p-4 sm:p-5 space-y-3 font-sans shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <GripVertical className="size-5 text-[#B88E4C]" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">Homepage Sections Order Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Reorder homepage sections. Changes sync immediately to the database and landing page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {orderedSections.map((s, idx) => (
                <div key={s.key} className="flex items-center gap-1.5 bg-muted/60 border rounded-lg px-2.5 py-1 text-xs">
                  <span className="font-bold text-[#B88E4C] text-[10px]">#{idx + 1}</span>
                  <span className="font-medium text-foreground">{s.title[previewLang]}</span>
                  <div className="flex items-center gap-0.5 ms-1 border-s ps-1.5">
                    <button
                      disabled={idx === 0 || isSaving}
                      onClick={() => handleMoveSection(s.key, "up")}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                      title="Move Up"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      disabled={idx === orderedSections.length - 1 || isSaving}
                      onClick={() => handleMoveSection(s.key, "down")}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                      title="Move Down"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {orderedSections.map((section, sectionIndex) => {
            const sectionProducts = productsList.filter(section.filterFn)
            
            return (
              <div key={section.key} className="relative group border border-dashed border-muted-foreground/15 hover:border-brand-gold/60 rounded-xl p-4 sm:p-6 transition-all bg-background/30 backdrop-blur-sm">
                
                {/* Admin Quick Section Controls */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 opacity-95">
                  <Badge variant="outline" className="bg-background/90 text-xs font-bold text-[#B88E4C] border-[#B88E4C]/30 px-2 py-1">
                    Section #{sectionIndex + 1}
                  </Badge>
                  <div className="flex items-center bg-background/90 border rounded-md p-0.5 shadow-xs">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={sectionIndex === 0 || isSaving}
                      onClick={() => handleMoveSection(section.key, "up")}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Move Section Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={sectionIndex === orderedSections.length - 1 || isSaving}
                      onClick={() => handleMoveSection(section.key, "down")}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Move Section Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenSectionManager(section.key)}
                    className="bg-background/95 text-foreground hover:bg-background border-brand-gold/30 hover:border-brand-gold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Settings className="size-3.5 text-brand-gold animate-spin-slow" />
                    Manage {section.title[previewLang]}
                  </Button>
                </div>

                {/* Section Header */}
                <div className="flex flex-col gap-2 mb-8 max-w-xl">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C2520]">
                      {section.title[previewLang]}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A4E46] font-sans font-light">
                    {section.subtitle[previewLang]}
                  </p>
                </div>

                {/* Section Content Rendering based on real data */}
                {sectionProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-background/50 text-center gap-2">
                    <p className="text-sm text-muted-foreground font-sans">
                      {previewLang === "en" ? "No products listed in this section." : "لا توجد أطباق معروضة في هذا القسم."}
                    </p>
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      onClick={() => handleOpenSectionManager(section.key)}
                      className="text-brand-gold hover:text-brand-gold/80 flex items-center gap-1 text-xs"
                    >
                      <Plus className="size-3" />
                      {previewLang === "en" ? "Select Products" : "اختر أطباقاً"}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Different layout styles based on section key to match the reference design! */}
                    {section.key === "topPick" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sectionProducts.slice(0, 4).map((p) => (
                          <div key={p._id} className="bg-background rounded-xl overflow-hidden border border-amber-900/10 shadow-sm relative hover:shadow-md transition-all">
                            {/* Gold Badge */}
                            <Badge className="absolute top-2 left-2 bg-[#B88E4C] text-[#FAF6EE] text-[9px] hover:bg-[#B88E4C] px-1.5 py-0.5 rounded font-sans scale-90 border-0">
                              {section.badge[previewLang]}
                            </Badge>
                            <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                              <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                            </div>
                            <div className="p-3 space-y-1">
                              <h4 className="font-playfair font-bold text-sm text-[#2C2520] truncate">{p.name[previewLang]}</h4>
                              <p className="text-xs font-semibold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.key === "chefRecommended" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sectionProducts.slice(0, 3).map((p) => (
                          <div key={p._id} className="bg-background rounded-xl overflow-hidden border border-[#B88E4C]/20 shadow-sm relative flex flex-col hover:shadow-md transition-all">
                            <Badge className="absolute top-3 left-3 bg-[#B88E4C] text-[#FAF6EE] text-[9px] hover:bg-[#B88E4C] px-2 py-0.5 rounded font-sans tracking-wider border-0">
                              {section.badge[previewLang]}
                            </Badge>
                            <div className="aspect-[16/10] w-full bg-muted relative">
                              <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                            </div>
                            <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                              <div className="space-y-1.5">
                                <h4 className="font-playfair font-bold text-base text-[#2C2520]">{p.name[previewLang]}</h4>
                                <p className="text-xs text-[#5A4E46] line-clamp-2 font-sans font-light leading-relaxed">{p.description[previewLang]}</p>
                              </div>
                              <p className="text-sm font-bold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.key === "trending" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sectionProducts.slice(0, 2).map((p) => (
                          <div key={p._id} className="bg-background rounded-xl overflow-hidden border shadow-sm flex items-center p-3 gap-4 hover:shadow-md transition-all">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                            </div>
                            <div className="flex-grow space-y-1.5">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-playfair font-bold text-sm sm:text-base text-[#2C2520] line-clamp-1">{p.name[previewLang]}</h4>
                                <Badge className="bg-[#B88E4C]/10 text-[#B88E4C] hover:bg-[#B88E4C]/10 text-[9px] px-1.5 py-0.5 border-0 font-sans">{section.badge[previewLang]}</Badge>
                              </div>
                              <p className="text-xs text-[#5A4E46] line-clamp-2 leading-relaxed font-sans font-light">{p.description[previewLang]}</p>
                              <p className="text-xs sm:text-sm font-bold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mandi & Seafood - Grid 2x2 with dark details */}
                    {(section.key === "mandi" || section.key === "seafood") && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sectionProducts.slice(0, 4).map((p) => (
                          <div key={p._id} className="bg-background rounded-xl overflow-hidden border border-[#2C2520]/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="aspect-[4/3] w-full bg-muted relative">
                              <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-[#2C2520]/80 text-[#FAF6EE] text-[8px] border-0">{section.badge[previewLang]}</Badge>
                              </div>
                            </div>
                            <div className="p-3 space-y-1 bg-gradient-to-b from-background to-[#FAF6EE]/30">
                              <h4 className="font-playfair font-bold text-xs sm:text-sm text-[#2C2520] truncate">{p.name[previewLang]}</h4>
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Heritage Classics - 3 card layout */}
                    {section.key === "heritage" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sectionProducts.slice(0, 3).map((p) => (
                          <div key={p._id} className="bg-background rounded-xl overflow-hidden border border-amber-950/5 shadow-sm hover:shadow-md transition-all relative">
                            <div className="aspect-[4/3] w-full bg-muted relative">
                              <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className="font-playfair font-bold text-sm sm:text-base text-[#2C2520]">{p.name[previewLang]}</h4>
                                <span className="text-xs font-bold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</span>
                              </div>
                              <p className="text-xs text-[#5A4E46] line-clamp-2 leading-relaxed font-sans font-light">{p.description[previewLang]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Perfect Finish - Left featured, Right list */}
                    {section.key === "finish" && (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Featured (Left 2 columns) */}
                        <div className="md:col-span-2 bg-[#2C2520] text-[#FAF6EE] rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-end min-h-[250px] border border-amber-950/15">
                          <img src={sectionProducts[0]?.image || "/images/restaurant_interior.png"} alt={sectionProducts[0]?.name[previewLang]} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2520] via-[#2C2520]/20 to-transparent" />
                          <div className="p-4 sm:p-6 space-y-2 relative z-10">
                            <Badge className="bg-[#B88E4C] text-white text-[8px] font-sans border-0">{section.badge[previewLang]}</Badge>
                            <h4 className="font-playfair font-bold text-lg sm:text-xl">{sectionProducts[0]?.name[previewLang]}</h4>
                            <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-sans font-light">{sectionProducts[0]?.description[previewLang]}</p>
                            <p className="text-sm font-bold text-[#B88E4C] font-sans">{sectionProducts[0]?.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                          </div>
                        </div>

                        {/* List (Right 3 columns) */}
                        <div className="md:col-span-3 flex flex-col gap-3 justify-center">
                          {sectionProducts.slice(1, 4).map((p) => (
                            <div key={p._id} className="bg-background border rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-all shadow-xs">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[previewLang]} className="object-cover w-full h-full" />
                              </div>
                              <div className="flex-grow space-y-0.5 min-w-0">
                                <h4 className="font-playfair font-bold text-sm text-[#2C2520] truncate">{p.name[previewLang]}</h4>
                                <p className="text-xs text-[#5A4E46] font-sans line-clamp-1 font-light">{p.description[previewLang]}</p>
                                <p className="text-xs font-semibold text-[#B88E4C] font-sans">{p.price.toFixed(3)} {isRTL ? "د.ك" : "KWD"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          
        </div>
      </div>

      {/* ----------------- DIALOGS ----------------- */}

      {/* 1. HERO BANNER EDIT DIALOG */}
      <Dialog open={isHeroEditing} onOpenChange={setIsHeroEditing}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold font-sans">
              <Settings className="size-5 text-brand-gold" />
              Edit Hero Banner Configuration
            </DialogTitle>
            <DialogDescription>
              Configure the welcome banner heading text, subtitle text, background image, and CTA button.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4 font-sans">
            
            {/* English Fields */}
            <div className="space-y-3.5 border-b pb-4">
              <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase flex items-center gap-1">
                <Globe className="size-3" />
                English Content
              </h3>
              
              <div className="grid gap-1.5">
                <Label htmlFor="hero-title-en">Hero Title (English)</Label>
                <Input
                  id="hero-title-en"
                  value={heroForm.title.en}
                  onChange={(e) => setHeroForm({
                    ...heroForm,
                    title: { ...heroForm.title, en: e.target.value }
                  })}
                  placeholder="e.g. A Culinary Journey to Malabar"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="hero-subtitle-en">Hero Subtitle (English)</Label>
                <textarea
                  id="hero-subtitle-en"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={heroForm.subtitle.en}
                  onChange={(e) => setHeroForm({
                    ...heroForm,
                    subtitle: { ...heroForm.subtitle, en: e.target.value }
                  })}
                  placeholder="e.g. Experience the authentic rich flavours of Malabar traditional dishes..."
                />
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="space-y-3.5 border-b pb-4" dir="rtl">
              <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase flex items-center gap-1 justify-end">
                <span>المحتوى العربي</span>
                <Globe className="size-3" />
              </h3>

              <div className="grid gap-1.5 text-right">
                <Label htmlFor="hero-title-ar">العنوان الرئيسي (عربي)</Label>
                <Input
                  id="hero-title-ar"
                  value={heroForm.title.ar}
                  onChange={(e) => setHeroForm({
                    ...heroForm,
                    title: { ...heroForm.title, ar: e.target.value }
                  })}
                  className="text-right"
                  placeholder="مثال: رحلة طهي إلى مليبار"
                />
              </div>

              <div className="grid gap-1.5 text-right">
                <Label htmlFor="hero-subtitle-ar">العنوان الفرعي (عربي)</Label>
                <textarea
                  id="hero-subtitle-ar"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-right"
                  value={heroForm.subtitle.ar}
                  onChange={(e) => setHeroForm({
                    ...heroForm,
                    subtitle: { ...heroForm.subtitle, ar: e.target.value }
                  })}
                  placeholder="مثال: تجربة النكهات الغنية والأصيلة لأطباق مليبار التقليدية..."
                />
              </div>
            </div>

            {/* Banner Image URL and Helper */}
            <div className="space-y-3">
              <Label htmlFor="hero-image-url" className="flex items-center gap-1.5">
                <ImageIcon className="size-4 text-brand-gold" />
                Background Banner Image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="hero-image-url"
                  value={heroForm.imageUrl}
                  onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                  placeholder="e.g. /images/all_dishes.png"
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline" 
                  onClick={() => setHeroForm({ ...heroForm, imageUrl: "/images/all_dishes.png" })}
                  className="text-xs"
                >
                  Reset Default
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Provide a relative path like <code>/images/all_dishes.png</code> or an absolute Cloudinary image URL.
              </p>
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0 font-sans">
            <Button variant="ghost" onClick={() => setIsHeroEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveHero} disabled={isSaving} className="bg-brand-gold hover:bg-brand-gold/90 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. SECTION PRODUCT MANAGER DIALOG */}
      <Dialog open={editingSection !== null} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col font-sans">
          
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Settings className="size-5 text-brand-gold" />
              Manage Section Items: {sections.find(s => s.key === editingSection)?.title[previewLang]}
            </DialogTitle>
            <DialogDescription>
              Select which dishes are displayed in this section. Checked items will be promoted.
            </DialogDescription>
          </DialogHeader>

          {/* Search, Filter & Quick Count */}
          <div className="flex flex-col sm:flex-row gap-3 py-3 border-b flex-shrink-0">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            <select className="h-9 w-full sm:w-[160px] rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name[previewLang]}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-center bg-muted/50 rounded-md px-3 py-1 border text-xs font-semibold text-brand-gold h-9">
              Selected: {selectedProductIds.length}
            </div>
          </div>

          {/* Scrollable Products List */}
          <ScrollArea className="flex-grow overflow-y-auto py-2">
            {filteredProductsForSelect.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No active products match your filter search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProductsForSelect.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod._id)
                  const cat = categories.find(c => c._id === prod.categoryId)
                  
                  return (
                    <button
                      key={prod._id}
                      onClick={() => handleToggleProduct(prod._id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all text-sm group ${
                        isChecked 
                          ? "border-brand-gold bg-brand-gold/5 shadow-xs" 
                          : "hover:bg-muted/50 hover:border-muted-foreground/30 border-muted/80"
                      }`}
                    >
                      <div className={`size-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked 
                          ? "bg-brand-gold border-brand-gold text-white" 
                          : "border-muted-foreground/45 group-hover:border-brand-gold/60"
                      }`}>
                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      <div className="w-11 h-11 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={prod.image || "/images/restaurant_interior.png"} alt={prod.name[previewLang]} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-grow space-y-0.5">
                        <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-brand-gold transition-colors">
                          {prod.name[previewLang]}
                        </h4>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                            {cat ? cat.name[previewLang] : "Uncategorized"}
                          </p>
                          <p className="text-[10px] font-bold text-brand-gold">${prod.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="border-t pt-4 flex-shrink-0 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditingSection(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection} disabled={isSaving} className="bg-brand-gold hover:bg-brand-gold/90 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1.5" />
                  Save Selection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. BANNER SLIDE CREATE / EDIT DIALOG */}
      <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[85vh] overflow-y-auto font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <SlidersHorizontal className="size-5 text-brand-gold" />
              {editingBannerIndex !== null ? "Edit Banner Slide" : "Add New Banner Slide"}
            </DialogTitle>
            <DialogDescription>
              Upload separate banner images for desktop and mobile devices, and configure localized overlay text.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            
            {/* Image Uploads Section */}
            <div className="space-y-4 border-b pb-4 bg-muted/30 p-3 rounded-lg">
              <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase flex items-center gap-1">
                <ImageIcon className="size-3.5" />
                Banner Images (Separate for Desktop & Mobile)
              </h3>

              {/* Desktop Image */}
              <div className="space-y-2">
                <Label htmlFor="desktop-img-url" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Monitor className="size-3.5 text-brand-gold" />
                  Desktop Image (Recommended 1920x800 or 16:9 ratio)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="desktop-img-url"
                    value={bannerForm.desktopImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, desktopImageUrl: e.target.value })}
                    placeholder="Image URL or upload file below..."
                    className="text-xs"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-xs hover:bg-secondary/80 flex-shrink-0">
                    <Upload className="size-3.5 mr-1" />
                    Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, "desktopImageUrl")}
                    />
                  </label>
                </div>
                {bannerForm.desktopImageUrl && (
                  <div className="h-20 w-full rounded overflow-hidden bg-muted border relative">
                    <img src={bannerForm.desktopImageUrl} alt="Desktop Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Mobile Image */}
              <div className="space-y-2">
                <Label htmlFor="mobile-img-url" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Smartphone className="size-3.5 text-brand-gold" />
                  Mobile Image (Recommended 800x1000 or vertical ratio)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="mobile-img-url"
                    value={bannerForm.mobileImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImageUrl: e.target.value })}
                    placeholder="Leave empty to use desktop image on mobile..."
                    className="text-xs"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-xs hover:bg-secondary/80 flex-shrink-0">
                    <Upload className="size-3.5 mr-1" />
                    Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, "mobileImageUrl")}
                    />
                  </label>
                </div>
                {bannerForm.mobileImageUrl && (
                  <div className="h-20 w-32 rounded overflow-hidden bg-muted border relative">
                    <img src={bannerForm.mobileImageUrl} alt="Mobile Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* English Content */}
            <div className="space-y-3.5 border-b pb-4">
              <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase flex items-center gap-1">
                <Globe className="size-3" />
                English Overlay Text
              </h3>
              
              <div className="grid gap-1.5">
                <Label htmlFor="banner-title-en">Title (English)</Label>
                <Input
                  id="banner-title-en"
                  value={bannerForm.title?.en || ""}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    title: { ...bannerForm.title, en: e.target.value, ar: bannerForm.title?.ar || "" }
                  })}
                  placeholder="e.g. Authentic Malabar Feast"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="banner-sub-en">Subtitle (English)</Label>
                <textarea
                  id="banner-sub-en"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={bannerForm.subtitle?.en || ""}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    subtitle: { ...bannerForm.subtitle, en: e.target.value, ar: bannerForm.subtitle?.ar || "" }
                  })}
                  placeholder="e.g. Discover rich traditional spices..."
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="banner-cta-en">Button CTA Text (English)</Label>
                <Input
                  id="banner-cta-en"
                  value={bannerForm.ctaText?.en || "Explore Menu"}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    ctaText: { ...bannerForm.ctaText, en: e.target.value, ar: bannerForm.ctaText?.ar || "استكشف القائمة" }
                  })}
                />
              </div>
            </div>

            {/* Arabic Content */}
            <div className="space-y-3.5 border-b pb-4" dir="rtl">
              <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase flex items-center gap-1 justify-end">
                <span>المحتوى العربي</span>
                <Globe className="size-3" />
              </h3>

              <div className="grid gap-1.5 text-right">
                <Label htmlFor="banner-title-ar">العنوان (عربي)</Label>
                <Input
                  id="banner-title-ar"
                  value={bannerForm.title?.ar || ""}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    title: { ...bannerForm.title, ar: e.target.value, en: bannerForm.title?.en || "" }
                  })}
                  className="text-right"
                  placeholder="مثال: وليمة مليبار الأصيلة"
                />
              </div>

              <div className="grid gap-1.5 text-right">
                <Label htmlFor="banner-sub-ar">العنوان الفرعي (عربي)</Label>
                <textarea
                  id="banner-sub-ar"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-right"
                  value={bannerForm.subtitle?.ar || ""}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    subtitle: { ...bannerForm.subtitle, ar: e.target.value, en: bannerForm.subtitle?.en || "" }
                  })}
                  placeholder="مثال: اكتشف التوابل التقليدية الغنية..."
                />
              </div>

              <div className="grid gap-1.5 text-right">
                <Label htmlFor="banner-cta-ar">نص الزر (عربي)</Label>
                <Input
                  id="banner-cta-ar"
                  value={bannerForm.ctaText?.ar || "استكشف القائمة"}
                  onChange={(e) => setBannerForm({
                    ...bannerForm,
                    ctaText: { ...bannerForm.ctaText, ar: e.target.value, en: bannerForm.ctaText?.en || "Explore Menu" }
                  })}
                  className="text-right"
                />
              </div>
            </div>

            {/* Link & Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="banner-link">Target Link URL</Label>
                <Input
                  id="banner-link"
                  value={bannerForm.linkUrl || "/menu"}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  placeholder="/menu"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <Label htmlFor="banner-active" className="text-xs font-semibold cursor-pointer">
                  Active in Carousel
                </Label>
                <Switch
                  id="banner-active"
                  checked={bannerForm.active}
                  onCheckedChange={(checked) => setBannerForm({ ...bannerForm, active: checked })}
                />
              </div>
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsBannerModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveBannerSubmit} disabled={isSaving} className="bg-brand-gold hover:bg-brand-gold/90 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Saving Banner...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1.5" />
                  Save Banner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
