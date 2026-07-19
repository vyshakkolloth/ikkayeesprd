"use client"

import * as React from "react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ProductForm } from "../forms/product-form"
import {
  SearchIcon,
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  Loader2Icon,
  CheckIcon,
  LeafIcon,
  UtensilsIcon,
  HelpCircleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  _id: string
  name: { en: string; ar: string }
  description: { en: string; ar: string }
  slug: string
  categoryId: string
  categoryName?: { en: string; ar: string }
  image: string
  imageAlt: { en: string; ar: string }
  price: number
  hasPortions: boolean
  portions: { name: { en: string; ar: string }; price: number }[]
  chefRecommended: boolean
  spiceLevel: "low" | "medium" | "high"
  servingSize: string
  prepTime?: string
  isVeg: boolean
  tags: string[]
  sortOrder: number
  active: boolean
  topPick?: boolean
  pairedProductId?: string | null
  updatedAt: string
}

interface ProductListProps {
  initialProducts: Product[]
  initialTotal: number
  categories: { _id: string; name: { en: string; ar: string } }[]
  allProducts?: { _id: string; name: { en: string; ar: string } }[]
}

export function ProductList({
  initialProducts = [],
  initialTotal = 0,
  categories = [],
  allProducts = [],
}: ProductListProps) {
  const isMobile = useIsMobile()

  // API parameters state
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  
  // Custom Filters
  const [filterCategory, setFilterCategory] = React.useState("all")
  const [filterActive, setFilterActive] = React.useState("all") // "all" | "active" | "inactive"
  const [filterVeg, setFilterVeg] = React.useState("all") // "all" | "veg" | "non-veg"
  const [filterChef, setFilterChef] = React.useState("all") // "all" | "recommended"
  const [filterTopPick, setFilterTopPick] = React.useState("all") // "all" | "top"
  const [filterSpice, setFilterSpice] = React.useState("all") // "all" | "low" | "medium" | "high"

  // Sorting
  const [sortBy, setSortBy] = React.useState("sortOrder")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)

  // Products loading & optimistic states
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [total, setTotal] = React.useState(initialTotal)
  const [totalPages, setTotalPages] = React.useState(Math.ceil(initialTotal / 20))
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSyncingStatus, setIsSyncingStatus] = React.useState(false)

  // Form Dialog States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [isSubmittingForm, setIsSubmittingForm] = React.useState(false)

  // Delete Confirm Dialog State
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const getPairedName = (pairedId?: string | null) => {
    if (!pairedId) return null
    const found = allProducts.find((p) => p._id === pairedId)
    return found ? found.name : null
  }

  // Search Debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [filterCategory, filterActive, filterVeg, filterChef, filterTopPick, filterSpice, sortBy, sortOrder])

  // Fetch Products from API when parameters change
  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      let url = `/api/products?search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=20&sortBy=${sortBy}&sortOrder=${sortOrder}`
      
      if (filterCategory !== "all") {
        url += `&categoryId=${filterCategory}`
      }
      if (filterActive !== "all") {
        url += `&active=${filterActive === "active"}`
      }
      if (filterVeg !== "all") {
        url += `&isVeg=${filterVeg === "veg"}`
      }
      if (filterChef === "recommended") {
        url += `&chefRecommended=true`
      }
      if (filterTopPick === "top") {
        url += `&topPick=true`
      }
      if (filterSpice !== "all") {
        url += `&spiceLevel=${filterSpice}`
      }

      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setProducts(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        toast.error(data.error || "Failed to retrieve products.")
      }
    } catch (err) {
      toast.error("Network error. Unable to contact product server.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, filterCategory, filterActive, filterVeg, filterChef, filterTopPick, filterSpice, sortBy, sortOrder, page])

  // Execute fetch
React.useEffect(() => {
      // Skip initial fetch when SSR already supplied data and no filters have changed
      if (
        page === 1 &&
        debouncedSearch === "" &&
        filterCategory === "all" &&
        filterActive === "all" &&
        filterVeg === "all" &&
        filterChef === "all" &&
        filterTopPick === "all" &&
        filterSpice === "all" &&
        sortBy === "sortOrder" &&
        sortOrder === "asc" &&
        products.length > 0
      ) {
        return;
      }
      fetchProducts()
    }, [fetchProducts])

  // Toggle active status endpoint
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const previousProducts = [...products]
    
    // Optimistic UI state toggle
    setProducts(
      products.map((p) => (p._id === id ? { ...p, active: !currentStatus } : p))
    )
    
    setIsSyncingStatus(true)
    try {
      const response = await fetch("/api/products/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }
      toast.success("Product active status updated successfully.")
    } catch (err: any) {
      toast.error(err.message || "Unable to sync status. Reverting changes.")
      setProducts(previousProducts)
    } finally {
      setIsSyncingStatus(false)
    }
  }

  // Handle Delete execution
  const handleDeleteProduct = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${deletingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Product successfully deleted.")
        setIsDeleteConfirmOpen(false)
        setDeletingId(null)
        fetchProducts() // refresh current view
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete product.")
      }
    } catch (err) {
      toast.error("Network error. Could not delete product.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Form submission (Create & Edit)
  const handleFormSubmit = async (payload: any) => {
    setIsSubmittingForm(true)
    try {
      const isEditing = !!editingProduct
      const url = isEditing ? `/api/products/${editingProduct?._id}` : "/api/products"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || "Product saved successfully.")
        setIsFormOpen(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        toast.error(data.error || "Failed to save product.")
      }
    } catch (err) {
      toast.error("Network error. Unable to save product details.")
    } finally {
      setIsSubmittingForm(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Filtering toolbar */}
      <div className="bg-card p-4 rounded-xl border space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={(val) => val && setFilterCategory(val)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.en} / {cat.name.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Veg/Dietary Filter */}
            <Select value={filterVeg} onValueChange={(val) => val && setFilterVeg(val)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Dietary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diets</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>

            {/* Active status Filter */}
            <Select value={filterActive} onValueChange={(val) => val && setFilterActive(val)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Trigger */}
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="outline" size="icon" title="More Filters" />
                }
              >
                <SlidersHorizontalIcon className="size-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Advanced Filters & Sorting</DialogTitle>
                  <DialogDescription>Refine product menu results.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Chef Recommendation Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Chef Pick</label>
                      <Select value={filterChef} onValueChange={(val) => val && setFilterChef(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          <SelectItem value="recommended">Chef Recommended Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Top Pick Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Top Pick</label>
                      <Select value={filterTopPick} onValueChange={(val) => val && setFilterTopPick(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          <SelectItem value="top">Top Picks Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Spice Level Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Spice Level</label>
                      <Select value={filterSpice} onValueChange={(val) => val && setFilterSpice(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Spice Levels</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t pt-3">
                    {/* Sort By Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Sort By</label>
                      <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sortOrder">Sort Weight</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="updatedAt">Updated Date</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Direction</label>
                      <Select value={sortOrder} onValueChange={(val) => val && setSortOrder(val as "asc" | "desc")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending (A-Z / Low-High)</SelectItem>
                          <SelectItem value="desc">Descending (Z-A / High-Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" />}>
                    Apply Filters
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Product Button */}
            {isMobile ? (
              <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DrawerTrigger
                  render={
                    <Button
                      onClick={() => {
                        setEditingProduct(null)
                        setIsFormOpen(true)
                      }}
                    />
                  }
                >
                  <PlusIcon className="size-4 mr-1" /> Add Product
                </DrawerTrigger>
                <DrawerContent className="max-h-[92vh]">
                  <DrawerHeader>
                    <DrawerTitle>Create New Product</DrawerTitle>
                    <DrawerDescription>Fill in name, pricing, and category.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    <ProductForm
                      categories={categories}
                      allProducts={allProducts}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmittingForm}
                      submitLabel="Add Product"
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger
                  render={
                    <Button
                      onClick={() => {
                        setEditingProduct(null)
                        setIsFormOpen(true)
                      }}
                    />
                  }
                >
                  <PlusIcon className="size-4 mr-1" /> Add Product
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
                    <DialogDescription>
                      Configure pricing models, localized description content, and menu listings.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm
                    initialData={editingProduct}
                    categories={categories}
                    allProducts={allProducts}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmittingForm}
                    submitLabel={editingProduct ? "Update Product" : "Create Product"}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* 2. Loading state indicators */}
      {isSyncingStatus && (
        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-lg animate-pulse w-fit">
          <Loader2Icon className="size-3.5 animate-spin" /> Saving product active status...
        </div>
      )}

      {/* 3. Product table grid */}
      <div className="border rounded-xl bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 bg-background/50 min-h-[300px]">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-background/50 min-h-[300px]">
            <div className="p-4 bg-muted rounded-full text-muted-foreground mb-4">
              <UtensilsIcon className="size-8" />
            </div>
            <h3 className="text-lg font-bold">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
              We couldn&apos;t find any items matching your selected criteria. Try adjusting your searches or filters.
            </p>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsFormOpen(true)
              }}
            >
              Create your first product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>English Name</TableHead>
                  <TableHead>Arabic Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} className="hover:bg-muted/40">
                    {/* Image */}
                    <TableCell className="p-2.5">
                      <div className="size-11 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.imageAlt.en}
                          className="w-full h-full object-cover bg-white"
                        />
                      </div>
                    </TableCell>

                    {/* Names */}
                    <TableCell className="font-semibold">
                      <div>{product.name.en}</div>
                      {product.pairedProductId && (
                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                          Pair with: <span className="font-semibold text-primary">{getPairedName(product.pairedProductId)?.en || "Item"}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{product.name.ar}</div>
                      {product.pairedProductId && (
                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5" dir="rtl">
                          شريك مع: <span className="font-semibold text-primary">{getPairedName(product.pairedProductId)?.ar || "صنف"}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="outline">
                        {product.categoryName?.en || "Uncategorized"}
                      </Badge>
                    </TableCell>

                    {/* Price Range */}
                    <TableCell className="font-semibold">
                      {product.hasPortions ? (
                        <span className="text-xs text-muted-foreground">
                          {product.portions.length} Sizes
                          <br />
                          <span className="text-sm font-bold text-foreground">
                            KWD${Math.min(...product.portions.map(p => p.price))}+
                          </span>
                        </span>
                      ) : (
                        <span>KWD${product.price.toFixed(2)}</span>
                      )}
                    </TableCell>

                    {/* Badge details */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.isVeg && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 gap-0.5 text-[10px]">
                            <LeafIcon className="size-2.5" /> Veg
                          </Badge>
                        )}
                        {product.chefRecommended && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-0.5 text-[10px]">
                            ★ Recommended
                          </Badge>
                        )}
                        {product.topPick && (
                          <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 gap-0.5 text-[10px]">
                            ✦ Top Pick
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {product.spiceLevel} Spice
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Active switcher */}
                    <TableCell>
                      <Switch
                        checked={product.active}
                        onCheckedChange={() => handleToggleActive(product._id, product.active)}
                        disabled={isSyncingStatus}
                      />
                    </TableCell>

                    {/* Updated Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            setEditingProduct(product)
                            setIsFormOpen(true)
                          }}
                          title="Edit Product"
                        >
                          <Edit2Icon className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeletingId(product._id)
                            setIsDeleteConfirmOpen(true)
                          }}
                          title="Delete Product"
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 4. Pagination panel */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border bg-card p-4 rounded-xl shadow-xs">
          <span className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} Total Products)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1
              return (
                <Button
                  key={pNum}
                  variant={page === pNum ? "default" : "outline"}
                  size="icon"
                  className="size-8 text-xs font-bold"
                  onClick={() => setPage(pNum)}
                  disabled={isLoading}
                >
                  {pNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Soft Delete confirmation dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will perform a soft delete on this product. It will be hidden from all client menus but will remain in database archive logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="size-3.5 mr-1.5 animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, delete product"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
