/**
 * Create Lab Order Dialog Component
 * 2-step wizard for creating lab orders (select test → enter details)
 */

"use client"

import { useState } from "react"
import { IconFlask, IconPlus, IconArrowLeft, IconCheck } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCreateLabOrder } from "@/hooks/use-create-lab-order"
import { useLabTestPanels } from "@/hooks/use-lab-test-panels"
import type { LabTest, LabTestPanelWithTests, CreateLabOrderInput } from "@/types/lab"

import { LabTestCatalog } from "./lab-test-catalog"
import { LabOrderForm } from "./lab-order-form"
import { LabPanelCard } from "./lab-panel-card"

interface CreateLabOrderDialogProps {
  visitId: string
  patientId: string
  patientName?: string
  onSuccess?: () => void
}

export function CreateLabOrderDialog({
  visitId,
  patientId,
  patientName,
  onSuccess,
}: CreateLabOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)
  const [selectedPanel, setSelectedPanel] = useState<LabTestPanelWithTests | null>(null)

  const { panels, loading: panelsLoading } = useLabTestPanels()

  const { isCreating, createOrder } = useCreateLabOrder({
    onSuccess: () => {
      setOpen(false)
      setStep(1)
      setSelectedTest(null)
      setSelectedPanel(null)
      onSuccess?.()
    },
  })

  const handleSelectTest = (test: LabTest) => {
    setSelectedTest(test)
    setSelectedPanel(null) // Clear panel selection when test is selected
  }

  const handleSelectPanel = (panel: LabTestPanelWithTests) => {
    setSelectedPanel(panel)
    setSelectedTest(null) // Clear test selection when panel is selected
  }

  const handleContinue = () => {
    if (selectedTest || selectedPanel) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (formData: Omit<CreateLabOrderInput, "visitId" | "patientId">) => {
    await createOrder({
      visitId,
      patientId,
      ...formData,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setStep(1)
      setSelectedTest(null)
      setSelectedPanel(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Order Laboratorium
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFlask className="h-5 w-5" />
            Order Laboratorium & Radiologi
          </DialogTitle>
          {patientName && (
            <DialogDescription>
              Pasien: <strong>{patientName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-4">
          <div className="flex flex-1 items-center gap-2">
            <div
              className={`bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium`}
            >
              {step === 1 ? "1" : <IconCheck className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-medium">Pilih Tes</p>
              <p className="text-muted-foreground text-xs">Cari dan pilih pemeriksaan</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-border h-px w-[80%]" />
          </div>

          <div className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <div>
              <p className="text-sm font-medium">Detail Order</p>
              <p className="text-muted-foreground text-xs">Indikasi klinis & urgensi</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Quick Panels Section */}
              {!panelsLoading && panels.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Panel Pemeriksaan</h3>
                    <p className="text-muted-foreground text-xs">
                      Paket pemeriksaan dengan harga lebih hemat
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {panels.map((panel) => (
                      <LabPanelCard
                        key={panel.id}
                        panel={panel}
                        selected={selectedPanel?.id === panel.id}
                        onSelect={handleSelectPanel}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Separator between panels and individual tests */}
              {!panelsLoading && panels.length > 0 && (
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">atau pilih tes individual</span>
                  <Separator className="flex-1" />
                </div>
              )}

              {/* Individual Tests Catalog */}
              <LabTestCatalog onSelectTest={handleSelectTest} selectedTestId={selectedTest?.id} />

              {/* Continue Button */}
              {(selectedTest || selectedPanel) && (
                <div
                  style={{ width: "calc(100% + 48px)" }}
                  className="bg-background sticky -bottom-6 -mb-6 -ml-6 p-4"
                >
                  <Button onClick={handleContinue} className="w-full" size="lg">
                    Lanjut ke Detail Order
                    <IconArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <LabOrderForm
              selectedTest={selectedTest}
              selectedPanel={selectedPanel}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isSubmitting={isCreating}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
