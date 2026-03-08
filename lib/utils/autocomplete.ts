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
 * Extract current search term in multi-value mode
 * Gets text after the last delimiter for autocomplete filtering
 */
export function getCurrentSearchTerm(
  value: string,
  cursorPos: number,
  delimiter: string = ", "
): string {
  const currentLine = getCurrentLine(value, cursorPos)

  // Find the last delimiter position
  const lastDelimiterIndex = Math.max(
    currentLine.lastIndexOf(delimiter.trim()),
    currentLine.lastIndexOf(",")
  )

  // Get text after last delimiter (or entire line if no delimiter)
  const searchTerm =
    lastDelimiterIndex === -1 ? currentLine : currentLine.substring(lastDelimiterIndex + 1)

  return searchTerm.trim()
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

/**
 * Build new text value with suggestion appended (multi-value mode)
 * Appends suggestion with delimiter, allowing multiple values on the same line
 */
export function insertSuggestionMultiValue(
  value: string,
  cursorPosition: number,
  suggestionValue: string,
  delimiter: string = ", "
): { newValue: string; newCursorPos: number } {
  const textBeforeCursor = value.substring(0, cursorPosition)

  // Get current line
  const lines = textBeforeCursor.split("\n")
  const currentLine = lines[lines.length - 1]

  // Find the start of the current search term
  // Look for delimiter or start of line
  const lastDelimiterIndex = Math.max(
    currentLine.lastIndexOf(delimiter.trim()),
    currentLine.lastIndexOf(","),
    -1
  )

  // Calculate where to insert (after the last delimiter or at the start of the line)
  const insertStartPos = lastDelimiterIndex === -1 ? 0 : lastDelimiterIndex + 1
  const currentLineStartInText = textBeforeCursor.lastIndexOf("\n") + 1
  const absoluteInsertPos = currentLineStartInText + insertStartPos

  // Get text before insertion point and after cursor
  const beforeInsert = value.substring(0, absoluteInsertPos)
  const afterCursor = value.substring(cursorPosition)

  // Trim any whitespace at insertion point
  const trimmedBeforeInsert = beforeInsert.trimEnd()

  // Determine if we need to add delimiter before the new value
  const needsDelimiterBefore =
    trimmedBeforeInsert.length > 0 &&
    !trimmedBeforeInsert.endsWith(delimiter.trim()) &&
    !trimmedBeforeInsert.endsWith(",") &&
    trimmedBeforeInsert.split("\n").pop()!.trim().length > 0

  // Build the insertion text
  const insertionText = needsDelimiterBefore
    ? `${delimiter}${suggestionValue}${delimiter}`
    : `${suggestionValue}${delimiter}`

  // Build new value
  const newValue = trimmedBeforeInsert + insertionText + afterCursor
  const newCursorPos = trimmedBeforeInsert.length + insertionText.length

  return { newValue, newCursorPos }
}
