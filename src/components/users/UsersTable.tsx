
import React from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { Area } from "@/hooks/area/types";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  userAreasMap: Record<string, Area[]>;
  selectedUsers: string[];
  toggleSelectUser: (userId: string) => void;
  toggleSelectAll: () => void;
  selectAll: boolean;
  handleEditUser: (user: User) => void;
  handleDeleteUser: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  userAreasMap,
  selectedUsers,
  toggleSelectUser,
  toggleSelectAll,
  selectAll,
  handleEditUser,
  handleDeleteUser,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-verde-light border-opacity-50 rounded-full border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Caricamento utenti in corso...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
        <p className="text-muted-foreground mb-4">Nessun utente trovato.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <Table>
        <TableCaption>Lista degli utenti registrati</TableCaption>
        <TableHeader className="bg-gray-900/80">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectAll || (users.length > 0 && selectedUsers.length === users.length)}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cognome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Telefono</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead>Aree</TableHead>
            <TableHead className="w-[100px] text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-800/40">
              <TableCell>
                <Checkbox 
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleSelectUser(user.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{user.cognome}</TableCell>
              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
              <TableCell className="hidden md:table-cell">{user.telefono || "-"}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.ruolo === "SuperAdmin" ? "bg-purple-800/60 text-purple-200" :
                  user.ruolo === "Master" ? "bg-blue-800/60 text-blue-200" :
                  user.ruolo === "Gestore" ? "bg-green-800/60 text-green-200" :
                  user.ruolo === "Ambassador" ? "bg-amber-800/60 text-amber-200" :
                  "bg-gray-800/60 text-gray-200"
                }`}>
                  {user.ruolo}
                </span>
              </TableCell>
              <TableCell>
                {userAreasMap[user.id] && userAreasMap[user.id].length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {userAreasMap[user.id].slice(0, 2).map((area) => (
                      <Badge key={area.id} variant="secondary" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{area.nome}</span>
                      </Badge>
                    ))}
                    {userAreasMap[user.id].length > 2 && (
                      <Badge variant="outline">+{userAreasMap[user.id].length - 2}</Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs">Nessuna area</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifica</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Elimina</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
