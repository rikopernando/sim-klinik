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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="md:col-span-1 grid grid-cols-4">
                        <span className="font-medium col-span-1">Nama</span>
                        <span className="col-span-3">
                            :{" "}{patient.name}
                        </span>
                    </div>
                    <div className="md:col-span-1 grid grid-cols-4">
                        <span className="font-medium col-span-1">No. RM</span>
                        <span className="col-span-3">
                            :{" "}{patient.mrNumber}
                        </span>
                    </div>
                    <div className="md:col-span-1 grid grid-cols-4">
                        <span className="font-medium  col-span-1">Usia</span>
                        <span className="col-span-3">
                        :{" "}
                        {patient.dateOfBirth
                            ? `${calculateAge(patient.dateOfBirth)} tahun`
                            : "-"}
                        </span>
                    </div>
                    <div className="md:col-span-1 grid grid-cols-4">
                        <span className="font-medium col-span-1">Jaminan:</span>{" "}
                        <span className="col-span-3">
                            :{" "}{patient.insuranceType || 'Umum'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
