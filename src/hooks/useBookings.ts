import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  service_id?: string | null;
  service_name?: string | null;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          service_name:services(name)
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;

      // Flatten the service_name from nested object
      const formattedData = data?.map(booking => ({
        ...booking,
        service_name: booking.service_name?.name || null
      })) || [];

      setBookings(formattedData);
      console.log('Bookings fetched:', formattedData.length);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = async (
    name: string,
    phone: string,
    date: string,
    time: string,
    userId: string,
    serviceId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{
          name,
          phone,
          date,
          time,
          user_id: userId,
          service_id: serviceId
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Booking created, refetching...');
      // Refetch to ensure we have the latest data
      await fetchBookings();
      toast.success("Agendamento realizado com sucesso!");
      return { success: true };
    } catch (error: any) {
      console.error("Error creating booking:", error);
      if (error.message?.includes('row-level security')) {
        toast.error("Você precisa estar logado para fazer um agendamento");
      } else {
        toast.error("Erro ao criar agendamento");
      }
      return { success: false };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log('Booking deleted, refetching...');
      // Refetch to ensure we have the latest data
      await fetchBookings();
      toast.success("Agendamento cancelado");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchBookings();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    createBooking,
    deleteBooking,
  };
};
