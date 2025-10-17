import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { bookingSchema } from "@/lib/validations";
import { format } from "date-fns";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

interface BookingFormProps {
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onSubmit: (name: string, phone: string) => void;
}

export const BookingForm = ({ selectedDate, selectedTime, onSubmit }: BookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Auto-populate user data when user is logged in
  useEffect(() => {
    if (user?.user_metadata) {
      const fullName = user.user_metadata.full_name || "";
      const userPhone = user.user_metadata.phone || "";
      setName(fullName);
      setPhone(userPhone);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e horário");
      return;
    }

    try {
      const validated = bookingSchema.parse({
        name: name.trim(),
        phone: phone.trim(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      });

      onSubmit(validated.name, validated.phone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao validar dados");
      }
    }
  };

  const isFormValid = name && phone && selectedDate && selectedTime;

  // Show login prompt if user is not logged in and has selected date/time
  if (!user && selectedDate && selectedTime) {
    return (
      <Card className="w-full border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Faça Login para Continuar
          </CardTitle>
          <CardDescription>
            Você precisa estar logado para confirmar seu agendamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary rounded-lg space-y-1">
            <p className="text-sm font-medium">Suas Seleções:</p>
            <p className="text-sm text-muted-foreground">
              Data: {selectedDate.toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground">
              Horário: {selectedTime}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Suas seleções serão mantidas após o login. Clique no botão abaixo para fazer login ou criar uma conta.
          </p>
          <Button
            variant="premium"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Fazer Login ou Cadastrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirmar Agendamento</CardTitle>
        <CardDescription>Confirme seus dados para finalizar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!!user?.user_metadata?.full_name}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={!!user?.user_metadata?.phone}
            />
          </div>

          {selectedDate && selectedTime && (
            <div className="p-4 bg-secondary rounded-lg space-y-1">
              <p className="text-sm font-medium">Resumo do Agendamento:</p>
              <p className="text-sm text-muted-foreground">
                Data: {selectedDate.toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">
                Horário: {selectedTime}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            variant="premium" 
            className="w-full"
            disabled={!isFormValid}
          >
            Confirmar Agendamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
