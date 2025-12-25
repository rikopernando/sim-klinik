/**
 * CPPT Timeline Component
 * Visual timeline representation of CPPT entries
 */

"use client"

import { useState, useMemo } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  IconStethoscope,
  IconUser,
  IconClock,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CPPT } from "@/types/inpatient"

interface CPPTTimelineProps {
  entries: CPPT[]
}

type DateRange = "24h" | "3d" | "7d" | "all"

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "24 Jam" },
  { value: "3d", label: "3 Hari" },
  { value: "7d", label: "7 Hari" },
  { value: "all", label: "Semua" },
]

export function CPPTTimeline({ entries }: CPPTTimelineProps) {
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Filter entries by date range
  const filteredEntries = useMemo(() => {
    const now = new Date()
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (dateRange === "all") {
      return sortedEntries
    }

    const rangeMs = {
      "24h": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    }[dateRange]

    const cutoffTime = now.getTime() - rangeMs
    return sortedEntries.filter((entry) => new Date(entry.createdAt).getTime() >= cutoffTime)
  }, [entries, dateRange])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="h-5 w-5" />
            Timeline CPPT
          </CardTitle>
          <CardDescription>Belum ada catatan CPPT tercatat</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              Timeline CPPT
            </CardTitle>
            <CardDescription>
              Riwayat catatan perkembangan pasien ({filteredEntries.length} entri)
            </CardDescription>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2 pt-4">
          {DATE_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Tidak ada data CPPT dalam rentang waktu ini
          </div>
        ) : (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {filteredEntries.map((entry, index) => {
                const isDoctor = entry.authorRole === "doctor"
                const hasSOAP =
                  entry.subjective || entry.objective || entry.assessment || entry.plan
                const isExpanded = expandedIds.has(entry.id)

                return (
                  <div key={entry.id} className="relative pl-14">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-4 top-2 w-5 h-5 rounded-full border-4 border-background ${
                        isDoctor ? "bg-blue-500" : "bg-green-500"
                      }`}
                    />

                    <div
                      className={`rounded-lg border p-4 ${
                        isDoctor
                          ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isDoctor ? (
                            <IconStethoscope className="h-5 w-5 text-blue-600" />
                          ) : (
                            <IconUser className="h-5 w-5 text-green-600" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">
                                {entry.authorName || "Unknown User"}
                              </p>
                              <Badge variant={isDoctor ? "default" : "secondary"} className="text-xs">
                                {isDoctor ? "Dokter" : "Perawat"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <IconClock className="h-3 w-3" />
                              <span>
                                {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", {
                                  locale: localeId,
                                })}
                              </span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(entry.createdAt), {
                                  addSuffix: true,
                                  locale: localeId,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {hasSOAP && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(entry.id)}
                          >
                            {isExpanded ? (
                              <IconChevronUp className="h-4 w-4" />
                            ) : (
                              <IconChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* SOAP (expandable) */}
                      {hasSOAP && isExpanded && (
                        <div className="space-y-2 mb-3 pb-3 border-b">
                          {entry.subjective && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">S - Subjective</p>
                              <p className="text-xs text-muted-foreground">{entry.subjective}</p>
                            </div>
                          )}
                          {entry.objective && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">O - Objective</p>
                              <p className="text-xs text-muted-foreground">{entry.objective}</p>
                            </div>
                          )}
                          {entry.assessment && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">A - Assessment</p>
                              <p className="text-xs text-muted-foreground">{entry.assessment}</p>
                            </div>
                          )}
                          {entry.plan && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">P - Plan</p>
                              <p className="text-xs text-muted-foreground">{entry.plan}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress Note */}
                      <div>
                        <p className="text-xs font-semibold mb-1">Catatan Perkembangan</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {entry.progressNote}
                        </p>
                      </div>

                      {/* Instructions */}
                      {entry.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold mb-1">Instruksi Khusus</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {entry.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
