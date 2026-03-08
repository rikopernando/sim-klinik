/**
 * Medical Record Tabs Component
 * Optimized tab rendering with React.memo to prevent unnecessary re-renders
 * Each tab now fetches its own data lazily when activated
 */

import { memo } from "react"
import { FileText, Stethoscope, Pill, ClipboardList } from "lucide-react"
import { IconFlask } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type MedicalRecordCoreData } from "@/types/medical-record"

import { SoapForm } from "./soap-form"
import { DiagnosisTab } from "./diagnosis-tab"
import { PrescriptionTab } from "./prescription-tab"
import { ProcedureTab } from "./procedure-tab"
import { LabOrdersTab } from "./lab-orders-tab"

interface MedicalRecordTabsProps {
  coreData: MedicalRecordCoreData
  activeTab: string
  isLocked: boolean
  onTabChange: (value: string) => void
  onUpdateRecord: (updates: Partial<MedicalRecordCoreData["medicalRecord"]>) => void
  onSaveSOAP: (soapData: {
    soapSubjective?: string
    soapObjective?: string
    soapAssessment?: string
    soapPlan?: string
  }) => Promise<void>
}

// Memoized SOAP tab to prevent re-renders when other tabs are active
const SOAPTabContent = memo(function SOAPTabContent({
  medicalRecord,
  onUpdate,
  onSave,
  isLocked,
}: {
  medicalRecord: MedicalRecordCoreData["medicalRecord"]
  onUpdate: (updates: Partial<MedicalRecordCoreData["medicalRecord"]>) => void
  onSave: (soapData: {
    soapSubjective?: string
    soapObjective?: string
    soapAssessment?: string
    soapPlan?: string
  }) => Promise<void>
  isLocked: boolean
}) {
  return (
    <SoapForm
      medicalRecord={medicalRecord}
      onUpdate={onUpdate}
      onSave={onSave}
      isLocked={isLocked}
    />
  )
})

// Memoized Diagnosis tab - now fetches its own data
const DiagnosisTabContent = memo(function DiagnosisTabContent({
  visitId,
  medicalRecordId,
  isLocked,
}: {
  visitId: string
  medicalRecordId: string
  isLocked: boolean
}) {
  return <DiagnosisTab visitId={visitId} medicalRecordId={medicalRecordId} isLocked={isLocked} />
})

// Memoized Prescription tab - now fetches its own data
const PrescriptionTabContent = memo(function PrescriptionTabContent({
  visitId,
  medicalRecordId,
  isLocked,
}: {
  visitId: string
  medicalRecordId: string
  isLocked: boolean
}) {
  return <PrescriptionTab visitId={visitId} medicalRecordId={medicalRecordId} isLocked={isLocked} />
})

// Memoized Procedure tab - now fetches its own data
const ProcedureTabContent = memo(function ProcedureTabContent({
  visitId,
  medicalRecordId,
  isLocked,
}: {
  visitId: string
  medicalRecordId: string
  isLocked: boolean
}) {
  return <ProcedureTab visitId={visitId} medicalRecordId={medicalRecordId} isLocked={isLocked} />
})

// Memoized Lab Orders tab
const LabOrdersTabContent = memo(function LabOrdersTabContent({
  visitId,
  patientId,
  isLocked,
}: {
  visitId: string
  patientId: string
  isLocked: boolean
}) {
  return <LabOrdersTab visitId={visitId} patientId={patientId} isLocked={isLocked} />
})

export function MedicalRecordTabs({
  coreData,
  activeTab,
  isLocked,
  onTabChange,
  onUpdateRecord,
  onSaveSOAP,
}: MedicalRecordTabsProps) {
  const { medicalRecord, visit } = coreData

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-5">
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
        <TabsTrigger value="lab-orders" className="gap-2">
          <IconFlask className="h-4 w-4" />
          Pemeriksaan Penunjang
        </TabsTrigger>
      </TabsList>

      <TabsContent value="soap" className="mt-6">
        <SOAPTabContent
          medicalRecord={medicalRecord}
          onUpdate={onUpdateRecord}
          onSave={onSaveSOAP}
          isLocked={isLocked}
        />
      </TabsContent>

      <TabsContent value="diagnosis" className="mt-6">
        <DiagnosisTabContent
          visitId={visit.id}
          medicalRecordId={medicalRecord.id}
          isLocked={isLocked}
        />
      </TabsContent>

      <TabsContent value="prescription" className="mt-6">
        <PrescriptionTabContent
          visitId={visit.id}
          medicalRecordId={medicalRecord.id}
          isLocked={isLocked}
        />
      </TabsContent>

      <TabsContent value="procedure" className="mt-6">
        <ProcedureTabContent
          visitId={visit.id}
          medicalRecordId={medicalRecord.id}
          isLocked={isLocked}
        />
      </TabsContent>

      <TabsContent value="lab-orders" className="mt-6">
        <LabOrdersTabContent visitId={visit.id} patientId={visit.patientId} isLocked={isLocked} />
      </TabsContent>
    </Tabs>
  )
}
