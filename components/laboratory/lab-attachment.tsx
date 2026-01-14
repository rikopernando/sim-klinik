/**
 * Order Detail Dialog Component
 * Comprehensive view of lab order with results and timeline
 * Refactored for modularity, type safety, and performance
 */

"use client"

import Image from "next/image"
import { memo } from "react"
import { IconEye, IconPaperclip, IconDownload, IconFile } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AttachmentSectionProps {
  attachmentUrl: string
  attachmentType: string | null
  orderNumber: string | null
}

const AttachmentSection = memo(
  ({ attachmentUrl, attachmentType, orderNumber }: AttachmentSectionProps) => (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center gap-2">
        <IconPaperclip className="text-primary h-4 w-4" />
        <p className="text-muted-foreground text-xs font-medium">Lampiran File</p>
        <Badge variant="secondary" className="text-xs">
          {attachmentType}
        </Badge>
      </div>

      {/* Image Preview for JPEG/PNG */}
      {(attachmentType === "JPEG" || attachmentType === "PNG" || attachmentUrl) && (
        <div className="relative mb-3 h-[350px] overflow-hidden rounded-md border">
          <Image
            src={attachmentUrl}
            alt="Lab result attachment"
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
            fill
          />
        </div>
      )}

      {/* File Icon for PDF/DICOM */}
      {(attachmentType === "PDF" || attachmentType === "DICOM") && (
        <div className="bg-muted/30 mb-3 flex items-center justify-center rounded-md border py-8">
          <div className="text-muted-foreground text-center">
            <IconFile className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm font-medium">{attachmentType} File</p>
          </div>
        </div>
      )}

      {/* Download/View Button */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => window.open(attachmentUrl, "_blank")}
        >
          <IconEye className="mr-2 h-4 w-4" />
          Lihat File
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            const link = document.createElement("a")
            link.href = attachmentUrl
            link.download = `lab-result-${orderNumber ?? ""}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
        >
          <IconDownload className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
)

AttachmentSection.displayName = "AttachmentSection"

export default AttachmentSection
