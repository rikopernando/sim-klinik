/**
 * Lab Test Panel Card Component
 * Displays a test panel with included tests and selection functionality
 */

"use client"

import { useState } from "react"
import { IconChevronDown, IconChevronUp, IconCheck } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/billing"
import type { LabTestPanelWithTests } from "@/types/lab"
import { cn } from "@/lib/utils"

interface LabPanelCardProps {
  panel: LabTestPanelWithTests
  selected?: boolean
  onSelect?: (panel: LabTestPanelWithTests) => void
  disabled?: boolean
}

export function LabPanelCard({
  panel,
  selected = false,
  onSelect,
  disabled = false,
}: LabPanelCardProps) {
  const [expanded, setExpanded] = useState(false)

  const testCount = panel.tests.length
  const regularPrice = panel.tests.reduce((sum, test) => sum + parseFloat(test.price), 0)
  const panelPrice = parseFloat(panel.price)
  const discount = regularPrice - panelPrice
  const discountPercentage = ((discount / regularPrice) * 100).toFixed(0)

  return (
    <Card
      className={cn(
        "hover:border-primary/50 cursor-pointer transition-all",
        selected && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !disabled && onSelect?.(panel)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <CardTitle className="text-base">{panel.name}</CardTitle>
              {selected && (
                <Badge variant="default" className="bg-primary">
                  <IconCheck className="mr-1 h-3 w-3" />
                  Dipilih
                </Badge>
              )}
            </div>
            {panel.description && (
              <CardDescription className="text-xs">{panel.description}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Price and Savings */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-primary text-lg font-bold">{formatCurrency(panelPrice)}</span>
              {discount > 0 && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(regularPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-xs text-green-600">
                Hemat {formatCurrency(discount)} ({discountPercentage}%)
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {testCount} Test
          </Badge>
        </div>

        {/* Expanded Test List */}
        {expanded && (
          <div className="border-muted bg-muted/30 mt-3 space-y-1 rounded-md border p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium">Termasuk pemeriksaan:</p>
            <ul className="space-y-1">
              {panel.tests.map((test) => (
                <li key={test.id} className="flex items-start justify-between gap-2 text-xs">
                  <span className="flex-1">
                    • {test.name}
                    {test.requiresFasting && <span className="text-orange-600"> (Puasa)</span>}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(parseFloat(test.price))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
