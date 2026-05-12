"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createLabTestSchema } from "@/lib/validations/lab-test"
import { LAB_CATEGORIES, RAD_CATEGORIES, LAB_SPECIMENS } from "@/lib/constants/lab-test-options"
import { FlaskConical, Radiation } from "lucide-react"
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
import type { LabTestRecord } from "@/types/lab-test"

// Form requires tatHours and requiresFasting (UI always provides them); extend shared schema
const formSchema = createLabTestSchema.extend({
  tatHours: z.number().int().min(1),
  requiresFasting: z.boolean(),
  isActive: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LabTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LabTestRecord | null
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function LabTestDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting,
}: LabTestDialogProps) {
  const isEdit = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      department: "LAB",
      price: 0,
      specimenType: "",
      tatHours: 24,
      requiresFasting: false,
      description: "",
      instructions: "",
      isActive: true,
    },
  })

  const department = form.watch("department")
  const isLab = department === "LAB"

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          code: item.code,
          name: item.name,
          category: item.category,
          department: (item.department as "LAB" | "RAD") ?? "LAB",
          price: parseFloat(item.price),
          specimenType: item.specimenType ?? "",
          tatHours: item.tatHours ?? 24,
          requiresFasting: item.requiresFasting,
          description: item.description ?? "",
          instructions: item.instructions ?? "",
          isActive: item.isActive,
        })
      } else {
        form.reset({
          code: "",
          name: "",
          category: "",
          department: "LAB",
          price: 0,
          specimenType: "",
          tatHours: 24,
          requiresFasting: false,
          description: "",
          instructions: "",
          isActive: true,
        })
      }
    }
  }, [open, item, form])

  const handleDepartmentChange = (value: "LAB" | "RAD", onChange: (v: string) => void) => {
    if (value !== form.getValues("department")) {
      form.setValue("category", "")
      form.setValue("specimenType", "")
    }
    onChange(value)
  }

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
            isLab ? "bg-blue-50 dark:bg-blue-950/30" : "bg-violet-50 dark:bg-violet-950/30"
          )}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  isLab
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400"
                )}
              >
                {isLab ? <FlaskConical className="h-5 w-5" /> : <Radiation className="h-5 w-5" />}
              </div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Pemeriksaan" : "Tambah Pemeriksaan Baru"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Department segmented toggle */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDepartmentChange("LAB", field.onChange)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    field.value === "LAB"
                      ? "border-blue-400 bg-white text-blue-700 shadow-sm dark:bg-blue-950/50 dark:text-blue-300"
                      : "text-muted-foreground border-transparent bg-white/50 hover:bg-white/80 dark:bg-white/5"
                  )}
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  Laboratorium
                </button>
                <button
                  type="button"
                  onClick={() => handleDepartmentChange("RAD", field.onChange)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    field.value === "RAD"
                      ? "border-violet-400 bg-white text-violet-700 shadow-sm dark:bg-violet-950/50 dark:text-violet-300"
                      : "text-muted-foreground border-transparent bg-white/50 hover:bg-white/80 dark:bg-white/5"
                  )}
                >
                  <Radiation className="h-3.5 w-3.5" />
                  Radiologi
                </button>
              </div>
            )}
          />
        </div>

        {/* Form body */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-6 py-5">
            {/* Kode & Nama */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isLab ? "cth. CBC" : "cth. XRAY-CHEST"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(isLab ? LAB_CATEGORIES : RAD_CATEGORIES).map((cat) => (
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
            </div>

            {/* Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pemeriksaan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isLab ? "cth. Complete Blood Count" : "cth. Foto Thorax PA"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Divider */}
            <div className="border-t" />

            {/* Harga & TAT */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
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
                name="tatHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TAT (jam)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 24)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specimen & Puasa */}
            <div className={isLab ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
              {isLab && (
                <FormField
                  control={form.control}
                  name="specimenType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Spesimen{" "}
                        <span className="text-muted-foreground font-normal">(opsional)</span>
                      </FormLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih spesimen…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LAB_SPECIMENS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="requiresFasting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Butuh Puasa</FormLabel>
                    <div className="flex h-9 items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          field.value
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-muted-foreground"
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
                      placeholder="Keterangan pemeriksaan…"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instruksi */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Instruksi Pasien{" "}
                    <span className="text-muted-foreground font-normal">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Puasa 8 jam sebelum pengambilan sampel…"
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
                          ? "Pemeriksaan tersedia untuk dipesan"
                          : "Pemeriksaan tidak akan muncul dalam pilihan order"}
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
                  isLab
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    : "bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
                )}
              >
                {isSubmitting ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Pemeriksaan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
