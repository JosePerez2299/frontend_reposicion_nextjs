
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrdersQuery } from "@/features/pedidos/queries/pedidos.queries";

type StoreCellSheetData = {
  product_name: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoreCellSheetData | null;
};

export function StoreCellSheet({ open, onOpenChange, data }: Props) {
 
  const { data: orders, isLoading, isError } = useOrdersQuery();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
       
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
