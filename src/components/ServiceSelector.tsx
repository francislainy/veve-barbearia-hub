import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";
import { useServices } from "@/hooks/useServices";

interface ServiceSelectorProps {
  selectedService: string | null;
  onServiceSelect: (serviceId: string) => void;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ServiceSelector = ({ selectedService, onServiceSelect }: ServiceSelectorProps) => {
  const { services, isLoading } = useServices();

  // Only show active services
  const activeServices = services.filter((service) => service.is_active);

  // Group services by category
  const groupedServices = activeServices.reduce<Record<string, Service[]>>(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    },
    {}
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Escolha o Serviço</CardTitle>
        <CardDescription>Selecione o serviço desejado antes de escolher data e horário</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando serviços...</p>
        ) : activeServices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum serviço disponível</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedServices).map((category) => {
              const categoryServices = groupedServices[category];
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryServices.map((service) => (
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
                        <span className="text-sm opacity-80">R$ {service.price.toFixed(2)}</span>
                        <span className="text-xs opacity-60">{service.duration_minutes} min</span>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
