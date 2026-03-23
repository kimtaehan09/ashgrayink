
import { type FaqSectionData } from '@/app/admin/(admin)/faq/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

interface FaqProps {
  initialData: FaqSectionData;
}

export default function Faq({ initialData }: FaqProps) {
  const { desktop, mobile, items } = initialData;
  const allItemIds = items.map((item) => item.id);

  return (
    <section id="faq" className="relative pb-16 pt-[74px] bg-appointment-mobile-gray md:pt-[8.75rem] md:pb-24">
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
        <Accordion 
          type="multiple" 
          defaultValue={allItemIds}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-4"
        >
          {items.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border-0 border-b">
              <AccordionTrigger className="font-bold text-lg text-left hover:no-underline py-4 text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
