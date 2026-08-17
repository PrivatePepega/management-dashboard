"use client";

import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";

interface SidebarNavProps
  extends React.HTMLAttributes<HTMLElement> {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  currentWorkspace: Workspace | null;
  className?: string;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  ...props
}: SidebarNavProps) => {
  const pathname = usePathname();
  const router = useRouter();




  return (
    <nav
      className={cn("flex flex-col gap-y-2", className)}
      {...props}
    >
      {items.map((el) => {
        const Icon = el.icon;
        const isActive = pathname === el.href;

        const handleClick = () => {
          if (el.href === "/workspaces") {
            router.push(el.href);
          } else if (currentWorkspace?._id) {
            router.push(
              `${el.href}?workspaceId=${currentWorkspace._id}`
            );
          } else {
            router.push(el.href);
          }
        };

        return (
          <Button
            key={el.href}
            variant={isActive ? "outline" : "ghost"}
            className={cn(
              "justify-start",
              isActive &&
                "bg-blue-800/20 text-blue-600 font-medium"
            )}
            onClick={handleClick}
          >
            <Icon className="mr-2 size-4" />

            {isCollapsed ? (
              <span className="sr-only">{el.title}</span>
            ) : (
              el.title
            )}
          </Button>
        );
      })}
    </nav>
  );
};