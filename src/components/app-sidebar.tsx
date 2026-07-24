"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon,
  UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon,
  SearchIcon, DatabaseIcon, FileChartColumnIcon,
  FileIcon, CommandIcon, UtensilsCrossed,
  Salad, ClipboardList,
  BadgeDollarSign
} from "lucide-react"

import { usePathname } from "next/navigation";



const data = {
  user: {
    name: "ikkayes",
    email: "[EMAIL_ADDRESS]",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [

    {
      title: "Live Orders",
      url: "/dashboard/live-order",
      icon: (
        <ClipboardList />
      ),
    },
    {
      title: "Home Page",
      url: `/dashboard/home-page`,
      icon: (
        <FileIcon
        />
      ),
    },
    {
      title: "Category Management",
      url: `/dashboard/category`,
      icon: (

        <UtensilsCrossed />
      ),
    },
    {
      title: "Product Management",
      url: "/dashboard/product",
      icon: (
        <Salad />

      ),
    },
    {
      title: "Sales Report",
      url: "/dashboard/sales-report",
      icon: (
        <BadgeDollarSign />
      ),
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],

}
export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}) {
  const finalUser = user
    ? {
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/avatars/shadcn.jpg",
    }
    : data.user

  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-12 bg-accent/50">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CommandIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">Acme Inc</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={finalUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
