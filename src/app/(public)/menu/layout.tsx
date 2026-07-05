import Header from "@/components/clientLayout/header";
import Footer from "@/components/clientLayout/footer";

export default function MenuLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-brand-cream text-brand-dark overflow-x-hidden">
            {/* Global Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Premium Footer */}
            <Footer />
        </div>
    );
}

