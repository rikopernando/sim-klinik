"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, User, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/use-debounce";

import { searchPatients as searchPatientsService } from "@/lib/services/patient.service";
import { getErrorMessage } from "@/lib/utils/error";
import { formatDateShort, calculateAge } from "@/lib/utils/date";
import { type RegisteredPatient } from "@/types/registration";

interface PatientSearchProps {
    onSelectPatient?: (patient: RegisteredPatient) => void;
    onNewPatient?: () => void;
}

export function PatientSearch({ onSelectPatient, onNewPatient }: PatientSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<RegisteredPatient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useDebounce(query, 500);

    const handleSearch = useCallback(async (searchQuery: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const patients = await searchPatientsService(searchQuery);
            setResults(patients);
        } catch (err) {
            setError(getErrorMessage(err));
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        handleSearch(debouncedQuery);
    }, [debouncedQuery, handleSearch]);

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
                            className="cursor-pointer transition-colors hover:bg-accent py-0"
                            onClick={() => onSelectPatient?.(patient)}
                        >
                            <CardContent className="p-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{patient.name}</h3>
                                            {patient.gender && (
                                                <Badge variant="outline" className="text-xs">
                                                    {patient.gender === "male" ? "L" : "P"}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <div className="md:col-span-1 grid grid-cols-4">
                                                <span className="font-medium col-span-1">No. RM</span>
                                                <span className="col-span-3">
                                                    :{" "}{patient.mrNumber}
                                                </span>
                                            </div>
                                            <div className="md:col-span-1 grid grid-cols-4">
                                                <span className="font-medium col-span-1">NIK</span>
                                                <span className="col-span-3">
                                                    :{" "}{patient.nik}
                                                </span>
                                            </div>
                                            <div className="md:col-span-1 grid grid-cols-4">
                                                <span className="font-medium col-span-1">TTL</span>
                                                <span className="col-span-3">
                                                    :{" "}{formatDateShort(patient.dateOfBirth)}
                                                {patient.dateOfBirth &&
                                                    ` (${calculateAge(patient.dateOfBirth)} th)`}
                                                </span>
                                            </div>
                                            <div className="md:col-span-1 grid grid-cols-4">
                                                <span className="font-medium col-span-1">Telp</span>
                                                <span className="col-span-3">
                                                    :{" "}{patient.phone}
                                                </span>
                                            </div>
                                        </div>
                                        {patient.insuranceType && (
                                            <Badge variant="secondary" className="mt-1">
                                                {patient.insuranceType}
                                            </Badge>
                                        )}
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
