import type { Metadata } from "next";

import { AdminForm } from "@/components/admin/AdminForm";
import { CheckboxField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { requireAdminPage } from "@/lib/admin/auth";

import { saveProfile } from "../save-actions";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { supabase } = await requireAdminPage();
  const { data: profile, error } = await supabase.from("cv_profile").select("*").single();
  if (error) throw new Error(`Failed to read cv_profile: ${error.message}`);

  return (
    <>
      <h1 className="mb-8 title-card">Profil</h1>
      <AdminForm action={saveProfile}>
        <TextField
          name="full_name"
          label="Nom complet"
          defaultValue={profile.full_name}
          isRequired
        />
        <TextField name="headline" label="Titre" defaultValue={profile.headline} isRequired />
        <ImageField kind="avatar" label="Photo" currentUrl={profile.avatar_url} />
        <TextField name="quote" label="Citation" defaultValue={profile.quote} />
        <TextField
          name="quote_author"
          label="Auteur de la citation"
          defaultValue={profile.quote_author}
        />
        <TextField
          name="about"
          label="À propos"
          rows={6}
          hint="Entoure un mot de **doubles astérisques** pour le mettre en avant."
          defaultValue={profile.about}
          isRequired
        />
        <TextField
          name="about_en"
          label="À propos (anglais)"
          rows={6}
          hint="Vide : le texte français est affiché. Même syntaxe **mot** pour la mise en avant."
          defaultValue={profile.about_en}
        />
        <TextField
          name="email"
          label="E-mail"
          type="email"
          defaultValue={profile.email}
          isRequired
        />
        <TextField
          name="phone"
          label="Téléphone"
          type="tel"
          hint="Tout ce qui est saisi ici est public. Vide : non publié."
          defaultValue={profile.phone}
        />
        <TextField
          name="location"
          label="Localisation"
          hint="Ville et code postal uniquement, jamais d'adresse."
          defaultValue={profile.location}
        />
        <TextField
          name="availability_title"
          label="Disponibilité"
          hint="Ex. Ouvert à une alternance."
          defaultValue={profile.availability_title}
        />
        <TextField
          name="availability_title_en"
          label="Disponibilité (anglais)"
          hint="Vide : le texte français est affiché."
          defaultValue={profile.availability_title_en}
        />
        <TextField
          name="availability_detail"
          label="Précision de disponibilité"
          hint="Ex. Septembre 2026, présentiel ou télétravail."
          defaultValue={profile.availability_detail}
        />
        <TextField
          name="availability_detail_en"
          label="Précision de disponibilité (anglais)"
          hint="Vide : le texte français est affiché."
          defaultValue={profile.availability_detail_en}
        />
        <CheckboxField
          name="is_available"
          label="Disponible"
          defaultChecked={profile.is_available}
        />
      </AdminForm>
    </>
  );
}
