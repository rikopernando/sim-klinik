"use client"

/**
 * Page Header Component
 * Reusable header with back button and title
 */

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description: string
  onBack: () => void
}

export function PageHeader({ title, description, onBack }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" onClick={onBack} className="w-fit gap-2">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
