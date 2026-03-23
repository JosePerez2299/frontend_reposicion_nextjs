"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

interface DatePickerWithRangeProps {
  value?: DateRange
  onChange?: (value: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  numberOfMonths?: number
  minDate?: Date
  maxDate?: Date
  disabledDays?: React.ComponentProps<typeof Calendar>["disabled"]
}

export function DatePickerWithRange({
  value,
  onChange,
  placeholder = "Selecciona fechas",
  disabled = false,
  className,
  id = "date-picker-range",
  numberOfMonths = 2,
  minDate,
  maxDate,
  disabledDays,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false)

  const computedDisabledDays = React.useMemo(() => {
    if (disabledDays !== undefined) return disabledDays
    const matchers: React.ComponentProps<typeof Calendar>["disabled"][] = []
    if (minDate) matchers.push({ before: minDate })
    if (maxDate) matchers.push({ after: maxDate })
    return matchers.length > 0 ? (matchers as unknown as React.ComponentProps<typeof Calendar>["disabled"]) : undefined
  }, [disabledDays, minDate, maxDate])

  const triggerLabel = React.useMemo(() => {
    if (!value?.from) return <span className="text-muted-foreground truncate">{placeholder}</span>
    if (value.to) {
      return (
        <span className="truncate">
          {format(value.from, "dd/MM/y")} - {format(value.to, "dd/MM/y")}
        </span>
      )
    }
    return <span className="truncate">{format(value.from, "dd/MM/y")}</span>
  }, [placeholder, value?.from, value?.to])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          disabled={disabled}
          className={cn(
            "h-8 text-xs justify-between font-normal",
            value?.from && "border-primary/40",
            className,
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <CalendarIcon size={14} className="flex-shrink-0" />
            {triggerLabel}
          </span>
          <ChevronsUpDown size={11} className="ml-2 flex-shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          fromDate={minDate}
          toDate={maxDate}
          disabled={computedDisabledDays}
          onSelect={(next) => {
            onChange?.(next)
          }}
          numberOfMonths={numberOfMonths}
        />
      </PopoverContent>
    </Popover>
  )
}
