"use client";

import { ListOrdered, Shield, Swords, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const marketNavigation = [
  { title: "Jogadores", href: "/players", icon: Users },
  { title: "Clubes", href: "/clubs", icon: Shield },
];

const leagueNavigation = [
  { title: "Partidas", href: "/matches", icon: Swords },
  { title: "Classificação", href: "/classification", icon: ListOrdered },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r-0!">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Image
                  src="/passe-logo.svg"
                  width={32}
                  height={32}
                  alt="Picture of the author"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Passe</span>
                <span className="truncate text-xs text-muted-foreground">
                  Gestão de liga
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mercado</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    {item.icon ? <item.icon /> : null}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Liga</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {leagueNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
