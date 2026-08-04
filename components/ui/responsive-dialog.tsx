"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean }>({ isMobile: false })

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()
  return (
    <ResponsiveDialogContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)
  if (isMobile) return <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
}

function ResponsiveDialogContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)
  if (isMobile) {
    return (
      <DrawerContent>
        <div className="overflow-y-auto px-4 pb-6">{children}</div>
      </DrawerContent>
    )
  }
  return (
    <DialogContent className={cn("max-h-[90vh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  )
}

function ResponsiveDialogHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)
  if (isMobile) {
    return <DrawerHeader className={cn("text-left", className)}>{children}</DrawerHeader>
  }
  return <DialogHeader className={className}>{children}</DialogHeader>
}

function ResponsiveDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)
  if (isMobile) return <DrawerTitle className={className}>{children}</DrawerTitle>
  return <DialogTitle className={className}>{children}</DialogTitle>
}

function ResponsiveDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)
  if (isMobile) return <DrawerDescription className={className}>{children}</DrawerDescription>
  return <DialogDescription className={className}>{children}</DialogDescription>
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
}
