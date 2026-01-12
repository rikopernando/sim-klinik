"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { SuggestionItem } from "@/components/ui/suggestion-item"
import { useAutocomplete } from "@/hooks/use-autocomplete"
import {
  insertSuggestionAtLine,
  insertSuggestionMultiValue,
  AUTOCOMPLETE_CONSTANTS,
} from "@/lib/utils/autocomplete"

export interface Suggestion {
  value: string
  label: string
  category?: string
}

interface AutocompleteTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  suggestions?: Suggestion[]
  onSuggestionSelect?: (suggestion: Suggestion) => void
  /**
   * Enable multi-value mode - allows multiple values separated by delimiter
   * @default false
   */
  multiValue?: boolean
  /**
   * Delimiter to use when separating multiple values
   * @default ", "
   */
  delimiter?: string
}

export const AutocompleteTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutocompleteTextareaProps
>(
  (
    {
      className,
      suggestions = [],
      onSuggestionSelect,
      multiValue = false,
      delimiter = ", ",
      onChange,
      onFocus,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = React.useRef<HTMLDivElement>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Use custom autocomplete hook
    const {
      showSuggestions,
      filteredSuggestions,
      selectedIndex,
      cursorPosition,
      setShowSuggestions,
      setSelectedIndex,
      updateSuggestions,
      selectSuggestion,
      navigateDown,
      navigateUp,
    } = useAutocomplete({ suggestions, onSuggestionSelect, multiValue, delimiter })

    // Handle input change
    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        const cursorPos = e.target.selectionStart || 0

        updateSuggestions(value, cursorPos)

        // Call parent's onChange
        if (onChange) {
          onChange(e)
        }
      },
      [onChange, updateSuggestions]
    )

    // Insert suggestion into textarea
    const insertSuggestion = React.useCallback(
      (suggestion: Suggestion) => {
        if (!textareaRef.current) return

        const value = textareaRef.current.value

        // Use appropriate insertion method based on multiValue prop
        const { newValue, newCursorPos } = multiValue
          ? insertSuggestionMultiValue(value, cursorPosition, suggestion.value, delimiter)
          : insertSuggestionAtLine(value, cursorPosition, suggestion.value)

        // Update textarea
        textareaRef.current.value = newValue
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)

        // Create synthetic event for React
        const syntheticEvent = {
          target: textareaRef.current,
          currentTarget: textareaRef.current,
        } as React.ChangeEvent<HTMLTextAreaElement>

        // Call parent's onChange to update state
        if (onChange) {
          onChange(syntheticEvent)
        }

        // Call selection callback
        selectSuggestion(suggestion)
        textareaRef.current.focus()
      },
      [cursorPosition, onChange, selectSuggestion, multiValue, delimiter]
    )

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) {
          if (onKeyDown) {
            onKeyDown(e)
          }
          return
        }

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault()
            navigateDown()
            break
          case "ArrowUp":
            e.preventDefault()
            navigateUp()
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
            if (onKeyDown) {
              onKeyDown(e)
            }
        }
      },
      [
        showSuggestions,
        filteredSuggestions,
        selectedIndex,
        onKeyDown,
        navigateDown,
        navigateUp,
        insertSuggestion,
        setShowSuggestions,
      ]
    )

    // Handle focus
    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        const cursorPos = e.target.selectionStart || 0

        updateSuggestions(value, cursorPos)

        // Call parent's onFocus
        if (onFocus) {
          onFocus(e)
        }
      },
      [onFocus, updateSuggestions]
    )

    // Handle blur with delay to allow click on suggestion
    const handleBlur = React.useCallback(() => {
      setTimeout(() => setShowSuggestions(false), AUTOCOMPLETE_CONSTANTS.BLUR_DELAY_MS)
    }, [setShowSuggestions])

    // Scroll selected item into view
    React.useEffect(() => {
      if (suggestionsRef.current && showSuggestions) {
        const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement | null
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: "nearest" })
        }
      }
    }, [selectedIndex, showSuggestions])

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          className={className}
          {...props}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <SuggestionItem
                key={`${suggestion.value}-${index}`}
                suggestion={suggestion}
                isSelected={index === selectedIndex}
                onClick={() => insertSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              />
            ))}
            <div className="text-muted-foreground mt-1 border-t px-2 py-1 pt-1 text-xs">
              ↑↓ Navigate • Enter/Tab Select • Esc Close
            </div>
          </div>
        )}
      </div>
    )
  }
)

AutocompleteTextarea.displayName = "AutocompleteTextarea"
