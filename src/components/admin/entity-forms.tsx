import { ICON_KEYS } from "@/components/icons/CvIcon";
import { FLAG_CODES } from "@/components/icons/Flag";
import { MonthPeriod, YearPeriod } from "@/components/ui/Period";
import type { EntityRow, EntitySlug } from "@/lib/admin/entities";
import type { SaveAction } from "@/lib/admin/form-state";
import { LINK_PLATFORM_LABELS, SKILL_CATEGORY_LABELS } from "@/lib/cv/labels";
import { YEAR_MAX, YEAR_MIN } from "@/lib/cv/schemas";

import { AdminForm } from "./AdminForm";
import { CheckboxField, SelectField, TextField } from "./fields";
import { ImageField } from "./ImageField";

const ICON_OPTIONS = ICON_KEYS.map((key) => ({ value: key, label: key }));
const FLAG_OPTIONS = FLAG_CODES.map((code) => ({ value: code, label: code.toUpperCase() }));
const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

interface FormProps<K extends EntitySlug> {
  row: EntityRow<K> | null;
  action: SaveAction;
}

function VisibleField({ row }: { row: { visible: boolean } | null }) {
  return (
    <CheckboxField
      name="visible"
      label="Visible sur le CV"
      hint="Décoché : la ligne reste ici mais n'est plus publiée."
      defaultChecked={row?.visible ?? true}
    />
  );
}

