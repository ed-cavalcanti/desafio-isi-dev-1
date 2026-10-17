"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type NavItem = { group: string; title: string; href: string };

const navigation: NavItem[] = [
  { group: "Mercado", title: "Jogadores", href: "/players" },
  { group: "Mercado", title: "Clubes", href: "/clubs" },
  { group: "Liga", title: "Partidas", href: "/matches" },
  { group: "Liga", title: "Classificação", href: "/classification" },
];

type Crumb = { label: string; href?: string };

function humanize(segment: string) {
  const text = segment.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildCrumbs(pathname: string): Crumb[] {
  const current = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  if (!current) {
    return pathname === "/"
      ? [{ label: "Início" }]
      : [{ label: humanize(pathname.slice(1)) }];
  }

  const crumbs: Crumb[] = [
    { label: current.group },
    { label: current.title, href: current.href },
  ];

  const rest = pathname.slice(current.href.length);
  for (const segment of rest.split("/").filter(Boolean)) {
    crumbs.push({ label: humanize(segment) });
  }

  return crumbs;
}

export function AppHeader() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <header data-slot="app-header" className="sticky top-0 z-10 bg-sidebar">
      <div className="flex h-14 items-center gap-2 px-4 font-regular">
        <SidebarTrigger className="hover:bg-zinc-200 hover:cursor-pointer" />
        <Separator orientation="vertical" className="mr-1 h-4 self-center!" />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isSection = index === 0 && crumbs.length > 1;
              const isLast = index === crumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {isSection ? (
                      <span className="text-muted-foreground">
                        {crumb.label}
                      </span>
                    ) : isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Recarregar"
          className="ml-auto hover:bg-zinc-200 hover:cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <RefreshCw />
        </Button>
      </div>
      <Separator />
    </header>
  );
}
