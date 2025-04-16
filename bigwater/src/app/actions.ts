"use server";

import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";

export const encodedRedirect = async (
  type: "error" | "success",
  path: string,
  message: string,
  params?: Record<string, string>
) => {
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  searchParams.set("message", message);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }
  
  return redirect(`${path}?${searchParams.toString()}`);
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectUrl = "/dashboard";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect("error", "/login", "Adresse email et mot de passe requis");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  return redirect(redirectUrl);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Adresse email requise");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Impossible de réinitialiser le mot de passe"
    );
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Consultez votre email pour réinitialiser votre mot de passe"
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Le mot de passe et sa confirmation sont requis"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Les mots de passe ne correspondent pas"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "La mise à jour du mot de passe a échoué"
    );
  }

  return encodedRedirect(
    "success", 
    "/protected/reset-password", 
    "Mot de passe mis à jour avec succès"
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
};

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/login", "Utilisateur non connecté");
  }
  
  const fullName = formData.get("fullName") as string;
  
  if (!fullName || fullName.trim() === '') {
    return encodedRedirect("error", "/profile", "Le nom ne peut pas être vide", { tab: "profile" });
  }
  
  // Récupérer le profil actuel pour comparer
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single();
  
  // Si le nom n'a pas changé, ne rien faire
  if (currentProfile?.name === fullName) {
    return encodedRedirect("success", "/profile", "Aucune modification détectée", { tab: "profile" });
  }
  
  // Obtenir l'email de l'utilisateur
  const email = currentProfile?.email || user.email;
  
  if (!email) {
    return encodedRedirect("error", "/profile", "Impossible de récupérer l'email de l'utilisateur", { tab: "profile" });
  }
  
  // S'assurer que le rôle est défini
  const role = currentProfile?.role || 'user'; // Valeur par défaut 'user' si non trouvé
  
  // Mise à jour des données dans la table profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: fullName,
      email: email,
      role: role,
    });
  
  if (profileError) {
    console.error("Erreur lors de la mise à jour du profil:", profileError.message);
    return encodedRedirect("error", "/profile", `Erreur lors de la mise à jour du profil: ${profileError.message}`, { tab: "profile" });
  }
  
  // Enregistrer l'activité de l'utilisateur
  try {
    await supabase.from('user_activity').insert({
      user_id: user.id,
      action_type: 'update_profile',
      details: 'Profil mis à jour',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    // Ne pas échouer si l'enregistrement de l'activité échoue
  }
  
  return encodedRedirect("success", "/profile", "Profil mis à jour avec succès", { tab: "profile" });
};

export const updatePasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  // Validation basique
  if (!currentPassword || !newPassword || !confirmPassword) {
    return encodedRedirect("error", "/profile", "Tous les champs de mot de passe sont requis", { tab: "security" });
  }
  
  if (newPassword !== confirmPassword) {
    return encodedRedirect("error", "/profile", "Les nouveaux mots de passe ne correspondent pas", { tab: "security" });
  }
  
  if (newPassword.length < 8) {
    return encodedRedirect("error", "/profile", "Le mot de passe doit contenir au moins 8 caractères", { tab: "security" });
  }
  
  // Récupérer les informations utilisateur actuelles
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    return encodedRedirect("error", "/profile", "Impossible de récupérer les informations utilisateur", { tab: "security" });
  }
  
  // Vérifier le mot de passe actuel en se reconnectant
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword
  });
  
  if (signInError) {
    return encodedRedirect("error", "/profile", "Le mot de passe actuel est incorrect", { tab: "security" });
  }
  
  // Mettre à jour le mot de passe
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error.message);
    return encodedRedirect("error", "/profile", `La mise à jour du mot de passe a échoué: ${error.message}`, { tab: "security" });
  }
  
  // Enregistrer l'activité de l'utilisateur
  try {
    await supabase.from('user_activity').insert({
      user_id: userData.user.id,
      action_type: 'update_password',
      details: 'Mot de passe mis à jour',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    // Ne pas échouer si l'enregistrement de l'activité échoue
  }
  
  return encodedRedirect("success", "/profile", "Mot de passe mis à jour avec succès", { tab: "security" });
};
