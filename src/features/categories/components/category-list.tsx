"use client"

import * as React from "react"
import {
  GripVerticalIcon,
  EditIcon,
  Trash2Icon,
  SearchIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  FolderOpenIcon,
  Loader2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  ArrowUpDownIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// UI Imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
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

// DND-Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

// Form Import
import { CategoryForm } from "../forms/category-form"

// Category Interface
interface Category {
  _id: string
  name: { en: string; ar: string }
  slug: string
  image: string
  alt: { en: string; ar: string }
  description?: { en: string; ar: string }
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------
// 1. Sortable Row Component
// ---------------------------------------------------------
interface SortableRowProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  isReorderAllowed: boolean
}

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
  isReorderAllowed,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 40 : undefined,
  }

  const createdDate = new Date(category.createdAt).toLocaleDateString()
  const updatedDate = new Date(category.updatedAt).toLocaleDateString()

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "bg-muted shadow-sm select-none relative z-50")}
    >
      <TableCell className="w-12 text-center p-2">
        {isReorderAllowed ? (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${category.name.en} to reorder`}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            className="opacity-20 cursor-not-allowed p-1.5 text-muted-foreground"
            disabled
            title="Reordering is only allowed when sorted by Priority (asc), status is 'All', and search is empty"
          >
            <GripVerticalIcon className="size-4" />
          </button>
        )}
      </TableCell>
      
      {/* Category Image */}
      <TableCell className="p-2">
        <div className="size-10 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt={category.alt.en}
            className="w-full h-full object-cover bg-white"
          />
        </div>
      </TableCell>

      <TableCell className="font-medium p-2">{category.name.en}</TableCell>
      <TableCell className="text-right font-medium p-2" dir="rtl">{category.name.ar}</TableCell>
      <TableCell className="text-muted-foreground p-2">/{category.slug}</TableCell>
      <TableCell className="text-center p-2">
        <Badge variant="outline">{category.priority}</Badge>
      </TableCell>
      <TableCell className="p-2">
        {category.isActive ? (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-white flex items-center gap-1 w-fit">
            <CheckCircle2Icon className="size-3" /> Active
          </Badge>
        ) : (
          <Badge className="bg-destructive hover:bg-destructive border-none text-white flex items-center gap-1 w-fit">
            <XCircleIcon className="size-3" /> Inactive
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs p-2 hidden md:table-cell">{createdDate}</TableCell>
      <TableCell className="text-muted-foreground text-xs p-2 hidden md:table-cell">{updatedDate}</TableCell>

      <TableCell className="text-right p-2">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            title="Edit category"
          >
            <EditIcon className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category._id)}
            title="Delete category"
          >
            <Trash2Icon className="size-4 text-destructive hover:text-destructive/80" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------
// 2. Main List Component
// ---------------------------------------------------------
interface CategoryListProps {
  initialCategories: Category[]
  initialTotal: number
}

export function CategoryList({
  initialCategories,
  initialTotal,
}: CategoryListProps) {
  const isMobile = useIsMobile()

  // API parameters state
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "inactive" | "all">("all")
  const [page, setPage] = React.useState(1)

  // Categories loading & optimistic states
  const [categories, setCategories] = React.useState<Category[]>(initialCategories)
  const [total, setTotal] = React.useState(initialTotal)
  const [totalPages, setTotalPages] = React.useState(Math.ceil(initialTotal / 20))
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSyncingOrder, setIsSyncingOrder] = React.useState(false)

  // Modal Dialog/Drawer States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [isSubmittingForm, setIsSubmittingForm] = React.useState(false)

  // Delete Confirm Dialog State
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Setup DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Search debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch Categories from REST Endpoint when parameters change
  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/categories?search=${encodeURIComponent(debouncedSearch)}&status=${status}&sortBy=priority&sortOrder=asc&page=${page}&limit=20`
      )
      const data = await response.json()
      if (response.ok) {
        setCategories(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        toast.error(data.error || "Failed to retrieve categories.")
      }
    } catch (err) {
      toast.error("Network error. Unable to contact categories server.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, status, page])

  // Call fetch categories
React.useEffect(() => {
      // Skip fetching on first render when we already have initial data from SSR
      if (page === 1 && debouncedSearch === "" && status === "all" && categories.length > 0) {
        return;
      }
      fetchCategories()
    }, [fetchCategories])

  // Drag and Drop reordering logic with optimistic update
  const isReorderAllowed = status === "all" && !debouncedSearch

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c._id === active.id)
    const newIndex = categories.findIndex((c) => c._id === over.id)

    // Save previous state to revert if API write fails
    const previousCategories = [...categories]

    // 1. Optimistic UI update (update priorities dynamically to match new order indexes)
    const reordered = arrayMove(categories, oldIndex, newIndex)
    const reorderedCategories = reordered.map((cat, idx) => ({
      ...cat,
      priority: idx,
    }))
    setCategories(reorderedCategories)

    // 2. Sync to API
    setIsSyncingOrder(true)
    try {
      const orderedIds = reorderedCategories.map((c) => c._id)
      const response = await fetch("/api/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to update category order")
      }
      toast.success("Category sorting order saved.")
    } catch (err: any) {
      toast.error(err.message || "Reordering failed. Reverting categories state.")
      setCategories(previousCategories) // Revert state
    } finally {
      setIsSyncingOrder(false)
    }
  }

  // Create/Edit Handler
  const handleFormSubmit = async (formData: any) => {
    setIsSubmittingForm(true)
    try {
      const isEdit = !!editingCategory
      const url = isEdit ? `/api/categories/${editingCategory._id}` : "/api/categories"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Save action failed.")
        return
      }

      toast.success(isEdit ? "Category updated successfully" : "Category created successfully")
      setIsFormOpen(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err) {
      toast.error("A network error occurred while submitting.")
    } finally {
      setIsSubmittingForm(false)
    }
  }

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/categories/${deletingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const err = await response.json()
        toast.error(err.error || "Delete action failed.")
        return
      }

      toast.success("Category deleted successfully.")
      setIsDeleteConfirmOpen(false)
      setDeletingId(null)
      fetchCategories()
    } catch (err) {
      toast.error("Network error occurred while trying to delete.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Responsive Create/Edit Sheet Container
  const SheetContainer = isMobile ? Drawer : Dialog
  const SheetContentComp = isMobile ? DrawerContent : DialogContent
  const SheetHeaderComp = isMobile ? DrawerHeader : DialogHeader
  const SheetTitleComp = isMobile ? DrawerTitle : DialogTitle
  const SheetDescriptionComp = isMobile ? DrawerDescription : DialogDescription

  return (
    <div className="space-y-6 w-full px-4 lg:px-6">
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-sm text-muted-foreground">
            Organize restaurant items, assign weights, and set category drag priorities.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null)
            setIsFormOpen(true)
          }}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusIcon className="size-4" /> Add Category
        </Button>
      </div>

      {/* 2. Search, Filters & Sorting Controls */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by English name, Arabic name, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 w-full md:w-auto">
            {/* Status Filters */}
            <div className="flex border rounded-lg bg-muted/30 p-1 select-none">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
                    status === s
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Categories List Table */}
      {isSyncingOrder && (
        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-lg animate-pulse w-fit">
          <Loader2Icon className="size-3.5 animate-spin" /> Saving drag priority order to database...
        </div>
      )}

      {isLoading ? (
        <div className="border rounded-lg p-12 flex flex-col items-center justify-center bg-background/50 min-h-[300px] gap-3">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center bg-background/50 min-h-[300px]">
          <div className="p-4 bg-muted rounded-full text-muted-foreground mb-4">
            <FolderOpenIcon className="size-8" />
          </div>
          <h3 className="text-lg font-bold">No categories found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            We couldn&apos;t find any categories matching your criteria. Get started by creating your first category.
          </p>
          <Button
            onClick={() => {
              setEditingCategory(null)
              setIsFormOpen(true)
            }}
          >
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>English Name</TableHead>
                  <TableHead className="text-right">Arabic Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Updated</TableHead>
                  <TableHead className="w-24 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={categories.map((c) => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {categories.map((cat) => (
                    <SortableCategoryRow
                      key={cat._id}
                      category={cat}
                      onEdit={(c) => {
                        setEditingCategory(c)
                        setIsFormOpen(true)
                      }}
                      onDelete={(id) => {
                        setDeletingId(id)
                        setIsDeleteConfirmOpen(true)
                      }}
                      isReorderAllowed={isReorderAllowed}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      )}

      {/* 4. Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold">{(page - 1) * 20 + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(page * 20, total)}
            </span>{" "}
            of <span className="font-semibold">{total}</span> categories
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                className="size-8 p-0"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 5. Create / Edit Category Modal container */}
      <SheetContainer open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContentComp className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <SheetHeaderComp>
            <SheetTitleComp>
              {editingCategory ? "Edit Category" : "Create Category"}
            </SheetTitleComp>
            <SheetDescriptionComp>
              {editingCategory
                ? "Update fields for your menu category. Changes reflect immediately."
                : "Fill in the details below to add a new category to the menu."}
            </SheetDescriptionComp>
          </SheetHeaderComp>
          <div className="py-4">
            <CategoryForm
              initialData={editingCategory || undefined}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmittingForm}
              submitLabel={editingCategory ? "Update Category" : "Create Category"}
            />
          </div>
        </SheetContentComp>
      </SheetContainer>

      {/* 6. Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category from your restaurant database. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