/** One form per list entity, fed by the row being edited (null when creating). */
const ENTITY_FORMS: { [K in EntitySlug]: (props: FormProps<K>) => React.ReactNode } = {
  experiences: ({ row, action }) => (
    <AdminForm action={action}>
      <TextField name="role" label="Poste" defaultValue={row?.role} isRequired />
      <TextField
        name="role_en"
        label="Poste (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.role_en}
      />
      <TextField name="company" label="Entreprise" defaultValue={row?.company} isRequired />
      <ImageField
        kind="experience"
        label="Logo de l'entreprise"
        currentUrl={row?.logo_url ?? null}
      />
      <TextField
        name="start_date"
        label="Début"
        type="date"
        defaultValue={row?.start_date}
        isRequired
      />
      <TextField
        name="end_date"
        label="Fin"
        type="date"
        hint="Vide : poste en cours (badge « Actuel »)."
        defaultValue={row?.end_date}
      />
      <TextField
        name="location"
        label="Lieu"
        hint="Ex. Trappes (78) et travail à distance."
        defaultValue={row?.location}
      />
      <TextField
        name="location_en"
        label="Lieu (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.location_en}
      />
      <TextField name="description" label="Description" rows={4} defaultValue={row?.description} />
      <VisibleField row={row} />
    </AdminForm>
  ),
  education: ({ row, action }) => (
    <AdminForm action={action}>
      <TextField name="school" label="École" defaultValue={row?.school} isRequired />
      <TextField name="city" label="Ville" defaultValue={row?.city} />
      <ImageField kind="education" label="Logo de l'école" currentUrl={row?.logo_url ?? null} />
      <TextField name="degree" label="Diplôme" defaultValue={row?.degree} isRequired />
      <TextField
        name="degree_en"
        label="Diplôme (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.degree_en}
      />
      <TextField name="details" label="Précisions" defaultValue={row?.details} />
      <TextField
        name="details_en"
        label="Précisions (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.details_en}
      />
      <TextField
        name="start_year"
        label="Année de début"
        type="number"
        min={YEAR_MIN}
        max={YEAR_MAX}
        hint="Vide : diplôme obtenu sur une seule année."
        defaultValue={row?.start_year}
      />
      <TextField
        name="end_year"
        label="Année de fin"
        type="number"
        min={YEAR_MIN}
        max={YEAR_MAX}
        defaultValue={row?.end_year}
        isRequired
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
  skills: ({ row, action }) => (
    <AdminForm action={action}>
      <SelectField
        name="category"
        label="Catégorie"
        options={toOptions(SKILL_CATEGORY_LABELS)}
        defaultValue={row?.category}
      />
      <TextField name="label" label="Compétence" defaultValue={row?.label} isRequired />
      <TextField
        name="details"
        label="Précisions"
        hint="Séparées par des virgules, ex. NextJS, NestJS, PHP."
        defaultValue={row?.details.join(", ")}
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
  tools: ({ row, action }) => (
    <AdminForm action={action}>
      <TextField name="name" label="Nom" defaultValue={row?.name} isRequired />
      <TextField
        name="purpose"
        label="Usage"
        hint="Ex. UI Design, prototyping."
        defaultValue={row?.purpose}
      />
      <TextField
        name="purpose_en"
        label="Usage (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.purpose_en}
      />
      <SelectField
        name="icon_key"
        label="Icône"
        options={ICON_OPTIONS}
        defaultValue={row?.icon_key}
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
  languages: ({ row, action }) => (
    <AdminForm action={action}>
      <TextField name="name" label="Langue" defaultValue={row?.name} isRequired />
      <TextField
        name="name_en"
        label="Langue (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.name_en}
      />
      <TextField
        name="level"
        label="Niveau"
        hint="Ex. B2, langue maternelle."
        defaultValue={row?.level}
        isRequired
      />
      <TextField
        name="level_en"
        label="Niveau (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.level_en}
      />
      <SelectField
        name="flag_code"
        label="Drapeau"
        hint="Un nouveau drapeau s'ajoute dans le code (Flag.tsx)."
        options={FLAG_OPTIONS}
        defaultValue={row?.flag_code}
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
  links: ({ row, action }) => (
    <AdminForm action={action}>
      <SelectField
        name="platform"
        label="Plateforme"
        options={toOptions(LINK_PLATFORM_LABELS)}
        defaultValue={row?.platform}
      />
      <TextField
        name="label"
        label="Libellé affiché"
        hint="Ex. elwen-coussot."
        defaultValue={row?.label}
        isRequired
      />
      <TextField
        name="url"
        label="Adresse"
        type="url"
        hint="Adresse complète en https://."
        defaultValue={row?.url}
        isRequired
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
  mobility: ({ row, action }) => (
    <AdminForm action={action}>
      <TextField name="label" label="Libellé" defaultValue={row?.label} isRequired />
      <TextField
        name="label_en"
        label="Libellé (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.label_en}
      />
      <TextField
        name="detail"
        label="Précision"
        hint="Ex. Paris et Île-de-France."
        defaultValue={row?.detail}
      />
      <TextField
        name="detail_en"
        label="Précision (anglais)"
        hint="Vide : le texte français est affiché."
        defaultValue={row?.detail_en}
      />
      <SelectField
        name="icon_key"
        label="Icône"
        options={ICON_OPTIONS}
        defaultValue={row?.icon_key}
      />
      <VisibleField row={row} />
    </AdminForm>
  ),
};

interface RowSummary {
  title: string;
  detail?: React.ReactNode;
  /** Rows are reordered within their group only (skill category). */
  group?: string;
}

/** What a list row shows to tell entries apart. */
const ENTITY_SUMMARIES: { [K in EntitySlug]: (row: EntityRow<K>) => RowSummary } = {
  experiences: (row) => ({
    title: `${row.role} · ${row.company}`,
    detail: <MonthPeriod start={row.start_date} end={row.end_date} />,
  }),
  education: (row) => ({
    title: `${row.degree} · ${row.school}`,
    detail: <YearPeriod start={row.start_year} end={row.end_year} />,
  }),
  skills: (row) => ({
    title: row.label,
    detail: [SKILL_CATEGORY_LABELS[row.category], ...row.details].join(" · "),
    group: row.category,
  }),
  tools: (row) => ({ title: row.name, detail: row.purpose }),
  languages: (row) => ({ title: row.name, detail: row.level }),
  links: (row) => ({ title: LINK_PLATFORM_LABELS[row.platform], detail: row.url }),
  mobility: (row) => ({ title: row.label, detail: row.detail }),
};

// Annotating the lookup ties the props to the same K (TypeScript correlated union pattern).
export function renderEntityForm<K extends EntitySlug>(
  entity: K,
  row: EntityRow<K> | null,
  action: SaveAction,
): React.ReactNode {
  const Form: (props: FormProps<K>) => React.ReactNode = ENTITY_FORMS[entity];
  return <Form row={row} action={action} />;
}

export function summarizeRow<K extends EntitySlug>(entity: K, row: EntityRow<K>): RowSummary {
  const summarize: (row: EntityRow<K>) => RowSummary = ENTITY_SUMMARIES[entity];
  return summarize(row);
}
