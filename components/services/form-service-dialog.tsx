"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PayloadServices, ResultService } from "@/types/services"
import { Field, FieldGroup, FieldLabel } from "../ui/field"

interface FormServiceDialogProps {
  data: ResultService | null
  error: string | null
  open: boolean
  mode: string
  onOpenChange: (open: boolean) => void
  onSubmit: (mode: string, payload: PayloadServices, id?: string) => Promise<void>
}

export function FormServiceDialog({
  data,
  error,
  open,
  mode,
  onOpenChange,
  onSubmit,
}: FormServiceDialogProps) {
  const {
    control,
    setValue,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayloadServices>({
    defaultValues: {
      name: "",
      code: "",
      serviceType: "",
      category: "",
      price: "",
      description: "",
    },
  })

  useEffect(() => {
    if (open && data && mode === "edit") {
      setValue("name", data.name)
      setValue("code", data.code)
      setValue("category", data.category, { shouldValidate: true })
      setValue("serviceType", data.serviceType, { shouldValidate: true })
      setValue("price", data.price)
      setValue("description", data.description || "")
    } else if (open && mode === "add") {
      reset()
    }
  }, [open, data, mode, setValue, reset])

  const handleSubmit = async (formData: PayloadServices) => {
    try {
      if (mode === "add") {
        await onSubmit(mode, formData)
        toast.success("Service berhasil dibuat!")
      } else if (mode === "edit" && data?.id) {
        await onSubmit(mode, formData, data.id.toString())
        toast.success("Service berhasil diperbarui!")
      }

      if (!error) {
        onOpenChange(false)
        reset()
      } else {
        toast.error(error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast.error(errorMessage)
    }
  }

  // Define actual service types and categories
  const serviceTypes = [
    "administration",
    "procedure",
    "consultation",
    "laboratory",
    "radiology",
    "pharmacy",
    "room",
  ]
  const serviceCategories = [
    "administrative",
    "medical",
    "support",
    "diagnostic",
    "therapeutic",
    "preventive",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Tambah Service Baru" : "Perbarui Service"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Tambahkan service baru ke sistem" : "Update informasi service"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-1 gap-4">
            <Label htmlFor="create-name">
              Nama Service <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Nama service harus diisi" }}
              render={({ field }) => (
                <Input id="create-name" {...field} placeholder="Masukkan nama service" />
              )}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4">
            <Label htmlFor="create-code">
              Kode <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="code"
              control={control}
              rules={{ required: "Kode harus diisi" }}
              render={({ field }) => (
                <Input id="create-code" {...field} placeholder="Masukkan kode" />
              )}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="serviceType">
                Tipe <span className="text-red-500">*</span>
              </FieldLabel>
              <Controller
                name="serviceType"
                control={control}
                rules={{ required: "Tipe service harus dipilih" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Tipe Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceType && (
                <p className="text-sm text-red-500">{errors.serviceType.message}</p>
              )}
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="category">
                Kategori <span className="text-red-500">*</span>
              </FieldLabel>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Kategori harus dipilih" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4">
            <Label htmlFor="create-price">
              Harga <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="price"
              control={control}
              rules={{
                required: "Harga harus diisi",
                min: { value: 0, message: "Harga tidak boleh negatif" },
                validate: (value) => {
                  const numericValue = parseInt(value.replace(/\D/g, ""), 10)
                  if (isNaN(numericValue)) {
                    return "Harga harus berupa angka"
                  }
                  if (numericValue > 999999999) {
                    return "Harga maksimal Rp 999.999.999"
                  }
                  if (numericValue < 100) {
                    return "Harga minimal Rp 100"
                  }
                  return true
                },
              }}
              render={({ field: { onChange, value, ...field } }) => (
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">Rp</span>
                  <Input
                    id="create-price"
                    type="text"
                    className="pl-10"
                    placeholder="0"
                    {...field}
                    value={value ? new Intl.NumberFormat("id-ID").format(Number(value)) : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "")
                      onChange(rawValue)
                    }}
                  />
                </div>
              )}
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4">
            <Label htmlFor="create-description">Deskripsi</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="create-description"
                  {...field}
                  placeholder="Masukkan deskripsi (opsional)"
                  rows={4}
                />
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
