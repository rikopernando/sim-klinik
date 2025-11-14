import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Patient } from "@/types/registration";
import { calculateAge } from "@/lib/utils/date";

interface PatientInfoCardProps {
    patient: Patient;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informasi Pasien</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <span className="font-medium">Nama:</span> {patient.name}
                    </div>
                    <div>
                        <span className="font-medium">No. RM:</span> {patient.mrNumber}
                    </div>
                    <div>
                        <span className="font-medium">Usia:</span>{" "}
                        {patient.dateOfBirth
                            ? `${calculateAge(patient.dateOfBirth)} tahun`
                            : "-"}
                    </div>
                    <div>
                        <span className="font-medium">Jaminan:</span>{" "}
                        {patient.insuranceType || "Umum"}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
