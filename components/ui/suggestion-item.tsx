/**
 * Suggestion Item Component
 * Displays a single autocomplete suggestion
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Suggestion } from "./autocomplete-textarea"

interface SuggestionItemProps {
  suggestion: Suggestion
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

export const SuggestionItem = React.memo(
  ({ suggestion, isSelected, onClick, onMouseEnter }: SuggestionItemProps) => {
    return (
      <div
        className={cn(
          "relative flex cursor-pointer items-start rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <div className="flex-1">
          <div className="font-medium">{suggestion.label}</div>
          {suggestion.category && (
            <div className="text-muted-foreground text-xs">{suggestion.category}</div>
          )}
        </div>
      </div>
    )
  }
)

SuggestionItem.displayName = "SuggestionItem"
