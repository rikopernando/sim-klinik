/**
 * Bed Assignment History Component
 * Displays timeline of all bed assignments for a patient
 */

"use client"

import { BedDouble, ArrowRight, User, Calendar, Coins } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BedAssignmentHistoryItem } from "@/types/inpatient"
import { formatDate, formatDateTime } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"

interface BedAssignmentHistoryProps {
  history: BedAssignmentHistoryItem[]
}

export function BedAssignmentHistory({ history }: BedAssignmentHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Bed</CardTitle>
          <CardDescription>Belum ada riwayat perpindahan bed</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Separate current and past assignments
  const currentAssignment = history.find((item) => !item.dischargedAt)
  const pastAssignments = history.filter((item) => item.dischargedAt)

  // Calculate total cost
  const totalCost = history.reduce((sum, item) => sum + parseFloat(item.totalCost), 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Riwayat Bed</CardTitle>
            <CardDescription>
              {history.length} total assignment{history.length > 1 ? "s" : ""}{" "}
              {pastAssignments.length > 0 && `(${pastAssignments.length} transfer)`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm">Total Biaya Kamar</div>
            <div className="text-lg font-bold">{formatCurrency(totalCost)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Assignment */}
          {currentAssignment && (
            <div className="border-l-4 border-l-green-500 bg-green-50 p-4 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 dark:bg-green-700">Aktif Sekarang</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <BedDouble className="text-muted-foreground h-5 w-5" />
                    <span className="font-semibold">
                      Kamar {currentAssignment.roomNumber} - Bed {currentAssignment.bedNumber}
                    </span>
                    <Badge variant="outline">{currentAssignment.roomType}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Masuk: {formatDate(currentAssignment.assignedAt)}</span>
                  </div>
                  {currentAssignment.assignedByName && (
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>Oleh: {currentAssignment.assignedByName}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 rounded-md bg-white p-2 dark:bg-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        {formatCurrency(parseFloat(currentAssignment.dailyRate))}
                      </span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm">{currentAssignment.days} hari</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(currentAssignment.totalCost))}
                    </span>
                  </div>
                  {currentAssignment.notes && (
                    <div className="text-muted-foreground mt-2 text-sm italic">
                      &quot;{currentAssignment.notes}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Past Assignments */}
          {pastAssignments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Riwayat Transfer:</h4>
              {pastAssignments.map((assignment, index) => {
                const nextAssignment = pastAssignments[index - 1] || currentAssignment
                return (
                  <div
                    key={assignment.id}
                    className="border-l-4 border-l-gray-300 bg-gray-50 p-4 dark:border-l-gray-700 dark:bg-gray-900/20"
                  >
                    <div className="flex items-center gap-2">
                      <BedDouble className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">
                        Kamar {assignment.roomNumber} - Bed {assignment.bedNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {assignment.roomType}
                      </Badge>
                      {nextAssignment && (
                        <>
                          <ArrowRight className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground text-sm">
                            Kamar {nextAssignment.roomNumber} - Bed {nextAssignment.bedNumber}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateTime(assignment.assignedAt)} -{" "}
                          {assignment.dischargedAt && formatDateTime(assignment.dischargedAt)}
                        </span>
                      </div>
                      {assignment.assignedByName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Oleh: {assignment.assignedByName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 rounded-md bg-white p-2 text-sm dark:bg-gray-950">
                      <div className="flex items-center gap-2">
                        <Coins className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          Rp {formatCurrency(parseFloat(assignment.dailyRate))}/hari
                        </span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span>{assignment.days} hari</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold">
                        {formatCurrency(parseFloat(assignment.totalCost))}
                      </span>
                    </div>

                    {assignment.notes && (
                      <div className="text-muted-foreground mt-2 text-sm italic">
                        &quot;{assignment.notes}&quot;
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
