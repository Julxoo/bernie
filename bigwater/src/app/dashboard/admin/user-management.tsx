"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon, PencilIcon, TrashIcon, UserIcon, ShieldIcon } from "lucide-react";
import { UserProfile } from "@/types/auth";
import { NewUserDialog } from "./new-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { getUsers, updateUser, deleteUser, createUser } from "@/services/api/users";

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
        console.error("Erreur lors du chargement des utilisateurs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Mettre à jour un utilisateur
  const handleUpdateUser = async (userId: string, data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const updatedUser = await updateUser(userId, data);
      setUsers(users.map(user => user.id === userId ? { ...user, ...updatedUser } : user));
      setEditingUser(null);
      setError(null);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Impossible de mettre à jour l'utilisateur. Veuillez réessayer plus tard.");
      console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setError(null);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer l'utilisateur. Veuillez réessayer plus tard.");
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel utilisateur
  const handleCreateUser = async (data: Partial<UserProfile & { password: string }>) => {
    try {
      setLoading(true);
      const newUser = await createUser(data);
      setUsers([...users, newUser]);
      setShowNewUserDialog(false);
      setError(null);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Impossible de créer l'utilisateur. Veuillez réessayer plus tard.");
      console.error("Erreur lors de la création de l'utilisateur:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <span>Gestion des Utilisateurs</span>
            </CardTitle>
            <Button 
              onClick={() => setShowNewUserDialog(true)}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Ajouter</span>
            </Button>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nom</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Rôle</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {user.role === "admin" ? (
                            <ShieldIcon className="h-4 w-4 text-red-500" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            title="Modifier l'utilisateur"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Supprimer l'utilisateur"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t">
          <div className="text-sm text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
          </div>
        </CardFooter>
      </Card>

      {/* Dialog pour ajouter un nouvel utilisateur */}
      {showNewUserDialog && (
        <NewUserDialog
          open={showNewUserDialog}
          onClose={() => setShowNewUserDialog(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Dialog pour modifier un utilisateur */}
      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
        />
      )}
    </>
  );
} 