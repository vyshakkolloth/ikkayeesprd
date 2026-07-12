"use client"

import * as React from "react"
import { UploadCloudIcon, XIcon, ImageIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback(
    (file: File) => {
      setError(null)

      // 1. Validation
      if (!file.type.startsWith("image/")) {
        setError("Only image files (JPEG, PNG, SVG, WebP) are allowed")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be under 5MB")
        return
      }

      // 2. Simulate Upload (Convert to Base64)
      setIsUploading(true)
      const reader = new FileReader()

      reader.onload = () => {
        // Simulate a 800ms network latency
        setTimeout(() => {
          if (typeof reader.result === "string") {
            onChange(reader.result)
          }
          setIsUploading(false)
        }, 800)
      }

      reader.onerror = () => {
        setError("Failed to read file. Please try again.")
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const onDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (disabled || isUploading) return
      setIsDragActive(true)
    },
    [disabled, isUploading]
  )

  const onDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const onDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragActive(false)
      if (disabled || isUploading) return

      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [disabled, isUploading, handleFile]
  )

  const onFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const triggerSelect = React.useCallback(() => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }, [disabled, isUploading])

  const onRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [onChange]
  )

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={value ? undefined : triggerSelect}
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 min-h-[160px] transition-all duration-200 select-none",
          value ? "border-solid border-muted bg-muted/10" : "border-muted-foreground/35 bg-background/50 hover:bg-muted/10 cursor-pointer",
          isDragActive && "border-primary bg-primary/5",
          (disabled || isUploading) && "opacity-50 pointer-events-none"
        )}
      >
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg z-10 gap-2">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Uploading image...</span>
          </div>
        )}

        {value ? (
          <div className="relative w-full flex flex-col items-center gap-4">
            <div className="relative w-36 h-36 rounded-md overflow-hidden border bg-background flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 transition-colors"
                title="Remove image"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerSelect}
                disabled={disabled || isUploading}
              >
                Replace Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={onRemove}
                disabled={disabled || isUploading}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-muted rounded-full text-muted-foreground">
              <UploadCloudIcon className="size-6" />
            </div>
            <div className="text-sm font-medium">
              Drag & drop your image here, or <span className="text-primary hover:underline font-semibold">browse</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Supports JPEG, PNG, SVG, WebP (Max 5MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  )
}
