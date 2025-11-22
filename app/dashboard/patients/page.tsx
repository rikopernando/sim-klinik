"use client";

/**
 * Patients List Page
 * View and manage all registered patients
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    UserPlus,
    Search,
    Edit,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface Patient {
    id: number;
    mrNumber: string;
    nik: string | null;
    name: string;
    gender: string | null;
    dateOfBirth: string | null;
    phone: string | null;
    email: string | null;
    insuranceType: string | null;
    createdAt: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Debounce search query to avoid excessive API calls
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Fetch patients from API
    const fetchPatients = async (page: number = 1, search: string = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) {
                params.append("search", search);
            }

            const response = await fetch(`/api/patients?${params}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }

            const data = await response.json();
            setPatients(data.patients || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients(1, debouncedSearch);
    }, [debouncedSearch]);


    const handlePageChange = (newPage: number) => {
        fetchPatients(newPage, debouncedSearch);
    };

    const handleNewPatient = () => {
        router.push("/dashboard/patients/new");
    };

    const handleEditPatient = (patientId: number) => {
        router.push(`/dashboard/patients/${patientId}/edit`);
    };

    const getGenderLabel = (gender: string | null) => {
        if (!gender) return "-";
        return gender === "male" ? "Laki-laki" : "Perempuan";
    };

    return (
        <div className="container mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Data Pasien</h1>
                    <p className="text-muted-foreground">
                        Kelola data pasien yang terdaftar
                    </p>
                </div>
                <Button onClick={handleNewPatient} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Pasien Baru
                </Button>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Pencarian</CardTitle>
                    <CardDescription>
                        Cari pasien berdasarkan nama, NIK, atau nomor RM
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama, NIK, atau nomor RM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Patient List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pasien</CardTitle>
                    <CardDescription>
                        Total {pagination.total} pasien terdaftar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            Tidak ada data pasien
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No. RM</TableHead>
                                            <TableHead>NIK</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Jenis Kelamin</TableHead>
                                            <TableHead>Tanggal Lahir</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Jaminan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell className="font-medium">
                                                    {patient.mrNumber}
                                                </TableCell>
                                                <TableCell>{patient.nik || "-"}</TableCell>
                                                <TableCell className="font-medium">
                                                    {patient.name}
                                                </TableCell>
                                                <TableCell>
                                                    {getGenderLabel(patient.gender)}
                                                </TableCell>
                                                <TableCell>
                                                    {patient.dateOfBirth
                                                        ? format(
                                                              new Date(patient.dateOfBirth),
                                                              "dd/MM/yyyy"
                                                          )
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>{patient.phone || "-"}</TableCell>
                                                <TableCell>
                                                    {patient.insuranceType ? (
                                                        <Badge variant="outline">
                                                            {patient.insuranceType}
                                                        </Badge>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditPatient(patient.id)
                                                        }
                                                        className="gap-1"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Halaman {pagination.page} dari{" "}
                                        {pagination.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(pagination.page - 1)
                                            }
                                            disabled={pagination.page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(pagination.page + 1)
                                            }
                                            disabled={
                                                pagination.page === pagination.totalPages
                                            }
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
