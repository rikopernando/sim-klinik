"use client"

import { PageGuard } from "@/components/auth/page-guard"
import { OpnameHeader } from "@/components/pharmacy/stok-opname/opname-header"
import { OpnameTable } from "@/components/pharmacy/stok-opname/opname-table"
import { useStokOpname } from "@/hooks/use-stok-opname"

export default function StokOpnamePage() {
  return (
    <PageGuard permissions={["pharmacy:manage_inventory"]}>
      <StokOpnameContent />
    </PageGuard>
  )
}

function StokOpnameContent() {
  const {
    pagination,
    isLoading,
    isSaving,
    search,
    debouncedSearch,
    page,
    isSessionActive,
    sessionStart,
    showOnlyChanged,
    changesMap,
    changedEntries,
    totalChanged,
    currentPageChanged,
    displayRows,
    setSearch,
    setPage,
    setShowOnlyChanged,
    refresh,
    getDisplayValue,
    handleActualChange,
    handleSetZero,
    handleStartSession,
    handleEndSession,
    handleSave,
    handleSaveAll,
    handleExport,
  } = useStokOpname()

  return (
    <div className="container mx-auto max-w-5xl space-y-5 p-6">
      <OpnameHeader
        isSessionActive={isSessionActive}
        totalChanged={totalChanged}
        currentPageChangedCount={currentPageChanged.length}
        isSaving={isSaving}
        isLoading={isLoading}
        showOnlyChanged={showOnlyChanged}
        onExport={handleExport}
        onSave={handleSave}
        onSaveAll={handleSaveAll}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
      />

      {isSessionActive && sessionStart && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/30">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>Sesi opname aktif</strong> · Dimulai{" "}
            {sessionStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}

      {totalChanged > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {totalChanged}
            </span>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{totalChanged} batch</strong> diubah, belum tersimpan
            {currentPageChanged.length > 0
              ? ` — ${currentPageChanged.length} ada di halaman ini`
              : " — tidak ada di halaman ini"}
          </p>
        </div>
      )}

      <OpnameTable
        displayRows={displayRows}
        changesMap={changesMap}
        changedEntries={changedEntries}
        pagination={pagination}
        isLoading={isLoading}
        isSaving={isSaving}
        isSessionActive={isSessionActive}
        showOnlyChanged={showOnlyChanged}
        search={search}
        debouncedSearch={debouncedSearch}
        totalChanged={totalChanged}
        page={page}
        onSearchChange={(v) => {
          setSearch(v)
          if (showOnlyChanged) setShowOnlyChanged(false)
        }}
        onShowOnlyChangedToggle={() => setShowOnlyChanged((v) => !v)}
        onRefresh={refresh}
        onPageChange={setPage}
        onActualChange={handleActualChange}
        onSetZero={handleSetZero}
        getDisplayValue={getDisplayValue}
      />

      {!isSessionActive && (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Klik <strong>Mulai Opname</strong> untuk mengaktifkan pengeditan stok.
          </p>
        </div>
      )}
    </div>
  )
}
