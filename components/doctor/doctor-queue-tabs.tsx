import { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QueueItem, QueuePatient } from "@/types/dashboard"
import { Clock, Activity, FileText, Users, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorQueueTabsProps {
  waitingQueue: QueueItem[]
  inProgressQueue: QueueItem[]
  unlockedQueue: QueueItem[]
  startingExamination: string | null
  onStartExamination: (visitId: string) => void
  onOpenMedicalRecord: (visitId: string) => void
  onViewHistory: (patient: QueuePatient | null) => void
  onEditVisit?: (item: QueueItem) => void
  headerAction?: ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

function getWaitMinutes(arrivalTime: string): number {
  return Math.floor((Date.now() - new Date(arrivalTime).getTime()) / 60000)
}

function formatWait(minutes: number): string {
  if (minutes < 1) return "Baru tiba"
  if (minutes < 60) return `${minutes} mnt`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}j ${m}m` : `${h} jam`
}

function EmptyState({ message, subtext }: { message: string; subtext?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
      <Users className="text-muted-foreground/40 h-8 w-8" />
      <p className="font-medium">{message}</p>
      {subtext && <p className="text-muted-foreground text-sm">{subtext}</p>}
    </div>
  )
}

export function DoctorQueueTabs({
  waitingQueue,
  inProgressQueue,
  unlockedQueue,
  startingExamination,
  onStartExamination,
  onOpenMedicalRecord,
  onViewHistory,
  onEditVisit,
  headerAction,
  activeTab = "waiting",
  onTabChange,
}: DoctorQueueTabsProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="inline-flex">
            <TabsTrigger value="waiting" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Menunggu
              {waitingQueue.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {waitingQueue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Diperiksa
              {inProgressQueue.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {inProgressQueue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unlocked" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              RME Belum Dikunci
              {unlockedQueue.length > 0 && (
                <span className="bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {unlockedQueue.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Date filter — fix: was silently dropped before */}
          {headerAction && <div>{headerAction}</div>}
        </div>

        {/* Waiting Queue */}
        <TabsContent value="waiting" className="mt-3">
          {waitingQueue.length === 0 ? (
            <EmptyState
              message="Tidak ada pasien dalam antrian"
              subtext="Antrian kosong untuk saat ini"
            />
          ) : (
            <div className="max-h-[450px] space-y-2 overflow-y-auto">
              {waitingQueue.map((item, index) => {
                const waitMins = getWaitMinutes(item.visit.arrivalTime)
                const isLongWait = waitMins >= 30
                return (
                  <div
                    key={item.visit.id}
                    className={cn(
                      "bg-card flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md",
                      index === 0 && "border-primary/40 bg-primary/5"
                    )}
                    onClick={() => onViewHistory(item.patient)}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.visit.queueNumber && (
                        <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums">
                          {item.visit.queueNumber}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-semibold">{item.patient?.name ?? "—"}</p>
                          {item.patient?.gender && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              {item.patient.gender === "male" ? "L" : "P"}
                            </Badge>
                          )}
                          {index === 0 && (
                            <span className="rounded-full bg-[#74c69d] px-2 py-0.5 text-[10px] font-medium text-white">
                              Sekarang
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-xs">
                          <span>{item.visit.visitNumber}</span>
                          {item.poli?.name && (
                            <>
                              <span>·</span>
                              <span>{item.poli.name}</span>
                            </>
                          )}
                          <span>·</span>
                          <span
                            className={cn(
                              "font-medium",
                              isLongWait
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatWait(waitMins)}
                          </span>
                        </div>
                        {item.visit.visitType === "emergency" && item.visit.chiefComplaint && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs italic">
                            {item.visit.chiefComplaint}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge
                        variant={item.visit.visitType === "emergency" ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {item.visit.visitType === "emergency" ? "UGD" : "Rawat Jalan"}
                      </Badge>
                      {onEditVisit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditVisit(item)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={startingExamination !== null}
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartExamination(item.visit.id)
                        }}
                      >
                        {startingExamination === item.visit.id ? "Memulai..." : "Mulai"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* In Progress Queue */}
        <TabsContent value="in_progress" className="mt-3">
          {inProgressQueue.length === 0 ? (
            <EmptyState
              message="Tidak ada pasien yang sedang diperiksa"
              subtext="Mulai pemeriksaan dari tab Menunggu"
            />
          ) : (
            <div className="max-h-[450px] space-y-2 overflow-y-auto">
              {inProgressQueue.map((item) => {
                const waitMins = getWaitMinutes(item.visit.arrivalTime)
                return (
                  <div
                    key={item.visit.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-blue-50/60 px-4 py-3 shadow-sm transition-all hover:shadow-md dark:bg-blue-950/20"
                    onClick={() => onViewHistory(item.patient)}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-semibold">{item.patient?.name ?? "—"}</p>
                          {item.patient?.gender && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              {item.patient.gender === "male" ? "L" : "P"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-xs">
                          <span>{item.visit.visitNumber}</span>
                          {item.poli?.name && (
                            <>
                              <span>·</span>
                              <span>{item.poli.name}</span>
                            </>
                          )}
                          <span>·</span>
                          <span className="font-medium">{formatWait(waitMins)}</span>
                        </div>
                        {item.visit.visitType === "emergency" && item.visit.chiefComplaint && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs italic">
                            {item.visit.chiefComplaint}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge className="border-0 bg-blue-100 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        Dalam Pemeriksaan
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenMedicalRecord(item.visit.id)
                        }}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Unlocked Medical Records */}
        <TabsContent value="unlocked" className="mt-3">
          {unlockedQueue.length === 0 ? (
            <EmptyState
              message="Semua RME sudah dikunci"
              subtext="Tidak ada rekam medis yang perlu dikunci"
            />
          ) : (
            <div className="max-h-[450px] space-y-2 overflow-y-auto">
              {unlockedQueue.map((item) => (
                <div
                  key={item.visit.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 shadow-sm transition-all hover:shadow-md dark:border-orange-900/50 dark:bg-orange-950/20"
                  onClick={() => onOpenMedicalRecord(item.visit.id)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                      <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold">{item.patient?.name ?? "—"}</p>
                        {item.patient?.gender && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            {item.patient.gender === "male" ? "L" : "P"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.visit.visitNumber}
                        {item.poli?.name ? ` · ${item.poli.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge className="border-0 bg-orange-100 text-xs text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                      Belum Dikunci
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenMedicalRecord(item.visit.id)
                      }}
                    >
                      Kunci RME
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
