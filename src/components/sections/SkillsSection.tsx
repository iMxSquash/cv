import type { CSSProperties, ReactNode } from "react";
import { CvIcon } from "@/components/icons/CvIcon";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { Card } from "@/components/ui/Card";
import { OrbAnchor } from "@/components/ui/OrbAnchor";
import { SkillChip } from "@/components/ui/SkillChip";
import { Constants, type Enums } from "@/lib/database.types";
import type { Skill, Tool } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { SkillsMotion } from "./SkillsMotion";

type DeckGroup = Enums<"cv_skill_category"> | "tools";

// Typed by the Postgres enum: a new category fails the typecheck until it gets a color.
const GROUP_COLORS: Record<DeckGroup, string> = {
  design: "var(--deck-design)",
  development: "var(--deck-development)",
  tools: "var(--deck-tools)",
};
const GROUP_ORDER: DeckGroup[] = [...Constants.public.Enums.cv_skill_category, "tools"];

/* From 900 px wide with motion, every list is laid over the same deck and each item becomes a card. */
const DECK_LAYER = "pinned-wide:absolute pinned-wide:inset-0 pinned-wide:m-0";
const CARD_FACE = `${DECK_LAYER} pinned-wide:rounded-3xl pinned-wide:border-t-8 pinned-wide:border-(--deck-color) pinned-wide:p-6 pinned-wide:shadow-elevation pinned-wide:backface-hidden`;

/** One list item, and in the deck a two-faced card: gradient back first, the item on its front. */
function DeckCard({ group, children }: { group: DeckGroup; children: ReactNode }) {
  return (
    <li
      data-skills-card
      data-group={group}
      style={{ "--deck-color": GROUP_COLORS[group] } as CSSProperties}
      className={`${DECK_LAYER} pinned-wide:transform-3d`}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute inset-0 hidden gradient-panel rounded-3xl backface-hidden rotate-y-180 pinned-wide:block"
      />
    </li>
  );
}

export function SkillsSection({
  skills,
  tools,
  locale,
}: {
  skills: Skill[];
  tools: Tool[];
  locale: Locale;
}) {
  const t = getMessages(locale).skills;
  const groupLabels: Record<DeckGroup, string> = { ...t.categories, tools: t.tools };
  return (
    <section id="skills" aria-labelledby="skills-title" data-theme="light">
      <SkillsMotion>
        <PinnedStage
          screens={6}
          stageClassName="section-shell pinned-wide:grid pinned-wide:grid-cols-2 pinned-wide:items-center pinned-wide:gap-12 pinned-wide:py-12"
        >
          <div>
            <h2 id="skills-title" className="title-section">
              {t.title}
              <OrbAnchor isFollowed={false} />
            </h2>
            {/* Visual only: each list keeps its own heading for assistive technologies. */}
            <p
              aria-hidden="true"
              className="mt-4 hidden title-section text-accent pinned-wide:grid"
            >
              {GROUP_ORDER.map((group) => (
                <span
                  key={group}
                  data-skills-subtitle
                  data-group={group}
                  className="col-start-1 row-start-1"
                >
                  {groupLabels[group]}
                </span>
              ))}
            </p>
          </div>

          <div
            data-skills-deck
            className="mt-10 grid gap-10 md:grid-cols-2 pinned-wide:relative pinned-wide:mt-0 pinned-wide:block pinned-wide:aspect-[3/4] pinned-wide:w-[clamp(12rem,32vmin,18rem)] pinned-wide:justify-self-center"
          >
            {Constants.public.Enums.cv_skill_category.map((category) => (
              <div key={category} data-skills-block data-group={category} className={DECK_LAYER}>
                <h3 className="title-card pinned-wide:sr-only">{groupLabels[category]}</h3>
                <ul className={`mt-4 flex flex-wrap gap-3 ${DECK_LAYER}`}>
                  {skills
                    .filter((skill) => skill.category === category)
                    .map((skill) => (
                      <DeckCard key={skill.id} group={category}>
                        <SkillChip
                          label={skill.label}
                          details={skill.details}
                          className={`${CARD_FACE} pinned-wide:text-[clamp(1.5rem,4vmin,2.5rem)]`}
                        />
                      </DeckCard>
                    ))}
                </ul>
              </div>
            ))}

            <div data-skills-block data-group="tools" className={`md:col-span-2 ${DECK_LAYER}`}>
              <h3 className="title-card pinned-wide:sr-only">{groupLabels.tools}</h3>
              <ul className={`mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 ${DECK_LAYER}`}>
                {tools.map((tool) => (
                  <DeckCard key={tool.id} group="tools">
                    <Card
                      className={`flex h-full flex-col items-center justify-center gap-2 text-center ${CARD_FACE}`}
                    >
                      <CvIcon
                        name={tool.icon_key}
                        className="size-8 text-accent pinned-wide:size-16"
                      />
                      <span className="font-medium pinned-wide:title-card">{tool.name}</span>
                      {tool.purpose && (
                        <span className="text-caption text-text-muted">{tool.purpose}</span>
                      )}
                    </Card>
                  </DeckCard>
                ))}
              </ul>
            </div>
          </div>
        </PinnedStage>
      </SkillsMotion>
    </section>
  );
}
