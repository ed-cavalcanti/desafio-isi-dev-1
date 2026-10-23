"use client";

import { Plus, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ClubAvatar } from "@/components/clubs/club-avatar";
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

const CLUBS_PATH = "/clubs";

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
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === CLUBS_PATH}
              aria-current={pathname === CLUBS_PATH ? "page" : undefined}
              tooltip="Todos os clubes"
              render={<Link href={CLUBS_PATH} />}
            >
              <Shield />
              <span>Todos os clubes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

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
                    <ClubAvatar
                      acronym={club.acronym}
                      className="size-6 rounded-md text-caption-xs"
                    />
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
      <Skeleton className="size-6 shrink-0 rounded-md" />
      <Skeleton className="h-3 w-24 group-data-[collapsible=icon]:hidden" />
    </li>
  ));
}
