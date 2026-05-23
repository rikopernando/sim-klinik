import { type Patient } from "@/types/registration"
import { calculateAge } from "@/lib/utils/date"

interface PatientInfoCardProps {
  patient: Patient
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="bg-muted/40 rounded-xl border px-5 py-4">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        Informasi Pasien
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">
        <div>
          <p className="text-muted-foreground text-xs">Nama</p>
          <p className="font-medium">{patient.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">No. RM</p>
          <p className="font-medium">{patient.mrNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Usia</p>
          <p className="font-medium">
            {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} tahun` : "-"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Jaminan</p>
          <p className="font-medium">{patient.insuranceType || "Umum"}</p>
        </div>
      </div>
    </div>
  )
}
