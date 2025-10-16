import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

interface BookingCalendarProps {
  onDateSelect: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

export const BookingCalendar = ({ onDateSelect, selectedDate }: BookingCalendarProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Escolha uma Data</CardTitle>
        <CardDescription>Selecione o dia do seu agendamento</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => date < new Date() || date.getDay() === 0}
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
        />
      </CardContent>
    </Card>
  );
};
