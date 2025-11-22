"use client";

/**
 * Patient Success Card Component
 * Displays success message and patient details after registration
 */

import { CheckCircle, UserPlus, FileText, List, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/registration";
import { formatDate } from "@/lib/utils/date";
import { getGenderLabel } from "@/lib/utils/patient";

interface PatientSuccessCardProps {
    patient: Patient;
    onAddAnother: () => void;
    onRegisterVisit: () => void;
    onViewList: () => void;
    mode?: "create" | "edit";
}

export function PatientSuccessCard({
    patient,
    onAddAnother,
    onRegisterVisit,
    onViewList,
    mode = "create",
}: PatientSuccessCardProps) {
    const isEditMode = mode === "edit";

    return (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="space-y-6 p-8">
                {/* Success Icon & Message */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">
                        {isEditMode ? "Data Pasien Berhasil Diperbarui!" : "Pasien Berhasil Didaftarkan!"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEditMode ? "Perubahan data pasien telah tersimpan di sistem" : "Data pasien telah tersimpan di sistem"}
                    </p>
                </div>

                {/* Patient Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informasi Pasien</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            {/* MR Number - Highlighted */}
                            <div className="md:col-span-2">
                                <span className="font-medium">Nomor RM:</span>
                                <div className="text-2xl font-bold text-primary">
                                    {patient.mrNumber}
                                </div>
                            </div>

                            {/* NIK */}
                            <div>
                                <span className="font-medium text-muted-foreground">NIK:</span>
                                <div className="font-medium">{patient.nik || "-"}</div>
                            </div>

                            {/* Name */}
                            <div>
                                <span className="font-medium text-muted-foreground">Nama Lengkap:</span>
                                <div className="font-medium">{patient.name}</div>
                            </div>

                            {/* Gender */}
                            <div>
                                <span className="font-medium text-muted-foreground">Jenis Kelamin:</span>
                                <div className="font-medium">{getGenderLabel(patient.gender)}</div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <span className="font-medium text-muted-foreground">Tanggal Lahir:</span>
                                <div className="font-medium">{formatDate(patient.dateOfBirth)}</div>
                            </div>

                            {/* Phone */}
                            <div>
                                <span className="font-medium text-muted-foreground">Telepon:</span>
                                <div className="font-medium">{patient.phone || "-"}</div>
                            </div>

                            {/* Blood Type */}
                            {patient.bloodType && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Golongan Darah:</span>
                                    <div className="font-medium">{patient.bloodType}</div>
                                </div>
                            )}

                            {/* Insurance Type */}
                            {patient.insuranceType && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Jenis Jaminan:</span>
                                    <div>
                                        <Badge variant="outline">
                                            {patient.insuranceType}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Insurance Number */}
                            {patient.insuranceNumber && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Nomor Jaminan:</span>
                                    <div className="font-medium">{patient.insuranceNumber}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={onAddAnother} size="lg" className="gap-2">
                        {isEditMode ? (
                            <>
                                <Edit className="h-4 w-4" />
                                Edit Lagi
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" />
                                Tambah Pasien Lain
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onRegisterVisit}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Daftarkan Kunjungan
                    </Button>
                    <Button
                        onClick={onViewList}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <List className="h-4 w-4" />
                        Lihat Daftar Pasien
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
