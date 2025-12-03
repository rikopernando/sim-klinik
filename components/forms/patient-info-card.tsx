import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Patient } from "@/types/registration"
import { calculateAge } from "@/lib/utils/date"

interface PatientInfoCardProps {
  patient: Patient
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pasien</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground grid grid-cols-1 gap-x-4 gap-y-1 text-sm md:grid-cols-2">
          <div className="grid grid-cols-4 md:col-span-1">
            <span className="col-span-1 font-medium">Nama</span>
            <span className="col-span-3">: {patient.name}</span>
          </div>
          <div className="grid grid-cols-4 md:col-span-1">
            <span className="col-span-1 font-medium">No. RM</span>
            <span className="col-span-3">: {patient.mrNumber}</span>
          </div>
          <div className="grid grid-cols-4 md:col-span-1">
            <span className="col-span-1 font-medium">Usia</span>
            <span className="col-span-3">
              : {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} tahun` : "-"}
            </span>
          </div>
          <div className="grid grid-cols-4 md:col-span-1">
            <span className="col-span-1 font-medium">Jaminan:</span>{" "}
            <span className="col-span-3">: {patient.insuranceType || "Umum"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
