
import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAvailableAreas } from "@/hooks/users/useUserAreas";
import { Area } from "@/hooks/area/types";
import { User } from "@/types/user"; 
import UserActionsHeader from "@/components/users/UserActionsHeader";
import UsersTable from "@/components/users/UsersTable";
import UserDialogs from "@/components/users/UserDialogs";
import { useUserDbOperations } from "@/hooks/users/useUserDbOperations";

const GestioneUtenti = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [userAreasMap, setUserAreasMap] = useState<Record<string, Area[]>>({});
  
  const queryClient = useQueryClient();
  const { data: availableAreas = [] } = useAvailableAreas();
  const { deleteUser, deleteUsers, isDeleteLoading } = useUserDbOperations();

  // Fetch users with a stable query key
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("🔍 GestioneUtenti: Fetching users");
      const { data, error } = await supabase
        .from("anagrafica_utenti")
        .select("*")
        .order("cognome");

      if (error) {
        console.error("❌ GestioneUtenti: Error fetching users:", error);
        toast.error(`Impossibile caricare gli utenti: ${error.message}`);
        return [];
      }
      
      console.log(`✅ GestioneUtenti: Fetched ${data?.length || 0} users`);
      return data as User[];
    }
  });

  // Fetch user areas using the new view - optimized approach
  const fetchAllUserAreas = useCallback(async () => {
    if (!users.length) return;
    
    try {
      console.log("🔍 GestioneUtenti: Fetching areas for all users using view");
      
      // Get all area-user relationships at once using the vista
      const { data: userAreaView, error } = await supabase
        .from("vw_utenti_aree")
        .select("*")
        .not("area_id", "is", null);
        
      if (error) {
        console.error("❌ GestioneUtenti: Error fetching user areas view:", error);
        throw error;
      }
      
      // Log raw data for debugging
      console.log(`✅ GestioneUtenti: Fetched ${userAreaView?.length || 0} user-area associations from view:`, userAreaView);
      
      // Process the data to organize by user ID
      const areasByUser: Record<string, Area[]> = {};
      
      // Fetch complete area details for all areas
      const allAreaIds = [...new Set(userAreaView?.map(record => record.area_id) || [])];
      
      const { data: allAreas, error: areasError } = await supabase
        .from("aree_geografiche")
        .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
        .in("id", allAreaIds);
      
      if (areasError) {
        console.error("❌ GestioneUtenti: Error fetching complete area details:", areasError);
        throw areasError;
      }
      
      // Map areas by id for easy lookup
      const areasById = (allAreas || []).reduce((acc, area) => {
        acc[area.id] = area;
        return acc;
      }, {} as Record<string, any>);
      
      // Group areas by user
      userAreaView?.forEach(record => {
        if (!record.area_id || !record.utente_id) return;
        
        const areaDetails = areasById[record.area_id];
        if (!areaDetails) return;
        
        if (!areasByUser[record.utente_id]) {
          areasByUser[record.utente_id] = [];
        }
        
        areasByUser[record.utente_id].push(areaDetails);
      });
      
      console.log("✅ GestioneUtenti: Processed user areas map:", areasByUser);
      setUserAreasMap(areasByUser);
    } catch (error) {
      console.error("❌ GestioneUtenti: Error processing user areas:", error);
      toast.error("Errore nel recupero delle aree utente");
    }
  }, [users]);

  // Use effect to fetch user areas when users change
  useEffect(() => {
    fetchAllUserAreas();
  }, [fetchAllUserAreas]);

  // Handle multi-selection
  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(users.map(user => user.id));
    } else if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([]);
    }
  }, [selectAll, users]);

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Handle user actions with manual refreshing
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;
    
    // If only one user is selected, show single user deletion dialog
    if (selectedUsers.length === 1) {
      const userToDelete = users.find(u => u.id === selectedUsers[0]);
      if (userToDelete) {
        setSelectedUser(userToDelete);
        setIsDeleteOpen(true);
      }
      return;
    }

    // Multiple selection delete
    setSelectedUser(null);
    setIsDeleteManyOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setIsDeleteOpen(false);
      // Refresh data after deletion
      await refetch();
      await fetchAllUserAreas();
    }
  };
  
  const handleConfirmDeleteMany = async () => {
    if (selectedUsers.length > 0) {
      await deleteUsers(selectedUsers);
      setIsDeleteManyOpen(false);
      setSelectedUsers([]);
      // Refresh data after deletion
      await refetch();
      await fetchAllUserAreas();
    }
  };

  // Function to refresh data after operations
  const refreshData = useCallback(async () => {
    console.log("🔄 GestioneUtenti: Refreshing all data");
    await queryClient.invalidateQueries({ queryKey: ["users"] });
    await queryClient.invalidateQueries({ queryKey: ["user_areas"] });
    await queryClient.invalidateQueries({ queryKey: ["user_area_view"] });
    await refetch();
    await fetchAllUserAreas();
  }, [queryClient, refetch, fetchAllUserAreas]);

  useEffect(() => {
    // Setup event listeners for dialog closures
    const handleCreateClose = () => refreshData();
    const handleEditClose = () => refreshData();
    
    // Force initial data load
    refreshData();
    
    return () => {
      // Clean up
    };
  }, [refreshData]);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border shadow-xl bg-gray-900/60 border-gray-800">
        <UserActionsHeader 
          selectedUsersCount={selectedUsers.length}
          handleDeleteSelected={handleDeleteSelected}
          openCreateDialog={() => setIsCreateOpen(true)}
        />

        <UsersTable 
          users={users}
          isLoading={isLoading}
          userAreasMap={userAreasMap}
          selectedUsers={selectedUsers}
          toggleSelectUser={toggleSelectUser}
          toggleSelectAll={toggleSelectAll}
          selectAll={selectAll}
          handleEditUser={handleEditUser}
          handleDeleteUser={handleDeleteUser}
        />
      </div>

      <UserDialogs 
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={(isOpen) => {
          setIsCreateOpen(isOpen);
          if (!isOpen) refreshData();
        }}
        isEditOpen={isEditOpen}
        setIsEditOpen={(isOpen) => {
          setIsEditOpen(isOpen);
          if (!isOpen) refreshData();
        }}
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        isDeleteManyOpen={isDeleteManyOpen}
        setIsDeleteManyOpen={setIsDeleteManyOpen}
        selectedUsers={users.filter(user => selectedUsers.includes(user.id))}
        selectedUser={selectedUser}
        availableAreas={availableAreas}
        userAreasMap={userAreasMap}
        handleConfirmDelete={handleConfirmDelete}
        handleConfirmDeleteMany={handleConfirmDeleteMany}
        isDeleteLoading={isDeleteLoading}
      />
    </div>
  );
};

export default GestioneUtenti;
