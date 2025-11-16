"use client";

/**
 * Pharmacy Queue Dashboard
 * Displays pending prescriptions and expiring drugs
 */

import { useState } from "react";
import { usePharmacyQueue } from "@/hooks/use-pharmacy-queue";
import { useExpiringDrugs } from "@/hooks/use-expiring-drugs";
import { usePrescriptionFulfillment } from "@/hooks/use-prescription-fulfillment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PharmacyDashboard() {
    const { queue, isLoading: queueLoading, error: queueError, lastRefresh, refresh } = usePharmacyQueue({
        autoRefresh: true,
        refreshInterval: 30000,
    });

    const { expiringDrugs, isLoading: expiringLoading, error: expiringError } = useExpiringDrugs({
        autoRefresh: true,
        refreshInterval: 60000,
    });

    const { fulfillPrescription, isSubmitting } = usePrescriptionFulfillment();

    const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
    const [fulfillmentData, setFulfillmentData] = useState({
        inventoryId: "",
        dispensedQuantity: "",
        fulfilledBy: "",
        notes: "",
    });

    const handleFulfill = async () => {
        if (!selectedPrescription) return;

        const success = await fulfillPrescription({
            prescriptionId: selectedPrescription.prescription.id,
            inventoryId: parseInt(fulfillmentData.inventoryId),
            dispensedQuantity: parseInt(fulfillmentData.dispensedQuantity),
            fulfilledBy: fulfillmentData.fulfilledBy,
            notes: fulfillmentData.notes || undefined,
        });

        if (success) {
            setSelectedPrescription(null);
            setFulfillmentData({
                inventoryId: "",
                dispensedQuantity: "",
                fulfilledBy: "",
                notes: "",
            });
            refresh();
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Farmasi</h1>
                    <p className="text-muted-foreground">
                        Kelola resep dan stok obat
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {lastRefresh && (
                        <p className="text-sm text-muted-foreground">
                            Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
                        </p>
                    )}
                    <Button onClick={refresh} variant="outline">
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Resep Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{queue.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Menunggu proses
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Kadaluarsa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {expiringDrugs.expired.length}
                        </div>
                        <p className="text-xs text-red-600">
                            Sudah kadaluarsa
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Segera Kadaluarsa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">
                            {expiringDrugs.expiringSoon.length}
                        </div>
                        <p className="text-xs text-orange-600">
                            &lt; 30 hari
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Perhatian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">
                            {expiringDrugs.warning.length}
                        </div>
                        <p className="text-xs text-yellow-600">
                            30-90 hari
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="queue" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="queue">
                        Antrian Resep ({queue.length})
                    </TabsTrigger>
                    <TabsTrigger value="expiring">
                        Obat Kadaluarsa ({expiringDrugs.all.length})
                    </TabsTrigger>
                </TabsList>

                {/* Prescription Queue Tab */}
                <TabsContent value="queue" className="space-y-4">
                    {queueLoading ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Loading...
                            </CardContent>
                        </Card>
                    ) : queueError ? (
                        <Card>
                            <CardContent className="p-8 text-center text-red-600">
                                Error: {queueError}
                            </CardContent>
                        </Card>
                    ) : queue.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Tidak ada resep yang menunggu
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {queue.map((item: any) => (
                                <Card key={item.prescription.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {item.drug.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {item.drug.genericName && (
                                                        <span className="text-sm">
                                                            {item.drug.genericName}
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge>Pending</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Pasien</p>
                                                <p className="font-medium">{item.patient?.name || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Dokter</p>
                                                <p className="font-medium">{item.doctor?.name || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Dosis</p>
                                                <p className="font-medium">{item.prescription.dosage}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Frekuensi</p>
                                                <p className="font-medium">{item.prescription.frequency}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Jumlah</p>
                                                <p className="font-medium">
                                                    {item.prescription.quantity} {item.drug.unit}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Durasi</p>
                                                <p className="font-medium">
                                                    {item.prescription.duration || "-"}
                                                </p>
                                            </div>
                                        </div>
                                        {item.prescription.instructions && (
                                            <div className="mb-4">
                                                <p className="text-sm text-muted-foreground">Instruksi</p>
                                                <p className="font-medium">{item.prescription.instructions}</p>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => setSelectedPrescription(item)}
                                            className="w-full"
                                        >
                                            Proses Resep
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Expiring Drugs Tab */}
                <TabsContent value="expiring" className="space-y-4">
                    {expiringLoading ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Loading...
                            </CardContent>
                        </Card>
                    ) : expiringError ? (
                        <Card>
                            <CardContent className="p-8 text-center text-red-600">
                                Error: {expiringError}
                            </CardContent>
                        </Card>
                    ) : expiringDrugs.all.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Tidak ada obat yang mendekati kadaluarsa
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {expiringDrugs.all.map((inventory: any) => {
                                const colors = getExpiryAlertColor(inventory.expiryAlertLevel);
                                return (
                                    <Card
                                        key={inventory.id}
                                        className={`border-2 ${colors.border} ${colors.bg}`}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {inventory.drug.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Batch: {inventory.batchNumber}
                                                    </CardDescription>
                                                </div>
                                                <Badge className={colors.badge}>
                                                    {inventory.expiryAlertLevel === "expired"
                                                        ? "Kadaluarsa"
                                                        : inventory.expiryAlertLevel === "expiring_soon"
                                                        ? "Segera Kadaluarsa"
                                                        : "Perhatian"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tanggal Kadaluarsa
                                                    </p>
                                                    <p className={`font-medium ${colors.text}`}>
                                                        {formatExpiryDate(
                                                            inventory.expiryDate,
                                                            inventory.daysUntilExpiry
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Stok</p>
                                                    <p className="font-medium">
                                                        {inventory.stockQuantity} {inventory.drug.unit}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Supplier</p>
                                                    <p className="font-medium">
                                                        {inventory.supplier || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Fulfillment Dialog */}
            <Dialog
                open={!!selectedPrescription}
                onOpenChange={(open) => !open && setSelectedPrescription(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Proses Resep</DialogTitle>
                        <DialogDescription>
                            Isi informasi pengambilan obat
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPrescription && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">Obat</p>
                                <p className="text-lg">{selectedPrescription.drug.name}</p>
                            </div>

                            <div>
                                <Label htmlFor="inventoryId">Inventory ID</Label>
                                <Input
                                    id="inventoryId"
                                    type="number"
                                    value={fulfillmentData.inventoryId}
                                    onChange={(e) =>
                                        setFulfillmentData({
                                            ...fulfillmentData,
                                            inventoryId: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan inventory ID"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dispensedQuantity">Jumlah yang Diberikan</Label>
                                <Input
                                    id="dispensedQuantity"
                                    type="number"
                                    value={fulfillmentData.dispensedQuantity}
                                    onChange={(e) =>
                                        setFulfillmentData({
                                            ...fulfillmentData,
                                            dispensedQuantity: e.target.value,
                                        })
                                    }
                                    placeholder={`Max: ${selectedPrescription.prescription.quantity}`}
                                />
                            </div>

                            <div>
                                <Label htmlFor="fulfilledBy">Diproses Oleh</Label>
                                <Input
                                    id="fulfilledBy"
                                    value={fulfillmentData.fulfilledBy}
                                    onChange={(e) =>
                                        setFulfillmentData({
                                            ...fulfillmentData,
                                            fulfilledBy: e.target.value,
                                        })
                                    }
                                    placeholder="Nama petugas"
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Textarea
                                    id="notes"
                                    value={fulfillmentData.notes}
                                    onChange={(e) =>
                                        setFulfillmentData({
                                            ...fulfillmentData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Tambahkan catatan jika diperlukan"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleFulfill}
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting ? "Memproses..." : "Proses"}
                                </Button>
                                <Button
                                    onClick={() => setSelectedPrescription(null)}
                                    variant="outline"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
