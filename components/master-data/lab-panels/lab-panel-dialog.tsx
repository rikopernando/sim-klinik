"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LayoutList, X, ChevronsUpDown, Check, Search, ChevronUp } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { cn } from "@/lib/utils"
import { createLabPanelSchema } from "@/lib/validations/lab-panel"
import { getLabTests } from "@/lib/services/lab-test.service"
import type { LabPanelRecord } from "@/types/lab-panel"
import type { LabTestRecord } from "@/types/lab-test"

const formSchema = createLabPanelSchema.extend({ isActive: z.boolean().optional() })

const deptBadgeClass = (department: string) =>
  department === "LAB"
    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"

type FormValues = z.infer<typeof formSchema>

interface LabPanelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LabPanelRecord | null
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function LabPanelDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting,
}: LabPanelDialogProps) {
  const isEdit = !!item

  const [availableTests, setAvailableTests] = useState<LabTestRecord[]>([])
  const [testSearch, setTestSearch] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      price: 0,
      testIds: [],
      isActive: true,
    },
  })

  const selectedTestIds = form.watch("testIds")

  useEffect(() => {
    if (!open) return

    getLabTests({ isActive: true, limit: 100 }).then((res) => {
      setAvailableTests(res.data ?? [])
    })

    form.reset(
      item
        ? {
            code: item.code,
            name: item.name,
            description: item.description ?? "",
            price: parseFloat(item.price),
            testIds: item.tests?.map((t) => t.id) ?? [],
            isActive: item.isActive,
          }
        : { code: "", name: "", description: "", price: 0, testIds: [], isActive: true }
    )
    setTestSearch("")
  }, [open, item, form])

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values)
    onOpenChange(false)
  }

  const toggleTest = (testId: string) => {
    const current = form.getValues("testIds")
    const next = current.includes(testId)
      ? current.filter((id) => id !== testId)
      : [...current, testId]
    form.setValue("testIds", next, { shouldValidate: true })
  }

  const filteredTests = availableTests.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(testSearch.toLowerCase())
  )

  const selectedTests = availableTests.filter((t) => selectedTestIds.includes(t.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0">
        {/* Header strip */}
        <div className="bg-indigo-50 px-6 pt-6 pb-5 dark:bg-indigo-950/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <LayoutList className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Panel" : "Tambah Panel Baru"}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        {/* Form body */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-6 py-5">
            {/* Kode */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cth. DIABETES-PANEL"
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Panel</FormLabel>
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
            </div>

            {/* Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Panel</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Paket Diabetes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="Keterangan panel pemeriksaan…"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t" />

            {/* Test multi-select */}
            <FormField
              control={form.control}
              name="testIds"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Pemeriksaan{" "}
                    <span className="text-muted-foreground font-normal">
                      ({selectedTestIds.length} dipilih)
                    </span>
                  </FormLabel>

                  {/* Selected test badges */}
                  {selectedTests.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {selectedTests.map((t) => (
                        <Badge
                          key={t.id}
                          variant="secondary"
                          className={cn("gap-1 pr-1 text-xs", deptBadgeClass(t.department))}
                        >
                          {t.code}
                          <button
                            type="button"
                            onClick={() => toggleTest(t.id)}
                            className="hover:text-destructive ml-0.5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Inline picker toggle + panel */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between font-normal"
                      onClick={() => setPickerOpen((o) => !o)}
                    >
                      <span className="text-muted-foreground">Pilih pemeriksaan…</span>
                      {pickerOpen ? (
                        <ChevronUp className="h-4 w-4 opacity-50" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </Button>

                    {pickerOpen && (
                      <div className="bg-popover absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-md border shadow-md">
                        <div className="flex items-center border-b px-3">
                          <Search className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
                          <input
                            className="placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-none"
                            placeholder="Cari kode atau nama pemeriksaan…"
                            value={testSearch}
                            onChange={(e) => setTestSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto overscroll-contain p-1">
                          {filteredTests.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                              Tidak ada pemeriksaan ditemukan
                            </p>
                          ) : (
                            filteredTests.map((t) => {
                              const selected = selectedTestIds.includes(t.id)
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => toggleTest(t.id)}
                                  className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                                >
                                  <div
                                    className={cn(
                                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                      selected
                                        ? "border-indigo-500 bg-indigo-500 text-white"
                                        : "border-muted-foreground"
                                    )}
                                  >
                                    {selected && <Check className="h-3 w-3" />}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={cn("shrink-0 text-xs", deptBadgeClass(t.department))}
                                  >
                                    {t.department}
                                  </Badge>
                                  <span className="font-mono text-xs font-medium">{t.code}</span>
                                  <span className="text-muted-foreground truncate text-sm">
                                    {t.name}
                                  </span>
                                </button>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status — edit only */}
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
                          ? "Panel tersedia untuk dipesan"
                          : "Panel tidak akan muncul dalam pilihan order"}
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
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                {isSubmitting ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Panel"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
