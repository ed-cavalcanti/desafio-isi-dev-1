"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ClubCreateDialog } from "@/components/clubs/club-create-dialog";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

const CLUBS_PATH = "/clubs";

function getClubInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export function SidebarClubs() {
  const pathname = usePathname();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    apiFetch<Club[]>(`/api/v1${CLUBS_PATH}`)
      .then((response) => {
        if (!isActive) return;
        setClubs(response);
      })
      .catch(() => {
        if (!isActive) return;
        setClubs([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const handleClubCreated = (club: Club) => {
    router.push(`${CLUBS_PATH}/${club.id}`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Clubes</SidebarGroupLabel>
      <SidebarGroupAction
        type="button"
        title="Adicionar clube"
        aria-label="Adicionar clube"
        onClick={() => setIsCreateOpen(true)}
      >
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading ? (
            <SidebarClubsLoading />
          ) : clubs.length === 0 ? (
            <li className="px-2 py-1 text-caption-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              Nenhum clube cadastrado
            </li>
          ) : (
            clubs.map((club) => {
              const href = `${CLUBS_PATH}/${club.id}`;
              const isActive = pathname === href;

              return (
                <SidebarMenuItem key={club.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    aria-current={isActive ? "page" : undefined}
                    tooltip={club.name}
                    render={<Link href={href} />}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md border text-caption-xs font-semibold uppercase group-data-[collapsible=icon]:size-4",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-foreground",
                      )}
                    >
                      {getClubInitial(club.name)}
                    </span>
                    <span>{club.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
      </SidebarGroupContent>

      <ClubCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleClubCreated}
      />
    </SidebarGroup>
  );
}

function SidebarClubsLoading() {
  return Array.from({ length: 3 }).map((_, index) => (
    <li key={index} className="flex h-8 items-center gap-2 px-2">
      <Skeleton className="size-6 shrink-0 rounded-md group-data-[collapsible=icon]:size-4" />
      <Skeleton className="h-3 w-24 group-data-[collapsible=icon]:hidden" />
    </li>
  ));
}
