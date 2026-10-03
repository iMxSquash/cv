import type { Metadata } from "next";
import NextLink from "next/link";

import { renderEntityForm } from "@/components/admin/entity-forms";
import { requireAdminPage } from "@/lib/admin/auth";
import { ADMIN_ENTITIES } from "@/lib/admin/entities";

import { SAVE_ACTIONS, entityOrNotFound } from "../entity-page";

export async function generateMetadata({
  params,
}: PageProps<"/admin/[entity]/new">): Promise<Metadata> {
  return { title: ADMIN_ENTITIES[entityOrNotFound((await params).entity)].createLabel };
}

export default async function NewEntityPage({ params }: PageProps<"/admin/[entity]/new">) {
  const entity = entityOrNotFound((await params).entity);
  await requireAdminPage();
  const { title, createLabel } = ADMIN_ENTITIES[entity];

  return (
    <>
      <NextLink
        href={`/admin/${entity}`}
        className="inline-flex min-h-11 items-center text-accent underline underline-offset-4"
      >
        Retour à la liste {title.toLowerCase()}
      </NextLink>
      <h1 className="mt-2 mb-8 title-card">{createLabel}</h1>
      {renderEntityForm(entity, null, SAVE_ACTIONS[entity].bind(null, null))}
    </>
  );
}
