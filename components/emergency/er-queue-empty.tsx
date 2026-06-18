import { CheckCircle } from "lucide-react"

export function ERQueueEmpty() {
  return (
    <div className="bg-card rounded-xl border py-16 text-center">
      <CheckCircle size={36} className="text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm font-medium">Tidak ada antrian UGD</p>
      <p className="text-muted-foreground text-xs">
        Semua pasien telah ditangani atau belum ada pasien baru
      </p>
    </div>
  )
}
