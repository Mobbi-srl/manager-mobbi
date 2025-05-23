
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { userSchema, FormValues, UserData } from "./userFormSchema";
import { useUserFormMutations } from "@/hooks/users/useUserFormMutations";
import { useAvailableAreas, useUserAreas } from "@/hooks/users/useUserAreas";
import { Area } from "@/hooks/area/types";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./form-sections/PersonalInfoFields";
import { ContactInfoFields } from "./form-sections/ContactInfoFields";
import { RoleSelector } from "./form-sections/RoleSelector";
import { AreaSelector } from "./form-sections/AreaSelector";
import { FormActions } from "./form-sections/FormActions";

interface UserFormProps {
  user?: UserData;
  onClose: () => void;
  isCreating?: boolean;
  availableAreas?: Area[];
  userAreas?: Area[];
}

const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  onClose, 
  isCreating = false, 
  availableAreas = [], 
  userAreas = [] 
}) => {
  // This import remains unchanged - it will use our newly refactored hook
  const { createMutation, updateMutation } = useUserFormMutations(onClose);
  const { data: fetchedAvailableAreas = [], isLoading: areasLoading } = useAvailableAreas();
  const { data: fetchedUserAreas = [], isLoading: userAreasLoading } = useUserAreas(user?.id);
  
  // Use provided areas or fetched areas
  const areas = availableAreas.length > 0 ? availableAreas : fetchedAvailableAreas;
  const assignedAreas = userAreas.length > 0 ? userAreas : fetchedUserAreas;
  
  // Configure form
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          nome: user.nome,
          cognome: user.cognome,
          email: user.email,
          telefono: user.telefono || "",
          ruolo: user.ruolo,
          areeAssegnate: [],
        }
      : {
          nome: "",
          cognome: "",
          email: "",
          telefono: "",
          ruolo: "Gestore", // Default
          areeAssegnate: [],
        },
  });

  // Watch role to determine if area selection should be shown
  const selectedRole = form.watch('ruolo');
  const isGestore = selectedRole === 'Gestore';

  // Inizializza le aree assegnate quando vengono caricate
  useEffect(() => {
    if (user && assignedAreas.length > 0) {
      console.log("🔄 UserForm: Setting assigned areas:", assignedAreas.map(area => area.id));
      form.setValue(
        'areeAssegnate', 
        assignedAreas.map(area => area.id)
      );
    }
  }, [user, assignedAreas, form]);

  // SUBMIT
  const onSubmit = async (values: FormValues) => {
    console.log("🔄 UserForm: Submitting form with values:", values);
    
    if (isCreating) {
      createMutation.mutate(values);
    } else if (user) {
      updateMutation.mutate({ values, userId: user.id });
    }
  };

  // Whether any mutation is processing
  const isLoading = createMutation.isPending || updateMutation.isPending || areasLoading || userAreasLoading;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PersonalInfoFields />
          <ContactInfoFields />
          <RoleSelector />
          
          {isGestore && (
            <AreaSelector 
              areas={areas} 
              isLoading={areasLoading} 
            />
          )}

          <FormActions 
            onClose={onClose} 
            isLoading={isLoading} 
            isCreating={isCreating} 
          />
        </form>
      </Form>
    </FormProvider>
  );
};

export default UserForm;
