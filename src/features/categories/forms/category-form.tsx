"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "../components/image-upload"

// Define a Zod schema for flat form fields to make React Hook Form validation easy and clean
const categoryFormSchema = z.object({
  nameEn: z.string().min(2, "English name must be at least 2 characters").max(100, "English name must be under 100 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters").max(100, "Arabic name must be under 100 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  image: z.string().min(1, "Category image is required"),
  altEn: z.string().min(1, "English alt text is required"),
  altAr: z.string().min(1, "Arabic alt text is required"),
  descriptionEn: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  isActive: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  initialData?: {
    _id?: string
    name: { en: string; ar: string }
    slug: string
    image: string
    alt: { en: string; ar: string }
    description?: { en: string; ar: string }
    priority: number
    isActive: boolean
  }
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

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

export function CategoryForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Category",
}: CategoryFormProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false)

  // Custom lightweight Zod Resolver to run validation inside React Hook Form
  const customResolver = React.useCallback(async (values: CategoryFormValues) => {
    const result = categoryFormSchema.safeParse(values)

    if (result.success) {
      return { values: result.data, errors: {} }
    }

    const errors: any = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path[0]
      errors[path] = {
        type: issue.code,
        message: issue.message,
      }
    })

    return { values: {}, errors }
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: customResolver as any,
    defaultValues: {
      nameEn: initialData?.name.en || "",
      nameAr: initialData?.name.ar || "",
      slug: initialData?.slug || "",
      image: initialData?.image || "",
      altEn: initialData?.alt.en || "",
      altAr: initialData?.alt.ar || "",
      descriptionEn: initialData?.description?.en || "",
      descriptionAr: initialData?.description?.ar || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const nameEn = watch("nameEn")
  const image = watch("image")
  const isActive = watch("isActive")

  // Auto-slugify English name if not manually modified
  React.useEffect(() => {
    if (!isSlugManuallyEdited && !initialData) {
      setValue("slug", slugify(nameEn || ""), { shouldValidate: true })
    }
  }, [nameEn, isSlugManuallyEdited, setValue, initialData])

  const onSubmitHandler = async (data: CategoryFormValues) => {
    const structuredData = {
      name: { en: data.nameEn.trim(), ar: data.nameAr.trim() },
      slug: data.slug.trim(),
      image: data.image,
      alt: { en: data.altEn.trim(), ar: data.altAr.trim() },
      description: { en: data.descriptionEn?.trim() || "", ar: data.descriptionAr?.trim() || "" },
      isActive: data.isActive,
      ...(initialData?.priority !== undefined ? { priority: initialData.priority } : {}),
    }
    await onSubmit(structuredData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <FieldGroup className="space-y-4">
        {/* Category Image */}
        <Field data-invalid={!!errors.image}>
          <FieldLabel htmlFor="image" className="font-semibold text-sm">Category Image</FieldLabel>
          <ImageUpload
            value={image}
            onChange={(url) => setValue("image", url, { shouldValidate: true })}
            disabled={isSubmitting}
          />
          {errors.image && <FieldError>{errors.image.message}</FieldError>}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Name */}
          <Field data-invalid={!!errors.nameEn}>
            <FieldLabel htmlFor="nameEn">English Name</FieldLabel>
            <Input
              id="nameEn"
              type="text"
              placeholder="e.g. Desserts"
              disabled={isSubmitting}
              {...register("nameEn")}
            />
            {errors.nameEn && <FieldError>{errors.nameEn.message}</FieldError>}
          </Field>

          {/* Arabic Name (RTL) */}
          <Field data-invalid={!!errors.nameAr}>
            <FieldLabel htmlFor="nameAr" className="text-right w-full block">Arabic Name (الاسم بالكامل)</FieldLabel>
            <Input
              id="nameAr"
              type="text"
              placeholder="مثال: الحلويات"
              dir="rtl"
              disabled={isSubmitting}
              className="text-right"
              {...register("nameAr")}
            />
            {errors.nameAr && <FieldError>{errors.nameAr.message}</FieldError>}
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Description */}
          <Field data-invalid={!!errors.descriptionEn}>
            <FieldLabel htmlFor="descriptionEn">English Description</FieldLabel>
            <textarea
              id="descriptionEn"
              placeholder="e.g. Delicious sweet treats and desserts"
              disabled={isSubmitting}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              {...register("descriptionEn")}
            />
            {errors.descriptionEn && <FieldError>{errors.descriptionEn.message}</FieldError>}
          </Field>

          {/* Arabic Description */}
          <Field data-invalid={!!errors.descriptionAr}>
            <FieldLabel htmlFor="descriptionAr" className="text-right w-full block">Arabic Description (وصف القسم)</FieldLabel>
            <textarea
              id="descriptionAr"
              placeholder="مثال: حلويات وحلوى لذيذة"
              dir="rtl"
              disabled={isSubmitting}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
              rows={2}
              {...register("descriptionAr")}
            />
            {errors.descriptionAr && <FieldError>{errors.descriptionAr.message}</FieldError>}
          </Field>
        </div>

        {/* Slug */}
        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            type="text"
            placeholder="e.g. desserts"
            disabled={isSubmitting}
            {...register("slug", {
              onChange: () => setIsSlugManuallyEdited(true),
            })}
          />
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
          <FieldDescription>
            URL identifier. Must contain only lowercase letters, numbers, and hyphens.
          </FieldDescription>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Alt */}
          <Field data-invalid={!!errors.altEn}>
            <FieldLabel htmlFor="altEn">English Image Alt Text</FieldLabel>
            <Input
              id="altEn"
              type="text"
              placeholder="e.g. Bowl of chocolate mousse"
              disabled={isSubmitting}
              {...register("altEn")}
            />
            {errors.altEn && <FieldError>{errors.altEn.message}</FieldError>}
          </Field>

          {/* Arabic Alt */}
          <Field data-invalid={!!errors.altAr}>
            <FieldLabel htmlFor="altAr" className="text-right w-full block">Arabic Image Alt Text (وصف الصورة)</FieldLabel>
            <Input
              id="altAr"
              type="text"
              placeholder="مثال: وعاء من موس الشوكولاتة"
              dir="rtl"
              disabled={isSubmitting}
              className="text-right"
              {...register("altAr")}
            />
            {errors.altAr && <FieldError>{errors.altAr.message}</FieldError>}
          </Field>
        </div>

        <div className="border p-4 rounded-lg bg-muted/20">
          {/* Active switch */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Active Status</span>
              <span className="text-xs text-muted-foreground">Toggle visibility in the customer menu</span>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin mr-2" />
              Saving changes...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
