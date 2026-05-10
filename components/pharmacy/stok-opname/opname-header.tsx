"use client"

import Link from "next/link"
import { ClipboardCheck, History, Download, Save, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OpnameHeaderProps {
  isSessionActive: boolean
  totalChanged: number
  currentPageChangedCount: number
  isSaving: boolean
  isLoading: boolean
  showOnlyChanged: boolean
  onExport: () => void
  onSave: () => void
  onSaveAll: () => void
  onStartSession: () => void
  onEndSession: () => void
}

export function OpnameHeader({
  isSessionActive,
  totalChanged,
  currentPageChangedCount,
  isSaving,
  isLoading,
  showOnlyChanged,
  onExport,
  onSave,
  onSaveAll,
  onStartSession,
  onEndSession,
}: OpnameHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl">
          <ClipboardCheck className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Stok Opname</h1>
          <p className="text-muted-foreground text-sm">Cocokan stok fisik dengan data sistem</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/pharmacy/stok-opname/history">
            <History className="h-3.5 w-3.5" />
            <span className="ml-1.5">Riwayat</span>
          </Link>
        </Button>

        {isSessionActive && (
          <>
            <Button variant="outline" size="sm" onClick={onExport} disabled={totalChanged === 0}>
              <Download className="h-3.5 w-3.5" />
              <span className="ml-1.5">Export CSV</span>
              {totalChanged > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">
                  {totalChanged}
                </Badge>
              )}
            </Button>

            {!showOnlyChanged && (
              <SavePageDialog
                count={currentPageChangedCount}
                totalChanged={totalChanged}
                disabled={isLoading || isSaving || currentPageChangedCount === 0}
                onSave={onSave}
              />
            )}

            <SaveAllDialog
              totalChanged={totalChanged}
              disabled={isLoading || isSaving || totalChanged === 0}
              onSaveAll={onSaveAll}
            />
          </>
        )}

        {!isSessionActive ? (
          <Button size="sm" onClick={onStartSession}>
            <Play className="h-3.5 w-3.5" />
            <span className="ml-1.5">Mulai Opname</span>
          </Button>
        ) : (
          <EndSessionDialog totalChanged={totalChanged} onEndSession={onEndSession} />
        )}
      </div>
    </div>
  )
}

function SavePageDialog({
  count,
  totalChanged,
  disabled,
  onSave,
}: {
  count: number
  totalChanged: number
  disabled: boolean
  onSave: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Save className="h-3.5 w-3.5" />
          <span className="ml-1.5">Simpan Halaman Ini</span>
          {count > 0 && (
            <span className="bg-primary/20 ml-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
              {count}
            </span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan Halaman Ini</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Simpan <strong>{count} perubahan</strong> pada halaman ini? Stok sistem akan
                diperbarui dan riwayat akan dicatat.
              </p>
              {totalChanged > count && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  Ada <strong>{totalChanged - count} perubahan</strong> di halaman lain yang belum
                  disimpan.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onSave}>Ya, Simpan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SaveAllDialog({
  totalChanged,
  disabled,
  onSaveAll,
}: {
  totalChanged: number
  disabled: boolean
  onSaveAll: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Save className="h-3.5 w-3.5" />
          <span className="ml-1.5">Simpan Semua</span>
          {totalChanged > 0 && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              {totalChanged}
            </span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan Semua Perubahan</AlertDialogTitle>
          <AlertDialogDescription>
            Simpan <strong>{totalChanged} perubahan</strong> dari semua halaman? Stok sistem akan
            diperbarui sekaligus dan riwayat akan dicatat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onSaveAll}>Ya, Simpan Semua</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EndSessionDialog({
  totalChanged,
  onEndSession,
}: {
  totalChanged: number
  onEndSession: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Square className="h-3.5 w-3.5" />
          <span className="ml-1.5">Selesai Opname</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Akhiri Sesi Opname?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Sesi opname akan diakhiri dan semua perubahan yang belum disimpan akan dibatalkan.
              </p>
              {totalChanged > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  <strong>{totalChanged} perubahan belum disimpan</strong> akan hilang. Simpan
                  terlebih dahulu sebelum mengakhiri sesi.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <AlertDialogAction
            onClick={onEndSession}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Ya, Akhiri Sesi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
