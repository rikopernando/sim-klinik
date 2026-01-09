/**
 * Collect Specimen Dialog Component
 * Dialog for recording specimen collection from patient
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconDroplet, IconX } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useUpdateLabOrderStatus } from "@/hooks/use-update-lab-order-status"
import type { LabOrderWithRelations } from "@/types/lab"

interface CollectSpecimenDialogProps {
  order: LabOrderWithRelations
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const formSchema = z.object({
  collectionTime: z.string().min(1, "Waktu pengambilan harus diisi"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function CollectSpecimenDialog({ order, trigger, onSuccess }: CollectSpecimenDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionTime: new Date().toISOString().slice(0, 16), // Format for datetime-local
      notes: "",
    },
  })

  const { updateStatus, isUpdating } = useUpdateLabOrderStatus({
    onSuccess: () => {
      setOpen(false)
      form.reset()
      onSuccess?.()
    },
  })

  const onSubmit = async (data: FormData) => {
    await updateStatus(order.id, {
      status: "specimen_collected",
      notes: data.notes,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <IconDroplet className="mr-2 h-4 w-4" />
            Ambil Spesimen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconDroplet className="h-5 w-5" />
            Pengambilan Spesimen
          </DialogTitle>
          <DialogDescription>
            Catat waktu dan detail pengambilan spesimen dari pasien
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Order Information */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{order.test?.name || "Test Unknown"}</h4>
                <Badge variant="secondary" className="text-xs">
                  {order.test?.department}
                </Badge>
                {order.urgency && order.urgency !== "routine" && (
                  <Badge
                    variant={order.urgency === "stat" ? "destructive" : "default"}
                    className={order.urgency === "urgent" ? "bg-orange-500" : ""}
                  >
                    {order.urgency.toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>
                  <span className="font-medium">Pasien:</span> {order.patient.name}
                </p>
                <p>
                  <span className="font-medium">MR Number:</span> {order.patient.mrNumber}
                </p>
                <p className="font-mono text-xs">{order.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Collection Time */}
          <div className="space-y-2">
            <Label htmlFor="collectionTime">Waktu Pengambilan *</Label>
            <Input
              id="collectionTime"
              type="datetime-local"
              {...form.register("collectionTime")}
              className="font-mono"
            />
            {form.formState.errors.collectionTime && (
              <p className="text-sm text-red-600">{form.formState.errors.collectionTime.message}</p>
            )}
          </div>

          {/* Collection Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Pengambilan</Label>
            <Textarea
              id="notes"
              placeholder="Catat kondisi spesimen, volume, atau informasi relevan lainnya..."
              {...form.register("notes")}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">Opsional</p>
          </div>

          {/* Test Specimen Type Info */}
          {order.test?.specimenType && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm">
                <span className="font-medium">Tipe Spesimen:</span> {order.test.specimenType}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              <IconX className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <IconDroplet className="mr-2 h-4 w-4" />
              {isUpdating ? "Menyimpan..." : "Simpan Pengambilan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
