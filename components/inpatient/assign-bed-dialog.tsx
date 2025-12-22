/**
 * Assign Bed Dialog Component
 * Allows nurses/admin to assign patients to available beds
 */

import { toast } from "sonner"
import { useState, useMemo, useEffect, Fragment } from "react"
import { useSearchParams } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldSet, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAvailableRooms } from "@/hooks/use-available-rooms"
import { useBedAssignment } from "@/hooks/use-bed-assignment"
import { searchUnassignedPatients } from "@/lib/services/inpatient.service"
import { clearQueryString } from "@/lib/utils/url"

interface AssignBedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preSelectedRoomId?: string
  onSuccess?: () => void
}

interface PatientSearchResult {
  id: string
  mrNumber: string
  name: string
  visit: {
    id: string
    visitNumber: string
  }
}

export function AssignBedDialog({
  open,
  onOpenChange,
  preSelectedRoomId,
  onSuccess,
}: AssignBedDialogProps) {
  const searchParams = useSearchParams()
  const preSelectedVisitId = searchParams.get("assignBed")
  const preSelectedVisitNumber = searchParams.get("visitNumber")
  const preSelectedPatientName = searchParams.get("patientName")
  const preSelectedMrNumber = searchParams.get("mrNumber")

  // State
  const [patientSearch, setPatientSearch] = useState("")
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<PatientSearchResult | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState(preSelectedRoomId || "")
  const [bedNumber, setBedNumber] = useState("")
  const [notes, setNotes] = useState("")

  // Auto-select preselected visit when dialog opens
  useEffect(() => {
    if (open && preSelectedVisitId) {
      // Create a mock visit object from the preselected data
      setSelectedVisit({
        id: "temp", // This will be replaced by actual data
        mrNumber: preSelectedMrNumber || "",
        name: preSelectedPatientName || "",
        visit: {
          id: preSelectedVisitId,
          visitNumber: preSelectedVisitNumber || "",
        },
      })
    }
  }, [
    open,
    preSelectedVisitId,
    preSelectedPatientName,
    preSelectedMrNumber,
    preSelectedVisitNumber,
  ])

  useEffect(() => {
    if (open && preSelectedRoomId) {
      setSelectedRoomId(preSelectedRoomId)
    }
  }, [open, preSelectedRoomId])

  // Hooks
  const { rooms, isLoading: roomsLoading } = useAvailableRooms()
  const { isAssigning, assignBed } = useBedAssignment({
    onSuccess: () => {
      handleClose()
      onSuccess?.()
    },
  })

  // Selected room details
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId)
  }, [rooms, selectedRoomId])

  // Search for inpatient visits without bed assignment
  const handlePatientSearch = async () => {
    if (!patientSearch.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await searchUnassignedPatients({ query: encodeURIComponent(patientSearch) })
      setSearchResults(response || [])
    } catch (error) {
      console.error("Patient search error:", error)
      setSearchResults([])
      toast.error("Terjadi kesalahan saat mencari pasien. Silakan coba lagi.")
    } finally {
      setIsSearching(false)
    }
  }

  // Validation
  const isValidBedNumber = useMemo(() => {
    if (!bedNumber.trim()) return false
    if (!selectedRoom) return true // Can't validate without room

    // Bed number should be between 1 and bedCount
    const bedNum = parseInt(bedNumber)
    return !isNaN(bedNum) && bedNum >= 1 && bedNum <= selectedRoom.bedCount
  }, [bedNumber, selectedRoom])

  const isValid = selectedVisit && selectedRoomId && bedNumber.trim() && isValidBedNumber

  // Handlers
  const handleSubmit = async () => {
    if (!isValid || !selectedVisit) return

    if (preSelectedVisitId) {
      clearQueryString()
    }

    await assignBed({
      visitId: selectedVisit.visit.id,
      roomId: selectedRoomId,
      bedNumber: bedNumber.trim(),
      notes: notes.trim() || undefined,
    })
  }

  const handleClose = () => {
    if (!isAssigning) {
      setPatientSearch("")
      setSearchResults([])
      setSelectedVisit(null)
      setSelectedRoomId("")
      setBedNumber("")
      setNotes("")
      onOpenChange(false)
    }
  }

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    setBedNumber("") // Reset bed number when room changes
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-165 max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alokasi Bed Pasien</DialogTitle>
          <DialogDescription>
            {selectedVisit
              ? `Alokasi bed untuk pasien ${selectedVisit.name}`
              : "Cari pasien rawat inap yang belum memiliki bed"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <FieldGroup>
            <FieldSet>
              <FieldGroup className="gap-4">
                {/* Patient Search */}
                {!selectedVisit && (
                  <Field>
                    <FieldLabel>
                      Cari Pasien <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nama pasien atau No. RM..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePatientSearch()
                          }
                        }}
                        disabled={isAssigning}
                      />
                      <Button
                        onClick={handlePatientSearch}
                        disabled={!patientSearch.trim() || isSearching || isAssigning}
                        variant="outline"
                      >
                        {isSearching ? "Mencari..." : "Cari"}
                      </Button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="bg-muted/50 mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                        {searchResults.map((patient, index) => (
                          <Fragment key={patient.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVisit(patient)
                                setSearchResults([])
                                setPatientSearch("")
                              }}
                              className="hover:bg-muted w-full rounded p-2 text-left text-sm transition-colors"
                            >
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-muted-foreground text-xs">
                                MR: {patient.mrNumber} • Kunjungan: {patient.visit.visitNumber}
                              </p>
                            </button>
                            {searchResults.length - 1 !== index && <Separator />}
                          </Fragment>
                        ))}
                      </div>
                    )}
                    {isSearching && (
                      <p className="text-muted-foreground text-xs">Mencari pasien...</p>
                    )}
                    {searchResults.length === 0 && !isSearching && (
                      <p className="text-muted-foreground text-xs">Tidak ada hasil pencarian</p>
                    )}
                  </Field>
                )}

                {/* Selected Patient Info */}
                {selectedVisit && (
                  <div className="bg-primary/10 rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{selectedVisit.name}</p>
                        <p className="text-muted-foreground text-xs">
                          MR: {selectedVisit.mrNumber}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Kunjungan: {selectedVisit.visit.visitNumber}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVisit(null)}
                        disabled={isAssigning}
                      >
                        Ubah
                      </Button>
                    </div>
                  </div>
                )}

                {/* Room Selection */}
                <Field>
                  <FieldLabel>
                    Kamar <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={selectedRoomId}
                    onValueChange={handleRoomChange}
                    disabled={isAssigning}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kamar yang tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomsLoading ? (
                        <SelectItem value="loading" disabled>
                          Memuat data kamar...
                        </SelectItem>
                      ) : rooms.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Tidak ada kamar tersedia
                        </SelectItem>
                      ) : (
                        rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Kamar {room.roomNumber} - {room.roomType} ({room.availableBeds} bed
                            tersedia)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedRoom && (
                    <p className="text-muted-foreground text-xs">
                      Tarif: Rp {parseFloat(selectedRoom.dailyRate).toLocaleString("id-ID")}/hari
                      {selectedRoom.floor && ` • Lantai ${selectedRoom.floor}`}
                      {selectedRoom.building && ` • ${selectedRoom.building}`}
                    </p>
                  )}
                </Field>

                {/* Bed Number Input */}
                <Field>
                  <FieldLabel>
                    Nomor Bed <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    placeholder={
                      selectedRoom ? `1 - ${selectedRoom.bedCount}` : "Pilih kamar terlebih dahulu"
                    }
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    disabled={!selectedRoomId || isAssigning}
                    min={1}
                    max={selectedRoom?.bedCount || 1}
                  />
                  {bedNumber && !isValidBedNumber && selectedRoom && (
                    <p className="text-destructive text-xs">
                      Nomor bed harus antara 1 dan {selectedRoom.bedCount}
                    </p>
                  )}
                  {selectedRoom && (
                    <p className="text-muted-foreground text-xs">
                      Kamar ini memiliki {selectedRoom.bedCount} bed
                    </p>
                  )}
                </Field>

                {/* Notes (Optional) */}
                <Field>
                  <FieldLabel>Catatan (Opsional)</FieldLabel>
                  <Textarea
                    placeholder="Catatan tambahan terkait alokasi bed ini..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isAssigning}
                    rows={3}
                  />
                </Field>

                {/* Facilities Info */}
                {selectedRoom?.facilities && (
                  <div className="bg-muted/50 rounded-lg border p-3">
                    <p className="text-sm font-medium">Fasilitas Kamar</p>
                    <p className="text-muted-foreground text-xs">{selectedRoom.facilities}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <Field orientation="horizontal">
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!isValid || isAssigning}
                      className="flex-1"
                    >
                      {isAssigning ? "Memproses..." : "Alokasikan Bed"}
                    </Button>
                    <Button onClick={handleClose} variant="outline" disabled={isAssigning}>
                      Batal
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
