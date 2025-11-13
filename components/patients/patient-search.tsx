"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Search, Loader2, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/use-debounce";

interface Patient {
    id: number;
    mrNumber: string;
    nik: string | null;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    insuranceType: string | null;
}

interface PatientSearchProps {
    onSelectPatient?: (patient: Patient) => void;
    onNewPatient?: () => void;
}

export function PatientSearch({ onSelectPatient, onNewPatient }: PatientSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useDebounce(query, 500);

    const searchPatients = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/patients/search`, {
                params: { q: searchQuery },
            });
            setResults(response.data.data || []);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error || "Gagal mencari pasien. Silakan coba lagi."
                );
            } else {
                setError("Terjadi kesalahan. Silakan coba lagi.");
            }
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        searchPatients(debouncedQuery);
    }, [debouncedQuery, searchPatients]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID");
    };

    const calculateAge = (dateOfBirth: string | null) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari pasien (NIK, No. RM, atau Nama)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={onNewPatient} variant="outline" className="w-full sm:w-auto">
                    <User className="mr-2 h-4 w-4" />
                    Pasien Baru
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Mencari pasien...
                    </span>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Ditemukan {results.length} pasien
                    </p>
                    {results.map((patient) => (
                        <Card
                            key={patient.id}
                            className="cursor-pointer transition-colors hover:bg-accent"
                            onClick={() => onSelectPatient?.(patient)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{patient.name}</h3>
                                            {patient.gender && (
                                                <Badge variant="outline" className="text-xs">
                                                    {patient.gender === "male" ? "L" : "P"}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <div>
                                                <span className="font-medium">No. RM:</span>{" "}
                                                {patient.mrNumber}
                                            </div>
                                            <div>
                                                <span className="font-medium">NIK:</span>{" "}
                                                {patient.nik || "-"}
                                            </div>
                                            <div>
                                                <span className="font-medium">TTL:</span>{" "}
                                                {formatDate(patient.dateOfBirth)}
                                                {patient.dateOfBirth &&
                                                    ` (${calculateAge(patient.dateOfBirth)} th)`}
                                            </div>
                                            <div>
                                                <span className="font-medium">Telp:</span>{" "}
                                                {patient.phone || "-"}
                                            </div>
                                        </div>
                                        {patient.insuranceType && (
                                            <Badge variant="secondary" className="mt-1">
                                                {patient.insuranceType}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && query.length >= 2 && results.length === 0 && (
                <div className="rounded-md border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Tidak ada pasien ditemukan dengan kata kunci &quot;{query}&quot;
                    </p>
                    <Button onClick={onNewPatient} className="mt-4" variant="default">
                        Daftar Pasien Baru
                    </Button>
                </div>
            )}
        </div>
    );
}
