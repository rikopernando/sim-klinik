/**
 * Medical Record Tabs Component
 * Optimized tab rendering with React.memo to prevent unnecessary re-renders
 */

import { memo } from "react";
import { FileText, Stethoscope, Pill, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type MedicalRecordData } from "@/types/medical-record";

import { SoapForm } from "./soap-form";
import { DiagnosisTab } from "./diagnosis-tab";
import { PrescriptionTab } from "./prescription-tab";
import { ProcedureTab } from "./procedure-tab";

interface MedicalRecordTabsProps {
    recordData: MedicalRecordData;
    activeTab: string;
    isLocked: boolean;
    onTabChange: (value: string) => void;
    onUpdate: () => Promise<void>;
    onUpdateRecord: (updates: Partial<MedicalRecordData["medicalRecord"]>) => void;
    onSaveSOAP: (soapData: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => Promise<void>;
}

// Memoized SOAP tab to prevent re-renders when other tabs are active
const SOAPTabContent = memo(function SOAPTabContent({
    medicalRecord,
    onUpdate,
    onSave,
    isLocked,
}: {
    medicalRecord: MedicalRecordData["medicalRecord"];
    onUpdate: (updates: Partial<MedicalRecordData["medicalRecord"]>) => void;
    onSave: (soapData: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => Promise<void>;
    isLocked: boolean;
}) {
    return (
        <SoapForm
            medicalRecord={medicalRecord}
            onUpdate={onUpdate}
            onSave={onSave}
            isLocked={isLocked}
        />
    );
});

// Memoized Diagnosis tab
const DiagnosisTabContent = memo(function DiagnosisTabContent({
    medicalRecordId,
    diagnoses,
    onUpdate,
    isLocked,
}: {
    medicalRecordId: number;
    diagnoses: MedicalRecordData["diagnoses"];
    onUpdate: () => Promise<void>;
    isLocked: boolean;
}) {
    return (
        <DiagnosisTab
            medicalRecordId={medicalRecordId}
            diagnoses={diagnoses}
            onUpdate={onUpdate}
            isLocked={isLocked}
        />
    );
});

// Memoized Prescription tab
const PrescriptionTabContent = memo(function PrescriptionTabContent({
    medicalRecordId,
    prescriptions,
    onUpdate,
    isLocked,
}: {
    medicalRecordId: number;
    prescriptions: MedicalRecordData["prescriptions"];
    onUpdate: () => Promise<void>;
    isLocked: boolean;
}) {
    return (
        <PrescriptionTab
            medicalRecordId={medicalRecordId}
            prescriptions={prescriptions}
            onUpdate={onUpdate}
            isLocked={isLocked}
        />
    );
});

// Memoized Procedure tab
const ProcedureTabContent = memo(function ProcedureTabContent({
    medicalRecordId,
    procedures,
    onUpdate,
    isLocked,
}: {
    medicalRecordId: number;
    procedures: MedicalRecordData["procedures"];
    onUpdate: () => Promise<void>;
    isLocked: boolean;
}) {
    return (
        <ProcedureTab
            medicalRecordId={medicalRecordId}
            procedures={procedures}
            onUpdate={onUpdate}
            isLocked={isLocked}
        />
    );
});

export function MedicalRecordTabs({
    recordData,
    activeTab,
    isLocked,
    onTabChange,
    onUpdate,
    onUpdateRecord,
    onSaveSOAP,
}: MedicalRecordTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="soap" className="gap-2">
                    <FileText className="h-4 w-4" />
                    SOAP
                </TabsTrigger>
                <TabsTrigger value="diagnosis" className="gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Diagnosis
                </TabsTrigger>
                <TabsTrigger value="prescription" className="gap-2">
                    <Pill className="h-4 w-4" />
                    Resep
                </TabsTrigger>
                <TabsTrigger value="procedure" className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Tindakan
                </TabsTrigger>
            </TabsList>

            <TabsContent value="soap" className="mt-6">
                <SOAPTabContent
                    medicalRecord={recordData.medicalRecord}
                    onUpdate={onUpdateRecord}
                    onSave={onSaveSOAP}
                    isLocked={isLocked}
                />
            </TabsContent>

            <TabsContent value="diagnosis" className="mt-6">
                <DiagnosisTabContent
                    medicalRecordId={recordData.medicalRecord.id}
                    diagnoses={recordData.diagnoses}
                    onUpdate={onUpdate}
                    isLocked={isLocked}
                />
            </TabsContent>

            <TabsContent value="prescription" className="mt-6">
                <PrescriptionTabContent
                    medicalRecordId={recordData.medicalRecord.id}
                    prescriptions={recordData.prescriptions}
                    onUpdate={onUpdate}
                    isLocked={isLocked}
                />
            </TabsContent>

            <TabsContent value="procedure" className="mt-6">
                <ProcedureTabContent
                    medicalRecordId={recordData.medicalRecord.id}
                    procedures={recordData.procedures}
                    onUpdate={onUpdate}
                    isLocked={isLocked}
                />
            </TabsContent>
        </Tabs>
    );
}
