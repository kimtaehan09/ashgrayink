
import { type LocationSectionData } from '@/app/admin/(admin)/location/actions';

interface LocationProps {
    initialData: LocationSectionData;
}

export default function Location({ initialData }: LocationProps) {
    const { desktop, mobile, mapEmbedUrl, items } = initialData;

    return (
        <section id="location" className="relative pt-[74px] bg-background pb-16 md:pt-24">
            <div className="pb-24 md:pb-48">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground md:hidden">{mobile.title}</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:hidden">
                            {mobile.subtitle}
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground hidden md:block">{desktop.title}</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto hidden md:block">
                            {desktop.subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="h-full">
                            <iframe
                                key={mapEmbedUrl}
                                src={mapEmbedUrl}
                                className="w-full h-full aspect-[4/3] md:aspect-square rounded-lg border-2 border-border"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        <div>
                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index} className="border rounded-lg bg-card p-4">
                                        <h3 className="font-headline text-lg text-foreground mb-2">{item.title}</h3>
                                        <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div className="hidden md:block absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-appointment-mobile-gray to-transparent pointer-events-none"></div>
        </section>
    );
}
