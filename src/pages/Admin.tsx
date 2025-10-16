import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useBookings } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Phone, User, Clock, Trash2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isBarbeiro, loading: roleLoading } = useUserRole(user);
  const { bookings, isLoading: bookingsLoading, deleteBooking } = useBookings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isBarbeiro && user) {
      navigate("/");
    }
  }, [isBarbeiro, roleLoading, user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user || !isBarbeiro) {
    return null;
  }

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
            <h1 className="text-2xl font-bold">Painel do Barbeiro</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Voltar ao Site
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Carregando agendamentos...
              </p>
            ) : sortedBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento encontrado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(booking.date), "dd 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {booking.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {booking.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {booking.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteBooking(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
