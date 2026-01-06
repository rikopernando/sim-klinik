/**
 * Autocomplete Hook
 * Custom hook for managing autocomplete state and logic
 */

import { useState, useMemo, useCallback } from "react"
import { Suggestion } from "@/components/ui/autocomplete-textarea"
import {
  filterSuggestions,
  getCurrentLine,
  getCurrentSearchTerm,
} from "@/lib/utils/autocomplete"

interface UseAutocompleteOptions {
  suggestions: Suggestion[]
  onSuggestionSelect?: (suggestion: Suggestion) => void
  multiValue?: boolean
  delimiter?: string
}

interface UseAutocompleteReturn {
  // State
  showSuggestions: boolean
  filteredSuggestions: Suggestion[]
  selectedIndex: number
  cursorPosition: number

  // Actions
  setShowSuggestions: (show: boolean) => void
  setSelectedIndex: (index: number | ((prev: number) => number)) => void
  setCursorPosition: (position: number) => void
  updateSuggestions: (value: string, cursorPos: number) => void
  selectSuggestion: (suggestion: Suggestion) => void
  navigateDown: () => void
  navigateUp: () => void
  reset: () => void
}

export function useAutocomplete({
  suggestions,
  onSuggestionSelect,
  multiValue = false,
  delimiter = ", ",
}: UseAutocompleteOptions): UseAutocompleteReturn {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [currentSearchTerm, setCurrentSearchTerm] = useState("")

  // Memoize filtered suggestions to avoid re-filtering on every render
  const filteredSuggestions = useMemo(() => {
    return filterSuggestions(suggestions, currentSearchTerm)
  }, [suggestions, currentSearchTerm])

  // Update suggestions based on current input
  const updateSuggestions = useCallback(
    (value: string, cursorPos: number) => {
      setCursorPosition(cursorPos)

      // In multi-value mode, only get text after last delimiter
      // In single-value mode, get the entire current line
      const searchTerm = multiValue
        ? getCurrentSearchTerm(value, cursorPos, delimiter)
        : getCurrentLine(value, cursorPos)

      setCurrentSearchTerm(searchTerm)

      if (searchTerm.trim().length > 0) {
        const filtered = filterSuggestions(suggestions, searchTerm)
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(0)
      } else {
        setShowSuggestions(false)
      }
    },
    [suggestions, multiValue, delimiter]
  )

  // Select a suggestion
  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion)
      }
      setShowSuggestions(false)
    },
    [onSuggestionSelect]
  )

  // Navigation handlers
  const navigateDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
  }, [filteredSuggestions.length])

  const navigateUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setShowSuggestions(false)
    setSelectedIndex(0)
    setCurrentSearchTerm("")
  }, [])

  return {
    // State
    showSuggestions,
    filteredSuggestions,
    selectedIndex,
    cursorPosition,

    // Actions
    setShowSuggestions,
    setSelectedIndex,
    setCursorPosition,
    updateSuggestions,
    selectSuggestion,
    navigateDown,
    navigateUp,
    reset,
  }
}
