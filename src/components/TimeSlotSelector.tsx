import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimeSlotSelectorProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  selectedDate: Date | undefined;
  bookedSlots?: string[];
}

const availableTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

export const TimeSlotSelector = ({ selectedTime, onTimeSelect, selectedDate, bookedSlots = [] }: TimeSlotSelectorProps) => {
  if (!selectedDate) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Escolha um Horário</CardTitle>
          <CardDescription>Primeiro selecione uma data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Aguardando seleção de data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Escolha um Horário</CardTitle>
        <CardDescription>Selecione o melhor horário para você</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableTimeSlots.map((time) => {
            const isBooked = bookedSlots.includes(time);
            return (
              <Button
                key={time}
                variant={selectedTime === time ? "premium" : "outline"}
                onClick={() => !isBooked && onTimeSelect(time)}
                disabled={isBooked}
                className={cn(
                  "transition-all duration-200",
                  selectedTime === time && "scale-105",
                  isBooked && "opacity-50 cursor-not-allowed"
                )}
              >
                {time}
              </Button>
            );
          })}
        </div>
        {bookedSlots.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Horários em cinza já estão reservados
          </p>
        )}
      </CardContent>
    </Card>
  );
};
