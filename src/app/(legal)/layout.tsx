
import Footer from '@/components/footer';
import { getFooterData } from '@/app/admin/(admin)/footer/actions';

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footerData = await getFooterData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-32 md:py-40">
        <div className="max-w-4xl mx-auto text-foreground">
            {children}
        </div>
      </main>
      <Footer initialData={footerData} />
    </div>
  );
}
