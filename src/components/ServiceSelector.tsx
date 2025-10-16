import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";

interface ServiceSelectorProps {
  selectedService: string | null;
  onServiceSelect: (service: string) => void;
}

const services = [
  { id: "corte", name: "Corte de Cabelo", price: "R$ 40,00" },
  { id: "pezinho", name: "Pézinho", price: "R$ 15,00" },
  { id: "penteado", name: "Penteado", price: "R$ 20,00" },
  { id: "barba", name: "Barba", price: "R$ 30,00" },
  { id: "cavanhaque", name: "Cavanhaque", price: "R$ 30,00" },
  { id: "sobrancelha", name: "Sobrancelha", price: "R$ 15,00" },
  { id: "progressiva", name: "Progressiva", price: "R$ 60,00" },
  { id: "pigmentacao", name: "Pigmentação", price: "R$ 30,00" },
  { id: "alisante", name: "Alisante", price: "R$ 30,00" },
  { id: "luzes", name: "Luzes", price: "R$ 40,00" },
  { id: "platinado", name: "Platinado", price: "R$ 120,00" },
];

export const ServiceSelector = ({ selectedService, onServiceSelect }: ServiceSelectorProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Escolha o Serviço</CardTitle>
        <CardDescription>Selecione o serviço desejado antes de escolher data e horário</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={selectedService === service.id ? "premium" : "outline"}
              onClick={() => onServiceSelect(service.id)}
              className={cn(
                "h-auto py-4 px-4 flex flex-col items-start gap-1 transition-all duration-200",
                selectedService === service.id && "scale-[1.02]"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <Scissors className="h-4 w-4" />
                <span className="font-semibold">{service.name}</span>
              </div>
              <span className="text-sm opacity-80">{service.price}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
