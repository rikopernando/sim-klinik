"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createDrugSchema } from "@/lib/validations/drug"
import {
  DRUG_UNITS,
  MATERIAL_UNITS,
  DRUG_CATEGORIES,
  MATERIAL_CATEGORIES,
} from "@/lib/constants/drug-options"
import { FlaskConical, Pill } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { InventoryItemRecord } from "@/types/drug"

const formSchema = createDrugSchema.extend({ isActive: z.boolean().optional() })

type FormValues = z.infer<typeof formSchema>

interface DrugDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: InventoryItemRecord | null
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function DrugDialog({ open, onOpenChange, item, onSubmit, isSubmitting }: DrugDialogProps) {
  const isEdit = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      genericName: "",
      itemType: "drug",
      category: "",
      unit: "",
      price: 0,
      generalPrice: undefined,
      minimumStock: 10,
      requiresPrescription: true,
      description: "",
      isActive: true,
    },
  })

  const itemType = form.watch("itemType")
  const isDrug = itemType === "drug"

  const handleItemTypeChange = (value: "drug" | "material", onChange: (v: string) => void) => {
    if (value !== form.getValues("itemType")) {
      form.setValue("category", "")
      form.setValue("unit", "")
    }
    onChange(value)
  }

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          genericName: item.genericName ?? "",
          itemType: item.itemType,
          category: item.category ?? "",
          unit: item.unit,
          price: parseFloat(item.price),
          generalPrice: item.generalPrice ? parseFloat(item.generalPrice) : undefined,
          minimumStock: item.minimumStock,
          requiresPrescription: item.requiresPrescription,
          description: item.description ?? "",
          isActive: item.isActive,
        })
      } else {
        form.reset({
          name: "",
          genericName: "",
          itemType: "drug",
          category: "",
          unit: "",
          price: 0,
          generalPrice: undefined,
          minimumStock: 10,
          requiresPrescription: true,
          description: "",
          isActive: true,
        })
      }
    }
  }, [open, item, form])

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0">
        {/* Colored header strip */}
        <div
          className={cn(
            "px-6 pt-6 pb-5 transition-colors",
            isDrug ? "bg-teal-50 dark:bg-teal-950/30" : "bg-amber-50 dark:bg-amber-950/30"
          )}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  isDrug
                    ? "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                )}
              >
                {isDrug ? <Pill className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
              </div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Item" : "Tambah Item Baru"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Type segmented toggle */}
          <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleItemTypeChange("drug", field.onChange)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    field.value === "drug"
                      ? "border-teal-400 bg-white text-teal-700 shadow-sm dark:bg-teal-950/50 dark:text-teal-300"
                      : "text-muted-foreground border-transparent bg-white/50 hover:bg-white/80 dark:bg-white/5"
                  )}
                >
                  <Pill className="h-3.5 w-3.5" />
                  Obat
                </button>
                <button
                  type="button"
                  onClick={() => handleItemTypeChange("material", field.onChange)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    field.value === "material"
                      ? "border-amber-400 bg-white text-amber-700 shadow-sm dark:bg-amber-950/50 dark:text-amber-300"
                      : "text-muted-foreground border-transparent bg-white/50 hover:bg-white/80 dark:bg-white/5"
                  )}
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  Bahan Medis
                </button>
              </div>
            )}
          />
        </div>

        {/* Form body */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-6 py-5">
            {/* Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isDrug ? "cth. Amoxicillin 500mg" : "cth. Kasa Steril"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nama Generik — only for drug */}
            {isDrug && (
              <FormField
                control={form.control}
                name="genericName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Generik{" "}
                      <span className="text-muted-foreground font-normal">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="cth. Amoxicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Kategori & Satuan */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategori <span className="text-muted-foreground font-normal">(opsional)</span>
                    </FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(isDrug ? DRUG_CATEGORIES : MATERIAL_CATEGORIES).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih satuan…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(isDrug ? DRUG_UNITS : MATERIAL_UNITS).map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Harga Resep & Harga Umum */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Resep</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={String(field.value ?? "")}
                        onValueChange={(v) => field.onChange(v ? parseFloat(v) : 0)}
                        placeholder="0"
                        prefix="Rp "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="generalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga Umum{" "}
                      <span className="text-muted-foreground font-normal">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={String(field.value ?? "")}
                        onValueChange={(v) => field.onChange(v ? parseFloat(v) : undefined)}
                        placeholder="—"
                        prefix="Rp "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Min Stok & Butuh Resep */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="minimumStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stok</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresPrescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Butuh Resep</FormLabel>
                    <div className="flex h-9 items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          field.value ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"
                        )}
                      >
                        {field.value ? "Ya" : "Tidak"}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deskripsi */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan atau keterangan tambahan…"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status — only on edit */}
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      field.value
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-dashed"
                    )}
                  >
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{field.value ? "Aktif" : "Nonaktif"}</p>
                      <p className="text-muted-foreground text-xs">
                        {field.value
                          ? "Item tersedia untuk digunakan dalam resep"
                          : "Item tidak akan muncul dalam pilihan resep"}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  isDrug
                    ? "bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
                    : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                )}
              >
                {isSubmitting ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
