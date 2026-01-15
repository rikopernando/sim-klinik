/**
 * Lab Result Display Components
 * Modular, type-safe result rendering for different result types
 */

import { Badge } from "@/components/ui/badge"
import type { ResultData } from "@/lib/lab"
import { toTitleCaseMap } from "@/lib/utils/string"
import type {
  NumericResultData,
  MultiParameterResultData,
  DescriptiveResultData,
} from "@/types/lab"

// ============================================================================
// TYPE GUARDS (using simple runtime checks, not strict type predicates)
// ============================================================================

export function isNumericResult(data: ResultData): boolean {
  return "value" in data && "unit" in data && "referenceRange" in data
}

export function isMultiParameterResult(data: ResultData): boolean {
  return "parameters" in data && Array.isArray((data as Record<string, unknown>).parameters)
}

export function isDescriptiveResult(data: ResultData): boolean {
  return "findings" in data && !("impression" in data)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFlagLabel(flag: string): string {
  switch (flag) {
    case "critical_high":
      return "Kritis Tinggi"
    case "critical_low":
      return "Kritis Rendah"
    case "high":
      return "Tinggi"
    case "low":
      return "Rendah"
    default:
      return "Normal"
  }
}

function isCriticalFlag(flag: string): boolean {
  return flag === "critical_high" || flag === "critical_low"
}

function isAbnormalFlag(flag: string): boolean {
  return flag === "high" || flag === "low" || isCriticalFlag(flag)
}

// ============================================================================
// RESULT DISPLAY COMPONENTS
// ============================================================================

interface MultiParameterResultDisplayProps {
  data: MultiParameterResultData
}

export function MultiParameterResultDisplay({ data }: MultiParameterResultDisplayProps) {
  if (!data.parameters || data.parameters.length === 0) {
    return <p className="text-sm">Tidak ada parameter hasil</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">Parameter Pemeriksaan</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.parameters.map((param, index) => {
          const isAbnormal = isAbnormalFlag(param.flag)
          const isCritical = isCriticalFlag(param.flag)
          const hasReferenceRange = param.referenceRange.min > 0 || param.referenceRange.max > 0

          return (
            <div
              key={index}
              className={`col-span-1 rounded-lg border p-4 ${
                isCritical
                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  : isAbnormal
                    ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                    : "bg-blue-50 dark:bg-blue-950"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{param.name}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {param.value}
                    <span className="text-muted-foreground ml-2 text-base font-normal">
                      {param.unit}
                    </span>
                  </p>
                  {(hasReferenceRange || param.referenceValue) && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Rujukan:{" "}
                      {hasReferenceRange
                        ? `${param.referenceRange.min} - ${param.referenceRange.max} ${param.unit}`
                        : param.referenceValue}
                    </p>
                  )}
                </div>
                {isAbnormal && (
                  <Badge
                    variant={isCritical ? "destructive" : "default"}
                    className={isCritical ? "" : "bg-orange-500 hover:bg-orange-600"}
                  >
                    {getFlagLabel(param.flag)}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface NumericResultDisplayProps {
  data: NumericResultData
}

export function NumericResultDisplay({ data }: NumericResultDisplayProps) {
  const isAbnormal = data.flag && data.flag !== "normal"
  const isCritical = data.flag && isCriticalFlag(data.flag)

  return (
    <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Nilai Hasil</p>
        <p className="text-2xl font-bold">
          {data.value}
          <span className="text-muted-foreground ml-2 text-base font-normal">{data.unit}</span>
        </p>
        {isAbnormal && (
          <Badge
            variant={isCritical ? "destructive" : "default"}
            className={isCritical ? "" : "bg-orange-500"}
          >
            {getFlagLabel(data.flag)}
          </Badge>
        )}
        {data.referenceRange && (
          <p className="text-muted-foreground text-xs">
            Rujukan: {data.referenceRange.min} - {data.referenceRange.max} {data.unit}
          </p>
        )}
      </div>
    </div>
  )
}

interface DescriptiveResultDisplayProps {
  data: DescriptiveResultData
}

export function DescriptiveResultDisplay({ data }: DescriptiveResultDisplayProps) {
  return (
    <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.keys(data).map((key, index) => (
          <div className="col-span-1" key={`${key}-${index}`}>
            <p className="text-muted-foreground mb-1 text-xs">{toTitleCaseMap(key, "_")}</p>
            <p className="text-sm">{data[key]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN RESULT DISPLAY ROUTER
// ============================================================================

interface ResultDisplayProps {
  resultData: ResultData
}

export function ResultDisplay({ resultData }: ResultDisplayProps) {
  if (isMultiParameterResult(resultData)) {
    return <MultiParameterResultDisplay data={resultData as MultiParameterResultData} />
  }

  if (isNumericResult(resultData)) {
    return <NumericResultDisplay data={resultData as NumericResultData} />
  }

  return <DescriptiveResultDisplay data={resultData as DescriptiveResultData} />
}
