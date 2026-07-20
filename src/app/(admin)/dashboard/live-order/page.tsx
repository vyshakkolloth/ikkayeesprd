import { OrdersManager } from "@/components/admin/orders-manager";

export const metadata = {
  title: "Live Orders | Admin Dashboard",
  icons: {
    icon: "/logos/ikkayeslogo.png",
  },
};

export default function OrdersPage() {
  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
        <p className="text-muted-foreground text-sm">
          Track customer checkouts, confirm table orders, and manage kitchen status in real time.
        </p>
      </div>

      <OrdersManager />
    </div>
  );
}
