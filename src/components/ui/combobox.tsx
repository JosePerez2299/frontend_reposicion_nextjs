'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Option {
  id: string
  name: string
}

interface ComboboxProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = options.find(o => o.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-8 text-xs justify-between font-normal', className)}
        >
          <span className="truncate">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown size={12} className="ml-2 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {/* opción para limpiar */}
              <CommandItem
                value=""
                onSelect={() => { onChange(''); setOpen(false) }}
                className="text-xs text-muted-foreground"
              >
                <Check size={12} className={cn('mr-2', value === '' ? 'opacity-100' : 'opacity-0')} />
                Todas
              </CommandItem>
              {options.map(option => (
                <CommandItem
                  key={option.id}
                  value={option.name}  // busca por name, no por id
                  onSelect={() => { onChange(option.id); setOpen(false) }}
                  className="text-xs"
                >
                  <Check
                    size={12}
                    className={cn('mr-2', value === option.id ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}