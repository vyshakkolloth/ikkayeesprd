import Header from "@/components/clientLayout/header";

export default function MenuLayout({ children, }: { children: React.ReactNode }) {



    return <section>
        <Header />
        {children}
    </section>
}

