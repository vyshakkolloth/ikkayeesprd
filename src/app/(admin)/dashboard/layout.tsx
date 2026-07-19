// Next.js hot-reload trigger for new route groups
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
                    "--sidebar-width": "16rem",
                    "--header-height": "3.5rem",
                } as React.CSSProperties
            }
        >

            <AppSidebar variant="inset" user={user} />

            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 lg:p-6 lg:pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    </>
}