"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheck, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const useToast = ToastPrimitive.useToastManager;

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
        "transition duration-200 data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0",
      )}
    >
      <ToastPrimitive.Content className="flex items-start gap-3 px-4 py-3">
        <CircleCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-success"
        />
        <ToastPrimitive.Title className="text-body-sm-medium text-foreground" />
        <ToastPrimitive.Close
          aria-label="Fechar"
          className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:cursor-pointer hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}
