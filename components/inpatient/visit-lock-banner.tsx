"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconLock, IconLockOpen } from "@tabler/icons-react"
import { unlockInpatientVisit } from "@/lib/services/inpatient.service"
import { toast } from "sonner"
import { usePermission } from "@/hooks/use-permission"
import { useSession } from "@/lib/auth-client"
import { getErrorMessage } from "@/lib/utils/error"

interface VisitLockBannerProps {
  visitStatus: string
  visitId: string
  patientName: string
  onUnlockSuccess: () => void
}

export function VisitLockBanner({
  visitStatus,
  visitId,
  patientName,
  onUnlockSuccess,
}: VisitLockBannerProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const { hasPermission } = usePermission()
  const { data: session } = useSession()

  // Check if visit is in ready_for_billing status
  if (visitStatus !== "billed") {
    return null
  }

  // Only doctors can unlock
  const canUnlock = hasPermission("inpatient:write") && session?.user?.role === "doctor"

  const handleUnlock = async () => {
    setIsUnlocking(true)
    try {
      await unlockInpatientVisit(visitId)
      toast.success("Visit berhasil di-unlock. Data billing telah dihapus.")
      setShowUnlockDialog(false)
      onUnlockSuccess()
    } catch (error) {
      // Error is already handled by handleApiError in the service
      console.error("Unlock failed:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsUnlocking(false)
    }
  }

  // Locked state
  return (
    <>
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
        <IconLock className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">Visit Terkunci</AlertTitle>
        <AlertDescription className="space-y-2">
          <p className="text-red-700 dark:text-red-300">
            Visit ini telah terkunci karena sudah ditandai siap untuk billing. Tidak dapat melakukan
            perubahan data CPPT, vital signs, resep, tindakan, atau penggunaan alat kesehatan.
          </p>
          {canUnlock && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnlockDialog(true)}
                className="border-red-600 text-red-700 hover:bg-red-100 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950"
              >
                <IconLockOpen className="mr-2 h-4 w-4" />
                Unlock Visit
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Unlock Confirmation Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Visit</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membuka kunci visit untuk pasien{" "}
              <strong>{patientName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-muted-foreground text-sm">Tindakan ini akan:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Menghapus data billing yang sudah dibuat</li>
              <li>Mengubah status visit menjadi &quot;Dalam Pemeriksaan&quot;</li>
              <li>Memungkinkan penambahan/perubahan data medis kembali</li>
            </ul>
            <p className="text-destructive pt-2 text-sm font-medium">
              ⚠️ Unlock tidak dapat dilakukan jika pembayaran sudah dimulai atau selesai.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnlockDialog(false)}
              disabled={isUnlocking}
            >
              Batal
            </Button>
            <Button onClick={handleUnlock} disabled={isUnlocking} variant="destructive">
              {isUnlocking ? "Unlocking..." : "Ya, Unlock Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
