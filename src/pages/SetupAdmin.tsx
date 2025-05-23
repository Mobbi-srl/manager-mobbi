import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const setupSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
  nome: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  cognome: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
});

type SetupValues = z.infer<typeof setupSchema>;

const SetupAdmin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "zolla.alessio@gmail.com",
      password: "Elefante25!",
      nome: "Alessio",
      cognome: "Zolla",
    },
  });

  const onSubmit = async (values: SetupValues) => {
    try {
      setIsSubmitting(true);
      
      // 1. Crea utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            nome: values.nome,
            cognome: values.cognome,
            ruolo: "SuperAdmin",
          },
        },
      });
      
      if (authError) throw authError;
      
      // 2. Crea record in anagrafica_utenti
      const { error: profileError } = await supabase
        .from("anagrafica_utenti")
        .insert({
          id: authData.user?.id,
          nome: values.nome,
          cognome: values.cognome,
          email: values.email,
          ruolo: "SuperAdmin",
        });
      
      if (profileError) throw profileError;
      
      toast({
        title: "Configurazione completata",
        description: "Account admin creato con successo. Puoi effettuare il login.",
      });
      
      // Reindirizza alla pagina di login
      navigate("/login");
    } catch (error: any) {
      console.error("Errore durante la configurazione:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la configurazione",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-verde-light">Setup Iniziale</h1>
          <p className="mt-2 text-muted-foreground">
            Configura l'account Super Admin per iniziare
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cognome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Cognome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-verde hover:bg-verde-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Configurazione in corso..." : "Configura Account"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SetupAdmin;
