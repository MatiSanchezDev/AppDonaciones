import {MercadoPagoConfig, Preference} from "mercadopago";
import {redirect} from "next/navigation";
import {createClient} from "@supabase/supabase-js";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const client = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
);

export default async function HomePage() {
  const donations = await supabase
    .from("donation")
    .select("*")
    .then(
      ({data}) =>
        data as unknown as Promise<
          {
            id: number;
            created_at: number;
            amount: number;
            message: string;
          }[]
        >,
    );

  async function donate(formData: FormData) {
    "use server";
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: "donacion",
            title: formData.get("message") as string,
            quantity: 1,
            unit_price: Number(formData.get("amount")),
          },
        ],
        back_urls: {
          success: "https://adventures-advancement-programs-exclusively.trycloudflare.com",
        },
      },
    });

    redirect(preference.sandbox_init_point!);
  }

  return (
    <section className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] bg-background px-4 font-sans antialiased">
      <header className="text-center text-4xl font-bold leading-[4rem]">
        <Link className="uppercase" href="/">
          Donate App
        </Link>
      </header>
      <main className="py-8">
        <section className="grid gap-12">
          <form action={donate} className="max-w-94 gap-94 m-auto grid rounded-lg border p-6">
            <Label className="my-1 grid gap-2">
              <span className="my-1">Valor (pesos Argentinos)</span>
              <Input required name="amount" placeholder="$500" type="number" />
            </Label>
            <Label className="grid gap-2">
              <span className="my-1">Mensaje de la donación</span>
              <Textarea name="message" placeholder="Gracias por alegrarme el dia!" />
            </Label>
            <Button className="mt-4" type="submit">
              Enviar
            </Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Mensaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map(({id, amount, message}) => {
                return (
                  <TableRow key={id}>
                    <TableCell className="font-bold">
                      {amount.toLocaleString("es-AR", {style: "currency", currency: "ARS"})}
                    </TableCell>
                    <TableCell className="text-right">{message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </main>
      <footer className="text-center leading-[4rem] opacity-70">
        © {new Date().getFullYear()} MattDev
      </footer>
    </section>
  );
}
