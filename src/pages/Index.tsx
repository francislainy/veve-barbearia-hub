import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Scissors, Trash2, LogIn, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TimeSlotSelector } from "@/components/TimeSlotSelector";
import { BookingForm } from "@/components/BookingForm";
import { ServiceSelector } from "@/components/ServiceSelector";
import { MyBookings } from "@/components/MyBookings";
import { UserRoleBadge } from "@/components/UserRoleBadge";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/useBookings";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isBarbeiro, isAdmin } = useUserRole(user);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { bookings, isLoading, createBooking, deleteBooking } = useBookings();

  // Get booked slots for selected date
  const bookedSlots = selectedDate
    ? bookings
        .filter((b) => b.date === format(selectedDate, "yyyy-MM-dd"))
        .map((b) => b.time)
    : [];

  const handleBookingSubmit = async (name: string, phone: string) => {
    if (!selectedService) {
      toast.error("Por favor, selecione um serviço primeiro");
      return;
    }
    
    if (!selectedDate || !selectedTime || !user) {
      if (!user) {
        toast.error("Você precisa estar logado para fazer um agendamento");
        navigate("/auth");
      }
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const { success } = await createBooking(name, phone, formattedDate, selectedTime, user.id);
    
    if (success) {
      // Reset form
      setSelectedService(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {user && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.email}</span>
              <UserRoleBadge isBarbeiro={isBarbeiro} isAdmin={isAdmin} />
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            {user ? (
              <>
                {isBarbeiro && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Painel Admin
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-4">
            <Scissors className="h-12 w-12 text-primary" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-premium bg-clip-text text-transparent">
              Vevé Barbershop
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Agende seu horário com facilidade e conforto
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-12 border-b border-border">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Nossos Serviços</h2>
            <p className="text-muted-foreground">Confira nossa tabela de preços</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cabelo */}
            <div className="p-6 bg-card border border-border rounded-lg shadow-premium">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Cabelo
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Corte de cabelo</span>
                  <span className="font-semibold text-foreground">R$ 40,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pézinho</span>
                  <span className="font-semibold text-foreground">R$ 15,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Penteado</span>
                  <span className="font-semibold text-foreground">R$ 20,00</span>
                </div>
              </div>
            </div>

            {/* Barba */}
            <div className="p-6 bg-card border border-border rounded-lg shadow-premium">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Barba
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Barba</span>
                  <span className="font-semibold text-foreground">R$ 30,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cavanhaque</span>
                  <span className="font-semibold text-foreground">R$ 30,00</span>
                </div>
              </div>
            </div>

            {/* Sobrancelha */}
            <div className="p-6 bg-card border border-border rounded-lg shadow-premium">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Sobrancelha
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sobrancelha</span>
                  <span className="font-semibold text-foreground">R$ 15,00</span>
                </div>
              </div>
            </div>

            {/* Química */}
            <div className="p-6 bg-card border border-border rounded-lg shadow-premium">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Química
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Progressiva</span>
                  <span className="font-semibold text-foreground">R$ 60,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pigmentação</span>
                  <span className="font-semibold text-foreground">R$ 30,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Alisante</span>
                  <span className="font-semibold text-foreground">R$ 30,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Luzes</span>
                  <span className="font-semibold text-foreground">R$ 40,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Platinado</span>
                  <span className="font-semibold text-foreground">R$ 120,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Faça seu Agendamento</h2>
            <p className="text-muted-foreground">
              Escolha o serviço, data e horário para seu atendimento
            </p>
          </div>

          <ServiceSelector
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />

          {selectedService && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <BookingCalendar 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
                
                <TimeSlotSelector
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  bookedSlots={bookedSlots}
                />
              </div>

              <BookingForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSubmit={handleBookingSubmit}
              />
            </>
          )}

          {/* Role-based Bookings Display */}
          {user && !isBarbeiro && (
            /* Cliente view - shows only their own bookings */
            <div className="mt-12">
              <MyBookings userId={user.id} />
            </div>
          )}

          {isBarbeiro && isLoading ? (
            /* Barbeiro view - shows all bookings */
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : isBarbeiro && bookings.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Todos os Agendamentos (Visão Admin)
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => {
                  const displayDate = format(new Date(booking.date + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR });
                  return (
                    <div
                      key={booking.id}
                      className="p-4 bg-card border border-border rounded-lg shadow-premium hover:shadow-glow transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-foreground">{booking.name}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBooking(booking.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">📞 {booking.phone}</p>
                      <p className="text-sm text-muted-foreground">📅 {displayDate}</p>
                      <p className="text-sm text-muted-foreground">🕐 {booking.time}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-2">Nosso Endereço</h3>
            <p className="text-muted-foreground">Galeria do Galeto, Rua Ator Paulo Gustavo, 282</p>
            <p className="text-muted-foreground">Loja 112, Icaraí, Niterói</p>
          </div>
          <p className="text-muted-foreground">© 2025 Vevé Barbershop - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
