import { AppSidebar } from "@/components/app-sidebar"

import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth/session"

export default async function DashBoardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    const user = session
        ? {
            name: session.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            email: session.email,
        }
        : undefined


    return <>
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <div className=" border-amber-950 border-2 ">
                <AppSidebar variant="inset" user={user} />
            </div>
            <SidebarInset>

                <SiteHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    </>
}