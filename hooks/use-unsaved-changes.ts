"use client"

import { useEffect } from "react"

const MSG = "Ada perubahan SOAP yang belum disimpan. Yakin ingin meninggalkan halaman ini?"

/**
 * Guards against accidental navigation when there are unsaved changes.
 * Covers three cases:
 * - Close tab / refresh / external URL (beforeunload)
 * - Browser back / forward button (popstate)
 * - Internal Next.js navigation via link clicks (click capture)
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    const popStateHandler = () => {
      if (!window.confirm(MSG)) {
        window.history.pushState(null, "", window.location.href)
      }
    }

    const linkClickHandler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return
      if ((anchor as HTMLAnchorElement).target === "_blank") return
      if (!window.confirm(MSG)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener("beforeunload", beforeUnloadHandler)
    window.addEventListener("popstate", popStateHandler)
    document.addEventListener("click", linkClickHandler, true)

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
      window.removeEventListener("popstate", popStateHandler)
      document.removeEventListener("click", linkClickHandler, true)
    }
  }, [hasUnsavedChanges])
}
