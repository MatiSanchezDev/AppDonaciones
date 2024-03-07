"use client";
import {createClient} from "@supabase/supabase-js";
import {useEffect, useState} from "react";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
);

export default function NotificationPage() {
  const [notification, setNotification] = useState<{id: number; message: string; amount: number}[]>(
    [
      {
        id: 1,
        message: "Gracias por el contenido!",
        amount: 1000,
      },
    ],
  );

  useEffect(() => {
    supabase
      .channel("donation")
      .on("postgres_changes", {event: "INSERT", schema: "public"}, (change) => {
        setNotification((notification) => [
          ...notification,
          change.new as {id: number; message: string; amount: number},
        ]);
      })
      .subscribe();
  }, []);

  useEffect(() => {
    if (notification.length) {
      const timeaut = setTimeout(() => {
        setNotification((notification) => notification.splice(1));
      }, 5000);

      return () => clearTimeout(timeaut);
    }
  }, [notification]);

  if (!notification.length) {
    return null;
  }

  return (
    <section className="absolute bottom-4 right-4 grid items-center justify-center gap-2 rounded-md border bg-black p-4 text-center">
      <p className="text-2xl font-bold">
        {notification[0].amount.toLocaleString("es-AR", {style: "currency", currency: "ARS"})}
      </p>
      <p>{notification[0].message}</p>
    </section>
  );
}
