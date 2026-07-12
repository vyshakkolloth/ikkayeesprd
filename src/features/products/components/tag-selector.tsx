"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const SUGGESTED_TAGS = [
  "Trending",
  "Best Seller",
  "Chef Special",
  "Popular",
  "Recommended",
  "New",
  "Limited",
  "Spicy",
  "Healthy",
  "Kids Favorite",
]

interface TagSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export function TagSelector({ value = [], onChange, disabled = false }: TagSelectorProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed || disabled) return
    
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue("")
    setIsOpen(false)
  }

  const handleRemoveTag = (tag: string) => {
    if (disabled) return
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        handleAddTag(inputValue.trim())
      }
    }
  }

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  )

  const showCustomOption =
    inputValue.trim() !== "" &&
    !SUGGESTED_TAGS.some((tag) => tag.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !value.some((tag) => tag.toLowerCase() === inputValue.trim().toLowerCase())

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected Tags list */}
      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1 border rounded-md bg-muted/10 items-center">
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground px-2">No tags selected yet</span>
        ) : (
          value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 text-xs pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                title={`Remove tag ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      {/* Inputs and floating dropdown */}
      <div className="relative">
        <Input
          type="text"
          placeholder={disabled ? "Tags disabled" : "Type to search or add custom tags..."}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Plus className="size-4 animate-pulse" />
        </div>

        {/* Suggestion list */}
        {isOpen && !disabled && (filteredSuggestions.length > 0 || showCustomOption) && (
          <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-lg shadow-md max-h-60 overflow-y-auto">
            <div className="p-1">
              {filteredSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 text-sm rounded-md text-left hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{tag}</span>
                  <Check className="size-3 text-muted-foreground opacity-50" />
                </button>
              ))}

              {showCustomOption && (
                <button
                  type="button"
                  onClick={() => handleAddTag(inputValue)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md text-left font-medium text-primary hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="size-3.5" />
                  Add Custom Tag: <span className="font-bold underline">{inputValue}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Select tags from suggestions or press Enter to add your own custom tags.
      </p>
    </div>
  )
}
