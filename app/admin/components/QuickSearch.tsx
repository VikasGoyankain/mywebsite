import { useState, useMemo } from "react"
import { Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface QuickSearchProps {
  sections: AdminSection[]
  onSectionClick: (sectionId: string) => void
}

export function QuickSearch({ sections, onSectionClick }: QuickSearchProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (sectionId: string) => {
    onSectionClick(sectionId)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Quick search admin sections...
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search admin sections..." />
        <CommandList>
          <CommandEmpty>No sections found.</CommandEmpty>
          {['frequent', 'content', 'management', 'tools'].map(category => {
            const categorySections = sections.filter(s => s.category === category)
            if (categorySections.length === 0) return null
            
            return (
              <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                {categorySections.map(section => (
                  <CommandItem
                    key={section.id}
                    onSelect={() => handleSelect(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
} 