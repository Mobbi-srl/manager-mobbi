import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";
import { useAvailableAreas } from "@/hooks/users/useUserAreas";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAreaFiltering } from "@/hooks/area/useAreaFiltering";

interface AreaSelectionFieldProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const AreaSelectionField: React.FC<AreaSelectionFieldProps> = ({ form }) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isGestore = ruolo === "Gestore";
  const userId = user?.id;
  
  // Get all available areas and user-specific areas
  const { data: allAreas, isLoading: isLoadingAllAreas } = useAvailableAreas();
  const { data: userAreas, isLoading: isLoadingUserAreas } = useAreaFiltering(isGestore, userId);
  
  // Determine which areas should be displayed based on user role
  const displayAreas = isGestore ? userAreas : allAreas;
  const isLoading = isGestore ? isLoadingUserAreas : isLoadingAllAreas;
  
  return (
    <FormField
      control={form.control}
      name="areaId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Area Geografica
            {isGestore && <span className="ml-1 text-sm text-muted-foreground">(limitata alla tua area)</span>}
          </FormLabel>
          <FormControl>
            <div className="border rounded-md p-2">
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-2">Caricamento aree...</div>
                  ) : displayAreas && displayAreas.length > 0 ? (
                    displayAreas.map((area) => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area.id}`}
                          checked={field.value === area.id}
                          onCheckedChange={() => {
                            field.onChange(field.value === area.id ? undefined : area.id);
                          }}
                        />
                        <label
                          htmlFor={`area-${area.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {`${area.nome} - ${area.regione}`}{area.capoluoghi && area.capoluoghi.length > 0 ? ` - ${area.capoluoghi[0]?.nome || ''}` : ''}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2">
                      {isGestore ? "Non hai aree assegnate" : "Nessuna area disponibile"}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
