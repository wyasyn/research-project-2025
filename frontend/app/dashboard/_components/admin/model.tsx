"use client";
import * as React from "react";

import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PlusIcon } from "lucide-react";

export function Modal({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [open, setOpen] = React.useState(false);

  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  if (isDesktop) {
    return (
      <div className="flex items-center justify-end w-full py-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full"
              variant="default"
              size="icon"
              aria-label={title}
              title={title}
            >
              <PlusIcon size={16} aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
                <DialogDescription>Add user here</DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            <div>{children}</div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end w-full py-3">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            className="rounded-full"
            variant="outline"
            size="icon"
            aria-label={title}
            title={title}
          >
            <PlusIcon size={16} aria-hidden="true" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <VisuallyHidden>
            <DrawerHeader className="text-left">
              <DrawerTitle>Add user</DrawerTitle>
              <DrawerDescription>Add user details</DrawerDescription>
            </DrawerHeader>
          </VisuallyHidden>
          {children}
          <VisuallyHidden>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </VisuallyHidden>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
