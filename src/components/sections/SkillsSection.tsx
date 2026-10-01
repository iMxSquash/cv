import { CvIcon } from "@/components/icons/CvIcon";
import { Card } from "@/components/ui/Card";
import { SkillChip } from "@/components/ui/SkillChip";
import { Constants, type Enums } from "@/lib/database.types";
import type { Skill, Tool } from "@/lib/cv/types";

// Typed by the Postgres enum: a new category fails the typecheck until it gets a label.
const CATEGORY_LABELS: Record<Enums<"cv_skill_category">, string> = {
  design: "Design",
  development: "Développement",
};

export function SkillsSection({ skills, tools }: { skills: Skill[]; tools: Tool[] }) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      data-theme="light"
      className="section-shell"
    >
      <h2 id="skills-title" className="title-section">
        Compétences
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {Constants.public.Enums.cv_skill_category.map((category) => (
          <div key={category}>
            <h3 className="title-card">{CATEGORY_LABELS[category]}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <li key={skill.id}>
                    <SkillChip label={skill.label} details={skill.details} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="mt-16 title-card">Outils</h3>
      <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tools.map((tool) => (
          <Card key={tool.id} as="li" className="flex flex-col items-center gap-2 text-center">
            <CvIcon name={tool.icon_key} className="size-8 text-accent" />
            <span className="font-medium">{tool.name}</span>
            {tool.purpose && <span className="text-caption text-text-muted">{tool.purpose}</span>}
          </Card>
        ))}
      </ul>
    </section>
  );
}
