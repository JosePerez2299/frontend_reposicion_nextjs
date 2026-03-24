'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

export interface Option {
  id: string
  name: string
}

const ITEM_HEIGHT = 32
const VISIBLE_ITEMS = 8
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

function Checkbox({ checked, indeterminate = false }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div className={cn(
      'w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors',
      checked || indeterminate ? 'bg-primary border-primary' : 'border-border bg-background',
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

interface ComboboxVirtualListProps {
  options: Option[]
  selectedIds: string[]
  onToggle: (id: string) => void
  emptyText?: string
  emptySearch?: string  // texto cuando no hay búsqueda activa
}

export function ComboboxVirtualList({
  options,
  selectedIds,
  onToggle,
  emptyText = 'Sin resultados',
  emptySearch,
}: ComboboxVirtualListProps) {
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
        {emptySearch ?? emptyText}
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
        {virtualizer.getVirtualItems().map((vItem) => {
          const option = options[vItem.index]
          const isSelected = selectedIds.includes(option.id)
          return (
            <div
              key={option.id}
              style={{
                position: 'absolute',
                top: vItem.start,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
              }}
              className={cn(
                'flex items-center gap-2 px-2 text-xs cursor-pointer transition-colors select-none',
                isSelected ? 'bg-primary/5' : 'hover:bg-secondary',
              )}
              onClick={() => onToggle(option.id)}
            >
              <Checkbox checked={isSelected} />
              <span className="truncate">{option.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}