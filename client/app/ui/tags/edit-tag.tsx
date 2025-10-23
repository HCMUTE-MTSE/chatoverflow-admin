import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: {
    name: string;
    displayName: string;
    description: string;
  };
}

export function DialogDemo({ open, onOpenChange, tag }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Make changes to your tag here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue={tag?.name || ""} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="displayName-1">Display Name</Label>
              <Input
                id="displayName-1"
                name="displayName"
                defaultValue={tag?.displayName || ""}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <Input
                id="description-1"
                name="description"
                defaultValue={tag?.description || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
