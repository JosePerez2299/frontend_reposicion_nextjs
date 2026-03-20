'use client'

import { useState, useMemo, useRef } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Option {
  id: string
  name: string
}

interface ComboboxSingleProps {
  multi?: false
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

interface ComboboxMultiProps {
  multi: true
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps

function Checkbox({ checked, indeterminate = false }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div className={cn(
      'w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors',
      checked || indeterminate
        ? 'bg-primary border-primary'
        : 'border-border bg-background'
    )}>
      {indeterminate && !checked && (
        <div className="w-2 h-[1.5px] bg-primary-foreground rounded-full" />
      )}
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

const ITEM_HEIGHT   = 32
const VISIBLE_ITEMS = 8
const LIST_HEIGHT   = ITEM_HEIGHT * VISIBLE_ITEMS

interface VirtualListProps {
  options: Option[]
  selectedIds: string[]
  onToggle: (id: string) => void
  emptyText: string
}

function VirtualList({ options, selectedIds, onToggle, emptyText }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  if (options.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground">
        {emptyText}
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      style={{ height: Math.min(LIST_HEIGHT, options.length * ITEM_HEIGHT), overflow: 'auto' }}
      className="scrollbar-thin"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vItem => {
          const option    = options[vItem.index]
          const isChecked = selectedIds.includes(option.id)
          return (
            <div
              key={option.id}
              style={{
                position: 'absolute',
                top:    vItem.start,
                left:   0,
                right:  0,
                height: ITEM_HEIGHT,
              }}
              className={cn(
                'flex items-center gap-2 px-2 text-xs cursor-pointer transition-colors select-none',
                isChecked ? 'bg-primary/5' : 'hover:bg-secondary'
              )}
              onClick={() => onToggle(option.id)}
            >
              <Checkbox checked={isChecked} />
              <span className="truncate">{option.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder       = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyText         = 'Sin resultados',
    disabled          = false,
    className,
  } = props

  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')

  const isMulti     = props.multi === true
  const selectedIds = isMulti ? props.value : props.value ? [props.value] : []
  const count       = selectedIds.length

  const visibleOptions = useMemo(() =>
    search.trim()
      ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
      : options,
    [options, search]
  )

  const visibleIds    = visibleOptions.map(o => o.id)
  const allVisibleOn  = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))
  const someVisibleOn = visibleIds.some(id => selectedIds.includes(id)) && !allVisibleOn

  const toggle = (id: string) => {
    if (!isMulti) {
      props.onChange(props.value === id ? '' : id)
      setOpen(false)
      return
    }
    const current = props.value
    props.onChange(
      current.includes(id)
        ? current.filter(v => v !== id)
        : [...current, id]
    )
  }

  const toggleSelectAll = () => {
    if (!isMulti) return
    if (allVisibleOn) {
      props.onChange(props.value.filter(id => !visibleIds.includes(id)))
    } else {
      props.onChange(Array.from(new Set([...props.value, ...visibleIds])))
    }
  }

  const triggerContent = () => {
    if (!isMulti) {
      const selected = options.find(o => o.id === props.value)
      return selected
        ? <span className="truncate">{selected.name}</span>
        : <span className="text-muted-foreground truncate">{placeholder}</span>
    }
    if (count === 0) {
      return <span className="text-muted-foreground truncate">{placeholder}</span>
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
          {count}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {count === 1
            ? options.find(o => o.id === selectedIds[0])?.name
            : 'seleccionados'}
        </span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch('') }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-8 text-xs justify-between font-normal',
            count > 0 && 'border-primary/40',
            className
          )}
        >
          {triggerContent()}
          <ChevronsUpDown size={11} className="ml-2 flex-shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0" align="start">

        {/* search */}
        <div className="border-b border-border px-2 py-1.5">
        <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
            'w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground',
            'h-7 px-2 rounded-md border border-border focus:border-primary transition-colors'
            )}
            autoFocus
        />
        </div>

        {/* select all — solo multi */}
        {isMulti && visibleOptions.length > 0 && (
          <div
            className={cn(
              'flex items-center gap-2 px-2 text-xs cursor-pointer border-b border-border transition-colors select-none',
              'h-8 text-muted-foreground hover:bg-secondary font-medium'
            )}
            onClick={toggleSelectAll}
          >
            <Checkbox checked={allVisibleOn} indeterminate={someVisibleOn} />
            <span>
              {search.trim()
                ? `Seleccionar "${search}" (${visibleOptions.length})`
                : `Seleccionar todos (${visibleOptions.length})`}
            </span>
          </div>
        )}

        {/* opción limpiar — solo single */}
        {!isMulti && (
          <div
            className="flex items-center gap-2 px-2 h-8 text-xs cursor-pointer border-b border-border text-muted-foreground hover:bg-secondary transition-colors"
            onClick={() => { props.onChange(''); setOpen(false) }}
          >
            <Checkbox checked={!props.value} />
            Todas
          </div>
        )}

        {/* lista virtualizada */}
        <VirtualList
          options={visibleOptions}
          selectedIds={selectedIds}
          onToggle={toggle}
          emptyText={emptyText}
        />

        {/* footer conteo — solo multi */}
        {isMulti && count > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {count} seleccionado{count > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => props.onChange([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          </div>
        )}

      </PopoverContent>
    </Popover>
  )
}