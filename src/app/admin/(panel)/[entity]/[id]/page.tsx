import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { renderEntityForm, summarizeRow } from "@/components/admin/entity-forms";
import { requireAdminPage } from "@/lib/admin/auth";
import { ADMIN_ENTITIES } from "@/lib/admin/entities";
import { getEntityRow } from "@/lib/admin/queries";

import { SAVE_ACTIONS, entityOrNotFound, idOrNotFound } from "../entity-page";

export const metadata: Metadata = { title: "Modifier" };

export default async function EditEntityPage({ params }: PageProps<"/admin/[entity]/[id]">) {
  const { entity: entityParam, id: idParam } = await params;
  const entity = entityOrNotFound(entityParam);
  const id = idOrNotFound(idParam);
  const { supabase } = await requireAdminPage();
  const row = await getEntityRow(supabase, entity, id);
  if (!row) notFound();

  return (
    <>
      <NextLink
        href={`/admin/${entity}`}
        className="inline-flex min-h-11 items-center text-accent underline underline-offset-4"
      >
        Retour à la liste {ADMIN_ENTITIES[entity].title.toLowerCase()}
      </NextLink>
      <h1 className="mt-2 mb-8 title-card">{summarizeRow(entity, row).title}</h1>
      {renderEntityForm(entity, row, SAVE_ACTIONS[entity].bind(null, row.id))}
    </>
  );
}
