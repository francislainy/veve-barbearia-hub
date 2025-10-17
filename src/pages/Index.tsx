import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Scissors, Trash2, LogIn, User, Calendar, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useServices } from "@/hooks/useServices";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TimeSlotSelector } from "@/components/TimeSlotSelector";
import { BookingForm } from "@/components/BookingForm";
import { ServiceSelector } from "@/components/ServiceSelector";
import { MyBookings } from "@/components/MyBookings";
import { UserRoleBadge } from "@/components/UserRoleBadge";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminServiceManagement } from "@/components/AdminServiceManagement";
import { AdminTimeSlotManagement } from "@/components/AdminTimeSlotManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBookings } from "@/hooks/useBookings";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user);
  const { services } = useServices();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { bookings, isLoading, createBooking, deleteBooking } = useBookings();

  // Restore selections from localStorage on mount
  useEffect(() => {
    const savedService = localStorage.getItem('pendingBooking_service');
    const savedDate = localStorage.getItem('pendingBooking_date');
    const savedTime = localStorage.getItem('pendingBooking_time');

    if (savedService) {
      setSelectedService(savedService);
      localStorage.removeItem('pendingBooking_service');
    }
    if (savedDate) {
      setSelectedDate(new Date(savedDate));
      localStorage.removeItem('pendingBooking_date');
    }
    if (savedTime) {
      setSelectedTime(savedTime);
      localStorage.removeItem('pendingBooking_time');
    }
  }, []);

  // Save selections to localStorage whenever they change
  useEffect(() => {
    if (selectedService) {
      localStorage.setItem('pendingBooking_service', selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('pendingBooking_date', selectedDate.toISOString());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      localStorage.setItem('pendingBooking_time', selectedTime);
    }
  }, [selectedTime]);

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
    
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor, selecione data e horário");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para fazer um agendamento");
      navigate("/auth");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const { success } = await createBooking(name, phone, formattedDate, selectedTime, user.id, selectedService);

    if (success) {
      // Clear localStorage and reset form
      localStorage.removeItem('pendingBooking_service');
      localStorage.removeItem('pendingBooking_date');
      localStorage.removeItem('pendingBooking_time');
      setSelectedService(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
    }
  };

  // Group active services by category for display
  const activeServices = services.filter(service => service.is_active);

  type Service = typeof services[number];
  const groupedServices = activeServices.reduce<Record<string, Service[]>>((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  // If we're still loading roles, show loading state
  if (roleLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  // Admin Dashboard View
  if (user && isAdmin) {
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = new Date(a.date + " " + a.time);
      const dateB = new Date(b.date + " " + b.time);
      return dateA.getTime() - dateB.getTime();
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Scissors className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Vevé Barbershop - Painel Admin</h1>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.email}</span>
                  <UserRoleBadge isAdmin={isAdmin} />
                </div>
                <Button variant="outline" onClick={signOut}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="timeslots">Horários</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agendamentos ({bookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center text-muted-foreground">Carregando agendamentos...</p>
                  ) : sortedBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum agendamento encontrado.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.name}</TableCell>
                            <TableCell>{booking.phone}</TableCell>
                            <TableCell>
                              {format(new Date(booking.date + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>{booking.service_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBooking(booking.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <AdminServiceManagement />
            </TabsContent>

            <TabsContent value="timeslots">
              <AdminTimeSlotManagement />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Client Dashboard View (existing booking interface)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {user && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.email}</span>
              <UserRoleBadge isAdmin={isAdmin} />
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            {user ? (
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
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
      <section className="relative h-[45vh] overflow-hidden">
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
      <section className="container mx-auto px-4 py-12 border-b border-border -mt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Nossos Serviços</h2>
            <p className="text-muted-foreground">Confira nossa tabela de preços</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="p-6 bg-card border border-border rounded-lg shadow-premium">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  {category}
                </h3>
                <div className="space-y-2">
                  {(categoryServices as Service[]).map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="font-semibold text-foreground">R$ {service.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

          {/* Client's own bookings */}
          {user && !isAdmin && (
            <div className="mt-12">
              <MyBookings userId={user.id} />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <Scissors className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-bold text-foreground">Vevé Barbershop</h3>
          </div>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Vevé Barbershop. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
