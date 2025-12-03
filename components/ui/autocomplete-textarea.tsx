"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface Suggestion {
  value: string
  label: string
  category?: string
}

interface AutocompleteTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  suggestions?: Suggestion[]
  onSuggestionSelect?: (suggestion: Suggestion) => void
}

export const AutocompleteTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutocompleteTextareaProps
>(({ className, suggestions = [], onSuggestionSelect, ...props }, ref) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<Suggestion[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = React.useRef<HTMLDivElement>(null)

  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current!)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)

    // Get the current line
    const textBeforeCursor = value.substring(0, cursorPos)
    const currentLine = textBeforeCursor.split("\n").pop() || ""

    // Filter suggestions based on current line
    if (currentLine.trim().length > 0) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.label.toLowerCase().includes(currentLine.trim().toLowerCase()) ||
          suggestion.value.toLowerCase().includes(currentLine.trim().toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
    }

    // Call original onChange
    if (props.onChange) {
      props.onChange(e)
    }
  }

  const insertSuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current) return

    const value = textareaRef.current.value
    const textBeforeCursor = value.substring(0, cursorPosition)
    const textAfterCursor = value.substring(cursorPosition)

    // Get current line to replace
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
    const beforeCurrentLine = value.substring(0, currentLineStart)

    // Build new value
    const newValue = beforeCurrentLine + suggestion.value + textAfterCursor

    // Update textarea
    textareaRef.current.value = newValue
    const newCursorPos = currentLineStart + suggestion.value.length
    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)

    // Trigger change event
    const event = new Event("input", { bubbles: true })
    textareaRef.current.dispatchEvent(event)

    // Call callback
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }

    setShowSuggestions(false)
    textareaRef.current.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (props.onKeyDown) {
        props.onKeyDown(e)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
      case "Tab":
        e.preventDefault()
        if (filteredSuggestions[selectedIndex]) {
          insertSuggestion(filteredSuggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowSuggestions(false)
        break
      default:
        if (props.onKeyDown) {
          props.onKeyDown(e)
        }
    }
  }

  // Scroll selected item into view
  React.useEffect(() => {
    if (suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        className={className}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Delay hiding to allow click on suggestion
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        onFocus={(e) => {
          // Show suggestions if there's text
          const value = e.target.value
          const cursorPos = e.target.selectionStart || 0
          const textBeforeCursor = value.substring(0, cursorPos)
          const currentLine = textBeforeCursor.split("\n").pop() || ""

          if (currentLine.trim().length > 0) {
            const filtered = suggestions.filter(
              (suggestion) =>
                suggestion.label.toLowerCase().includes(currentLine.trim().toLowerCase()) ||
                suggestion.value.toLowerCase().includes(currentLine.trim().toLowerCase())
            )
            if (filtered.length > 0) {
              setFilteredSuggestions(filtered)
              setShowSuggestions(true)
            }
          }

          if (props.onFocus) {
            props.onFocus(e)
          }
        }}
        {...props}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                "relative flex cursor-pointer items-start rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
                index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              )}
              onClick={() => insertSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-1">
                <div className="font-medium">{suggestion.label}</div>
                {suggestion.category && (
                  <div className="text-muted-foreground text-xs">{suggestion.category}</div>
                )}
              </div>
            </div>
          ))}
          <div className="text-muted-foreground mt-1 border-t px-2 py-1 pt-1 text-xs">
            ↑↓ Navigate • Enter/Tab Select • Esc Close
          </div>
        </div>
      )}
    </div>
  )
})

AutocompleteTextarea.displayName = "AutocompleteTextarea"
