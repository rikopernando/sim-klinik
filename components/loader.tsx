import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

function Loader({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-xs flex-col gap-4 [--radius:1rem]", className)}>
      <Item variant="outline">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">{message}</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}

export default Loader
