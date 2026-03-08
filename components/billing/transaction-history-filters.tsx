/**
 * Transaction History Filters Component
 * Filter controls for the transaction history list (used inside FilterDrawer)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { PAYMENT_METHOD_OPTIONS, VISIT_TYPE_OPTIONS } from "@/types/transaction"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"

interface TransactionHistoryFiltersProps {
  paymentMethod: string
  visitType: string
  dateFrom: string
  dateTo: string
  onPaymentMethodChange: (value: string) => void
  onVisitTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function TransactionHistoryFilters({
  paymentMethod,
  visitType,
  dateFrom,
  dateTo,
  onPaymentMethodChange,
  onVisitTypeChange,
  onDateFromChange,
  onDateToChange,
}: TransactionHistoryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Payment Method Filter */}
      <div className="space-y-2">
        <Label>Metode Pembayaran</Label>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih metode pembayaran" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visit Type Filter */}
      <div className="space-y-2">
        <Label>Tipe Kunjungan</Label>
        <Select value={visitType} onValueChange={onVisitTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe kunjungan" />
          </SelectTrigger>
          <SelectContent>
            {VISIT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          label="Dari Tanggal"
          placeholder="Pilih tanggal"
          value={dateFrom ? new Date(dateFrom) : undefined}
          onChange={(date) => onDateFromChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
        <DatePickerField
          label="Sampai Tanggal"
          placeholder="Pilih tanggal"
          value={dateTo ? new Date(dateTo) : undefined}
          onChange={(date) => onDateToChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
      </div>
    </div>
  )
}
