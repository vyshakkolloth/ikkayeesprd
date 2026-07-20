import { ConfirmedOrdersList } from "@/components/admin/confirmed-orders-list";

export const metadata = {
  title: "Sales Report & Confirmed Orders | Admin Dashboard",
  icons: {
    icon: "/logos/ikkayeslogo.png",
  },
};

export default function SalesReportPage() {
  return (
    <div className="py-4 space-y-4">
      <ConfirmedOrdersList />
    </div>
  );
}