import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTimeSlots } from "@/hooks/useTimeSlots";

interface TimeSlotSelectorProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  selectedDate: Date | undefined;
  bookedSlots?: string[];
}

export const TimeSlotSelector = ({ selectedTime, onTimeSelect, selectedDate, bookedSlots = [] }: TimeSlotSelectorProps) => {
  const { timeSlots, isLoading } = useTimeSlots();

  // Only show available time slots
  const availableTimeSlots = timeSlots.filter(slot => slot.is_available);

  // Check if a time slot has passed (only for today's date)
  const isTimePassed = (slotTime: string): boolean => {
    if (!selectedDate) return false;

    // Check if selected date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);

    // Only check for passed times if the selected date is today
    if (compareDate.getTime() !== today.getTime()) {
      return false;
    }

    // Parse the slot time (format: "HH:MM")
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date();
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Compare with current time
    const now = new Date();
    return slotDateTime < now;
  };

  console.log('TimeSlotSelector - All slots:', timeSlots);
  console.log('TimeSlotSelector - Available slots:', availableTimeSlots);

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
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando horários...</p>
        ) : availableTimeSlots.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum horário disponível</p>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableTimeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot.time);
                const isPassed = isTimePassed(slot.time);
                const isDisabled = isBooked || isPassed;

                return (
                  <Button
                    key={slot.id}
                    variant={selectedTime === slot.time ? "premium" : "outline"}
                    onClick={() => !isDisabled && onTimeSelect(slot.time)}
                    disabled={isDisabled}
                    className={cn(
                      "transition-all duration-200",
                      selectedTime === slot.time && "scale-105",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
            {(bookedSlots.length > 0 || availableTimeSlots.some(slot => isTimePassed(slot.time))) && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Horários em cinza já estão reservados ou já passaram
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
