import { LAB_DEPARTMENTS } from "@/types/lab"
import { Badge } from "@/components/ui/badge"

const LabBadge = ({ departement }: { departement: keyof typeof LAB_DEPARTMENTS }) => {
  if (departement === "LAB") {
    return (
      <Badge variant="secondary" className="text-xs">
        Laboratorium
      </Badge>
    )
  }

  if (departement === "RAD") {
    return (
      <Badge variant="default" className="text-xs">
        Radiologi
      </Badge>
    )
  }

  return <Badge className="bg-blue-500 text-xs text-white dark:bg-blue-600">EKG</Badge>
}

export default LabBadge
