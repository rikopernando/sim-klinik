/**
 * Autocomplete Utilities
 * Shared utilities for autocomplete functionality
 */

import { Suggestion } from "@/components/ui/autocomplete-textarea"

/**
 * Constants
 */
export const AUTOCOMPLETE_CONSTANTS = {
  BLUR_DELAY_MS: 200,
  MIN_SEARCH_LENGTH: 0,
} as const

/**
 * Extract current line from text at cursor position
 */
export function getCurrentLine(value: string, cursorPos: number): string {
  const textBeforeCursor = value.substring(0, cursorPos)
  return textBeforeCursor.split("\n").pop() || ""
}

/**
 * Filter suggestions based on search term using fuzzy word matching
 * Searches across label, value, and category fields
 */
export function filterSuggestions(suggestions: Suggestion[], searchTerm: string): Suggestion[] {
  if (searchTerm.trim().length === 0) {
    return []
  }

  const searchWords = searchTerm.trim().toLowerCase().split(/\s+/)

  return suggestions.filter((suggestion) => {
    const labelLower = suggestion.label.toLowerCase()
    const valueLower = suggestion.value.toLowerCase()
    const categoryLower = suggestion.category?.toLowerCase() || ""

    // Check if any search word matches in label, value, or category
    return searchWords.some(
      (word) =>
        labelLower.includes(word) || valueLower.includes(word) || categoryLower.includes(word)
    )
  })
}

/**
 * Build new text value with suggestion inserted at current line
 */
export function insertSuggestionAtLine(
  value: string,
  cursorPosition: number,
  suggestionValue: string
): { newValue: string; newCursorPos: number } {
  const textBeforeCursor = value.substring(0, cursorPosition)
  const textAfterCursor = value.substring(cursorPosition)

  // Get current line to replace
  const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
  const beforeCurrentLine = value.substring(0, currentLineStart)

  // Build new value
  const newValue = beforeCurrentLine + suggestionValue + textAfterCursor
  const newCursorPos = currentLineStart + suggestionValue.length

  return { newValue, newCursorPos }
}
