"use client";

/**
 * Add New Patient Page
 * Dedicated page for creating new patient records
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { PatientRegistrationForm } from "@/components/patients/patient-registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/registration";

type PageState = "form" | "success";

export default function NewPatientPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>("form");
    const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

    const handleSuccess = (patient: Patient) => {
        setRegisteredPatient(patient);
        setPageState("success");
    };

    const handleBackToList = () => {
        router.push("/dashboard/patients");
    };

    const handleAddAnother = () => {
        setRegisteredPatient(null);
        setPageState("form");
    };

    const handleRegisterVisit = () => {
        router.push("/dashboard/registration");
    };

    return (
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    onClick={handleBackToList}
                    className="gap-2 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {pageState === "form" ? "Tambah Pasien Baru" : "Pasien Berhasil Didaftarkan"}
                    </h1>
                    <p className="text-muted-foreground">
                        {pageState === "form"
                            ? "Lengkapi formulir untuk mendaftarkan pasien baru"
                            : "Data pasien telah tersimpan di sistem"}
                    </p>
                </div>
            </div>

            {/* Form State */}
            {pageState === "form" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-6 w-6 text-primary" />
                            <CardTitle>Form Pendaftaran Pasien</CardTitle>
                        </div>
                        <CardDescription>
                            Masukkan data pasien baru. Form ini terdiri dari 2 langkah yang mudah diikuti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PatientRegistrationForm
                            onSuccess={handleSuccess}
                            onCancel={handleBackToList}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Success State */}
            {pageState === "success" && registeredPatient && (
                <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <CardContent className="space-y-6 p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold">Pasien Berhasil Didaftarkan!</h2>
                            <p className="text-muted-foreground">
                                Data pasien telah tersimpan di sistem
                            </p>
                        </div>

                        {/* Patient Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Pasien</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Nomor RM:</span>
                                        <div className="text-lg font-bold text-primary">
                                            {registeredPatient.mrNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">NIK:</span>
                                        <div>{registeredPatient.nik || "-"}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Nama Lengkap:</span>
                                        <div>{registeredPatient.name}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Jenis Kelamin:</span>
                                        <div>
                                            {registeredPatient.gender === "male"
                                                ? "Laki-laki"
                                                : registeredPatient.gender === "female"
                                                ? "Perempuan"
                                                : "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Tanggal Lahir:</span>
                                        <div>
                                            {registeredPatient.dateOfBirth
                                                ? new Date(registeredPatient.dateOfBirth).toLocaleDateString(
                                                      "id-ID",
                                                      {
                                                          day: "numeric",
                                                          month: "long",
                                                          year: "numeric",
                                                      }
                                                  )
                                                : "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Telepon:</span>
                                        <div>{registeredPatient.phone || "-"}</div>
                                    </div>
                                    {registeredPatient.insuranceType && (
                                        <div>
                                            <span className="font-medium">Jenis Jaminan:</span>
                                            <div>
                                                <Badge variant="outline">
                                                    {registeredPatient.insuranceType}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    {registeredPatient.insuranceNumber && (
                                        <div>
                                            <span className="font-medium">Nomor Jaminan:</span>
                                            <div>{registeredPatient.insuranceNumber}</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button onClick={handleAddAnother} size="lg" className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Tambah Pasien Lain
                            </Button>
                            <Button
                                onClick={handleRegisterVisit}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                Daftarkan Kunjungan
                            </Button>
                            <Button
                                onClick={handleBackToList}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                Lihat Daftar Pasien
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
