'use client'

import { useState } from 'react'
import { ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface Option {
  id: string
  name: string
}

interface ComboboxAsyncProps {
  value: string
  onChange: (value: string) => void
  onSearchChange: (search: string) => void
  options: Option[]
  loading?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function ComboboxAsync({
  value,
  onChange,
  onSearchChange,
  options,
  loading = false,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados',
  disabled = false,
  className,
}: ComboboxAsyncProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.id === value)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    onSearchChange(val)
  }

  const handleSelect = (id: string) => {
    onChange(value === id ? '' : id)
    setOpen(false)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) {
      setSearch('')
      onSearchChange('')
    }
  }

  const triggerContent = selected ? (
    <span className="truncate">{selected.name}</span>
  ) : (
    <span className="text-muted-foreground truncate">{placeholder}</span>
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-8 text-xs justify-between font-normal',
            value && 'border-primary/40',
            className,
          )}
        >
          {triggerContent}
          <ChevronsUpDown size={11} className="ml-2 flex-shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0" align="start">
        {/* search */}
        <div className="border-b border-border px-2 py-1.5">
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={handleSearchChange}
            className={cn(
              'w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground',
              'h-7 px-2 rounded-md border border-border focus:border-primary transition-colors',
            )}
            autoFocus
          />
        </div>

        {/* opción limpiar */}
        <div
          className="flex items-center gap-2 px-2 h-8 text-xs cursor-pointer border-b border-border text-muted-foreground hover:bg-secondary transition-colors"
          onClick={() => { onChange(''); setOpen(false) }}
        >
          <div className={cn(
            'w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors',
            !value ? 'bg-primary border-primary' : 'border-border bg-background',
          )}>
            {!value && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          Todas
        </div>

        {/* lista */}
        <div className="max-h-[256px] overflow-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Buscando...
            </div>
          ) : options.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {search.trim() ? emptyText : 'Escribe para buscar'}
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.id === value
              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-center gap-2 px-2 h-8 text-xs cursor-pointer transition-colors select-none',
                    isSelected ? 'bg-primary/5' : 'hover:bg-secondary',
                  )}
                  onClick={() => handleSelect(option.id)}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'bg-primary border-primary' : 'border-border bg-background',
                  )}>
                    {isSelected && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{option.name}</span>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}