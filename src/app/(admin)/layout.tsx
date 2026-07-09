import { TooltipProvider } from "@/components/ui/tooltip"
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <TooltipProvider><section>{children} </section></TooltipProvider>
}