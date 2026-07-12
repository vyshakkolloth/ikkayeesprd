"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ImageUpload } from "@/features/categories/components/image-upload"
import { TagSelector } from "../components/tag-selector"
import { ChevronDownIcon, CheckIcon, Trash2Icon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const productFormSchema = z.object({
  name: z.object({
    en: z.string().min(2, "English name must be at least 2 characters").max(100, "English name must be under 100 characters"),
    ar: z.string().min(2, "Arabic name must be at least 2 characters").max(100, "Arabic name must be under 100 characters"),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required").max(1000, "English description must be under 1000 characters"),
    ar: z.string().min(1, "Arabic description is required").max(1000, "Arabic description must be under 1000 characters"),
  }),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Product image is required"),
  imageAlt: z.object({
    en: z.string().min(1, "English alt text is required"),
    ar: z.string().min(1, "Arabic alt text is required"),
  }),
  price: z.number().positive("Price must be greater than zero").or(z.nan()),
  hasPortions: z.boolean().default(false),
  portions: z.array(
    z.object({
      name: z.object({
        en: z.string().min(1, "Portion name is required"),
        ar: z.string().min(1, "Portion name is required"),
      }),
      price: z.number().positive("Portion price must be greater than zero"),
    })
  ).default([]),
  chefRecommended: z.boolean().default(false),
  topPick: z.boolean().default(false),
  spiceLevel: z.enum(["low", "medium", "high"]).default("medium"),
  servingSize: z.string().optional().default(""),
  prepTime: z.string().optional().default(""),
  isVeg: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().min(0, "Sort order must be at least 0").default(0),
  active: z.boolean().default(true),
}).refine((data) => {
  if (data.hasPortions) {
    return data.portions.length > 0
  }
  return true;
}, {
  message: "At least one portion is required when portions are enabled",
  path: ["portions"],
}).refine((data) => {
  if (!data.hasPortions) {
    return typeof data.price === "number" && !isNaN(data.price) && data.price > 0;
  }
  return true;
}, {
  message: "Base price is required when portions are disabled",
  path: ["price"],
});

type ProductFormValues = z.infer<typeof productFormSchema>

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

interface ProductFormProps {
  initialData?: any
  categories: { _id: string; name: { en: string; ar: string } }[]
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

export function ProductForm({
  initialData,
  categories = [],
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false)

  // Custom Searchable Category Select State
  const [isCatOpen, setIsCatOpen] = React.useState(false)
  const [catSearch, setCatSearch] = React.useState("")
  const catContainerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (catContainerRef.current && !catContainerRef.current.contains(e.target as Node)) {
        setIsCatOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Custom lightweight Zod Resolver to run validation inside React Hook Form
  const customResolver = React.useCallback(async (values: ProductFormValues) => {
    const result = productFormSchema.safeParse({
      ...values,
      price: values.price === "" ? NaN : Number(values.price),
      sortOrder: values.sortOrder === "" ? 0 : Number(values.sortOrder),
      portions: (values.portions || []).map((port) => ({
        ...port,
        price: port.price === "" ? NaN : Number(port.price),
      })),
    })

    if (result.success) {
      return { values: result.data, errors: {} }
    }

    const errors: any = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".")
      errors[path] = {
        type: issue.code,
        message: issue.message,
      }
    })

    return { values: {}, errors }
  }, [])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: customResolver as any,
    defaultValues: {
      name: {
        en: initialData?.name?.en || "",
        ar: initialData?.name?.ar || "",
      },
      description: {
        en: initialData?.description?.en || "",
        ar: initialData?.description?.ar || "",
      },
      slug: initialData?.slug || "",
      categoryId: initialData?.categoryId || "",
      image: initialData?.image || "",
      imageAlt: {
        en: initialData?.imageAlt?.en || "",
        ar: initialData?.imageAlt?.ar || "",
      },
      price: initialData?.price ?? "",
      hasPortions: initialData?.hasPortions || false,
      portions: initialData?.portions || [],
      chefRecommended: initialData?.chefRecommended || false,
      topPick: initialData?.topPick || false,
      spiceLevel: initialData?.spiceLevel || "medium",
      servingSize: initialData?.servingSize || "",
      prepTime: initialData?.prepTime || "",
      isVeg: initialData?.isVeg || false,
      tags: initialData?.tags || [],
      sortOrder: initialData?.sortOrder ?? 0,
      active: initialData?.active ?? true,
    },
  })

  // Dynamic Array for portions
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "portions",
  })

  const watchNameEn = watch("name.en")
  const watchImage = watch("image")
  const watchCategoryId = watch("categoryId")
  const watchHasPortions = watch("hasPortions")
  const watchSpiceLevel = watch("spiceLevel")
  const watchTags = watch("tags")
  const watchActive = watch("active")
  const watchChefRecommended = watch("chefRecommended")
  const watchTopPick = watch("topPick")
  const watchIsVeg = watch("isVeg")

  // Auto-slugify English name if not manually modified and not editing
  React.useEffect(() => {
    if (!isSlugManuallyEdited && !initialData) {
      setValue("slug", slugify(watchNameEn || ""), { shouldValidate: true })
    }
  }, [watchNameEn, isSlugManuallyEdited, setValue, initialData])

  // Sync default Image Alt texts with category names
  React.useEffect(() => {
    if (!initialData) {
      setValue("imageAlt.en", watchNameEn ? `${watchNameEn} Product Image` : "")
      const watchNameAr = watch("name.ar")
      setValue("imageAlt.ar", watchNameAr ? `صورة المنتج ${watchNameAr}` : "")
    }
  }, [watchNameEn, watch("name.ar"), setValue, initialData])

  const onSubmitHandler = async (data: ProductFormValues) => {
    // If portions are enabled, base price gets set to the first portion's price or remains zero
    const finalPrice = data.hasPortions
      ? data.portions[0]?.price || 0
      : Number(data.price)

    const payload = {
      ...data,
      price: finalPrice,
      portions: data.hasPortions ? data.portions : [],
    }

    await onSubmit(payload)
  }

  const selectedCategory = categories.find((c) => c._id === watchCategoryId)
  const filteredCategories = categories.filter((c) =>
    c.name.en.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.name.ar.toLowerCase().includes(catSearch.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      {/* 1. Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure product names and description summaries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.name?.en}>
              <FieldLabel htmlFor="name.en">English Name</FieldLabel>
              <Input
                id="name.en"
                type="text"
                placeholder="e.g. Butter Chicken"
                disabled={isSubmitting}
                {...register("name.en")}
              />
              {errors.name?.en && <FieldError>{errors.name.en.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.name?.ar}>
              <FieldLabel htmlFor="name.ar" className="text-right w-full block">Arabic Name (الاسم بالعربية)</FieldLabel>
              <Input
                id="name.ar"
                type="text"
                placeholder="مثال: دجاج بالزبدة"
                dir="rtl"
                disabled={isSubmitting}
                className="text-right"
                {...register("name.ar")}
              />
              {errors.name?.ar && <FieldError>{errors.name.ar.message}</FieldError>}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.description?.en}>
              <FieldLabel htmlFor="description.en">English Description</FieldLabel>
              <textarea
                id="description.en"
                placeholder="Describe this product's flavor profile..."
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                {...register("description.en")}
              />
              {errors.description?.en && <FieldError>{errors.description.en.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.description?.ar}>
              <FieldLabel htmlFor="description.ar" className="text-right w-full block">Arabic Description (وصف المنتج)</FieldLabel>
              <textarea
                id="description.ar"
                placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                dir="rtl"
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                rows={3}
                {...register("description.ar")}
              />
              {errors.description?.ar && <FieldError>{errors.description.ar.message}</FieldError>}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 2. Category Selection & Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Category</CardTitle>
            <CardDescription>Assign this product to a menu section.</CardDescription>
          </CardHeader>
          <CardContent>
            <Field data-invalid={!!errors.categoryId}>
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>
              <div ref={catContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  disabled={isSubmitting}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left"
                >
                  <span className="truncate">
                    {selectedCategory
                      ? `${selectedCategory.name.en} / ${selectedCategory.name.ar}`
                      : "Select a category..."}
                  </span>
                  <ChevronDownIcon className="size-4 opacity-50" />
                </button>

                {isCatOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-lg shadow-md max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search category..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-48 p-1">
                      {filteredCategories.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2 text-center">No categories found</div>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              setValue("categoryId", cat._id, { shouldValidate: true })
                              setIsCatOpen(false)
                              setCatSearch("")
                            }}
                            className={cn(
                              "flex w-full items-center justify-between px-2.5 py-1.5 text-sm rounded-md text-left hover:bg-accent hover:text-accent-foreground",
                              watchCategoryId === cat._id && "bg-accent font-medium"
                            )}
                          >
                            <span>{cat.name.en} / {cat.name.ar}</span>
                            {watchCategoryId === cat._id && <CheckIcon className="size-3.5" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
            </Field>
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>Drag and drop a photo representing the item.</CardDescription>
          </CardHeader>
          <CardContent>
            <Field data-invalid={!!errors.image}>
              <ImageUpload
                value={watchImage}
                onChange={(url) => setValue("image", url, { shouldValidate: true })}
                disabled={isSubmitting}
              />
              {errors.image && <FieldError>{errors.image.message}</FieldError>}
            </Field>
          </CardContent>
        </Card>
      </div>

      {/* 3. Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Model</CardTitle>
              <CardDescription>Set fixed pricing or size variations.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Enable Portions</span>
              <Switch
                checked={watchHasPortions}
                onCheckedChange={(checked) => setValue("hasPortions", checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!watchHasPortions ? (
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Base Price</FieldLabel>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g. 15.00"
                disabled={isSubmitting}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <FieldError>{errors.price.message}</FieldError>}
            </Field>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Portion Sizes</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: { en: "", ar: "" }, price: "" as any })}
                  disabled={isSubmitting}
                >
                  <PlusIcon className="size-3.5 mr-1" /> Add Portion
                </Button>
              </div>

              {errors.portions && (
                <div className="text-sm font-semibold text-destructive">{errors.portions.message}</div>
              )}

              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start border p-3.5 rounded-lg bg-muted/10 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                      <Field data-invalid={!!(errors.portions as any)?.[index]?.name?.en}>
                        <Input
                          placeholder="Portion (en) e.g. Large"
                          disabled={isSubmitting}
                          {...register(`portions.${index}.name.en` as const)}
                        />
                      </Field>

                      <Field data-invalid={!!(errors.portions as any)?.[index]?.name?.ar}>
                        <Input
                          placeholder="مثال: كبير"
                          dir="rtl"
                          className="text-right"
                          disabled={isSubmitting}
                          {...register(`portions.${index}.name.ar` as const)}
                        />
                      </Field>

                      <Field data-invalid={!!(errors.portions as any)?.[index]?.price}>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          disabled={isSubmitting}
                          {...register(`portions.${index}.price` as const, { valueAsNumber: true })}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => index > 0 && move(index, index - 1)}
                        disabled={index === 0 || isSubmitting}
                        title="Move Up"
                      >
                        <ArrowUpIcon className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => index < fields.length - 1 && move(index, index + 1)}
                        disabled={index === fields.length - 1 || isSubmitting}
                        title="Move Down"
                      >
                        <ArrowDownIcon className="size-3.5" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="size-7 self-center"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                      title="Remove Portion"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Food Details & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Food Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Characteristics</CardTitle>
            <CardDescription>Spice levels, serving quantities, and dietary status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Veg Status</span>
                <span className="text-xs text-muted-foreground">Toggle if this product is Vegetarian</span>
              </div>
              <Switch
                checked={watchIsVeg}
                onCheckedChange={(checked) => setValue("isVeg", checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Chef Recommended</span>
                <span className="text-xs text-muted-foreground">Highlights as chef pick</span>
              </div>
              <Switch
                checked={watchChefRecommended}
                onCheckedChange={(checked) => setValue("chefRecommended", checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Top Pick</span>
                <span className="text-xs text-muted-foreground">Display in top picks section</span>
              </div>
              <Switch
                checked={watchTopPick}
                onCheckedChange={(checked) => setValue("topPick", checked)}
                disabled={isSubmitting}
              />
            </div>

            <Field data-invalid={!!errors.spiceLevel}>
              <FieldLabel htmlFor="spiceLevel">Spice Level</FieldLabel>
              <Select
                value={watchSpiceLevel}
                onValueChange={(val: any) => setValue("spiceLevel", val)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="spiceLevel">
                  <SelectValue placeholder="Select Spice Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Spice</SelectItem>
                  <SelectItem value="medium">Medium Spice</SelectItem>
                  <SelectItem value="high">High Spice</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field data-invalid={!!errors.servingSize}>
                <FieldLabel htmlFor="servingSize">Serving Size</FieldLabel>
                <Input
                  id="servingSize"
                  placeholder="e.g. 2-3 People"
                  disabled={isSubmitting}
                  {...register("servingSize")}
                />
              </Field>

              <Field data-invalid={!!errors.prepTime}>
                <FieldLabel htmlFor="prepTime">Prep Time</FieldLabel>
                <Input
                  id="prepTime"
                  placeholder="e.g. 15-20 min"
                  disabled={isSubmitting}
                  {...register("prepTime")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Product Tags</CardTitle>
            <CardDescription>Add flags for client menus search filters.</CardDescription>
          </CardHeader>
          <CardContent>
            <TagSelector
              value={watchTags}
              onChange={(tags) => setValue("tags", tags)}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>

      {/* 5. SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Optimization</CardTitle>
          <CardDescription>Slug handles search engine indexing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field data-invalid={!!errors.slug}>
            <FieldLabel htmlFor="slug">Product Slug</FieldLabel>
            <Input
              id="slug"
              disabled={isSubmitting}
              {...register("slug", {
                onChange: () => setIsSlugManuallyEdited(true),
              })}
            />
            {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.imageAlt?.en}>
              <FieldLabel htmlFor="imageAlt.en">English Image Alt</FieldLabel>
              <Input
                id="imageAlt.en"
                disabled={isSubmitting}
                {...register("imageAlt.en")}
              />
              {errors.imageAlt?.en && <FieldError>{errors.imageAlt.en.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.imageAlt?.ar}>
              <FieldLabel htmlFor="imageAlt.ar" className="text-right w-full block">Arabic Image Alt (الترجمة للصورة)</FieldLabel>
              <Input
                id="imageAlt.ar"
                dir="rtl"
                className="text-right"
                disabled={isSubmitting}
                {...register("imageAlt.ar")}
              />
              {errors.imageAlt?.ar && <FieldError>{errors.imageAlt.ar.message}</FieldError>}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 6. Status & Controls */}
      <Card>
        <CardContent className="py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Active Status</span>
            <Switch
              checked={watchActive}
              onCheckedChange={(checked) => setValue("active", checked)}
              disabled={isSubmitting}
            />
          </div>

          <div className="w-full md:w-48">
            <Field data-invalid={!!errors.sortOrder}>
              <FieldLabel htmlFor="sortOrder">Sort Order Weight</FieldLabel>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                disabled={isSubmitting}
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
