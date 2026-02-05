"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { updateVisitStatus } from "@/lib/services/visit.service"
import { QueueItem } from "@/types/dashboard"

const cancelVisitSchema = z.object({
  reason: z.string().min(5, "Alasan pembatalan minimal 5 karakter"),
})

type CancelVisitForm = z.infer<typeof cancelVisitSchema>

interface CancelVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueItem: QueueItem | null
  onSuccess?: () => void
}

export function CancelVisitDialog({
  open,
  onOpenChange,
  queueItem,
  onSuccess,
}: CancelVisitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CancelVisitForm>({
    resolver: zodResolver(cancelVisitSchema),
    defaultValues: {
      reason: "",
    },
  })

  const handleSubmit = async (data: CancelVisitForm) => {
    if (!queueItem) return

    setIsSubmitting(true)
    try {
      await updateVisitStatus(queueItem.visit.id, "cancelled", data.reason)

      toast.success("Kunjungan berhasil dibatalkan")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error cancelling visit:", error)
      toast.error("Gagal membatalkan kunjungan")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!queueItem) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            Batalkan Kunjungan?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan membatalkan kunjungan untuk pasien <strong>{queueItem.patient?.name}</strong>{" "}
            ({queueItem.patient?.mrNumber}).
            <br />
            Nomor kunjungan: <strong>{queueItem.visit.visitNumber}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Pembatalan *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan alasan pembatalan kunjungan..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isSubmitting}>
                Kembali
              </AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Batalkan Kunjungan
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
