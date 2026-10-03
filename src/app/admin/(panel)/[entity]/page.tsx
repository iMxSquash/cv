import type { Metadata } from "next";
import NextLink from "next/link";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { summarizeRow } from "@/components/admin/entity-forms";
import { Card } from "@/components/ui/Card";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/admin/styles";
import { requireAdminPage } from "@/lib/admin/auth";
import { ADMIN_ENTITIES } from "@/lib/admin/entities";
import { listEntityRows } from "@/lib/admin/queries";

import { deleteItem, moveItem, toggleVisible } from "../actions";
import { entityOrNotFound } from "./entity-page";

export async function generateMetadata({
  params,
}: PageProps<"/admin/[entity]">): Promise<Metadata> {
  const entity = entityOrNotFound((await params).entity);
  return { title: ADMIN_ENTITIES[entity].title };
}

export default async function EntityListPage({ params }: PageProps<"/admin/[entity]">) {
  const entity = entityOrNotFound((await params).entity);
  const { supabase } = await requireAdminPage();
  const rows = await listEntityRows(supabase, entity);
  const { title, createLabel } = ADMIN_ENTITIES[entity];
  const summaries = rows.map((row) => summarizeRow(entity, row));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="title-card">{title}</h1>
        <NextLink href={`/admin/${entity}/new`} className={PRIMARY_BUTTON_CLASS}>
          {createLabel}
        </NextLink>
      </div>
      {rows.length === 0 ? (
        <p className="text-text-muted">Aucune entrée pour l&apos;instant.</p>
      ) : (
        <ul className="grid max-w-4xl gap-3">
          {rows.map((row, index) => {
            const summary = summaries[index];
            const isFirst = index === 0 || summaries[index - 1].group !== summary.group;
            const isLast =
              index === rows.length - 1 || summaries[index + 1].group !== summary.group;
            return (
              <Card key={row.id} as="li" className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 basis-60">
                  <NextLink
                    href={`/admin/${entity}/${row.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {summary.title}
                  </NextLink>
                  {summary.detail && (
                    <p className="truncate text-caption text-text-muted">{summary.detail}</p>
                  )}
                  {!row.visible && (
                    <p className="mt-1 w-fit rounded-full bg-line px-2 text-caption font-medium">
                      Masqué
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={moveItem.bind(null, entity, row.id, "up")}>
                    <button type="submit" disabled={isFirst} className={SECONDARY_BUTTON_CLASS}>
                      <span aria-hidden="true">↑</span>
                      <span className="sr-only">Monter « {summary.title} »</span>
                    </button>
                  </form>
                  <form action={moveItem.bind(null, entity, row.id, "down")}>
                    <button type="submit" disabled={isLast} className={SECONDARY_BUTTON_CLASS}>
                      <span aria-hidden="true">↓</span>
                      <span className="sr-only">Descendre « {summary.title} »</span>
                    </button>
                  </form>
                  <form action={toggleVisible.bind(null, entity, row.id)}>
                    <button type="submit" className={SECONDARY_BUTTON_CLASS}>
                      {row.visible ? "Masquer" : "Afficher"}
                      <span className="sr-only"> « {summary.title} »</span>
                    </button>
                  </form>
                  <DeleteButton
                    itemTitle={summary.title}
                    action={deleteItem.bind(null, entity, row.id)}
                  />
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </>
  );
}
