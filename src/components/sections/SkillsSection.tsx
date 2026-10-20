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
import { STEP_SCREENS, WHEEL_STEP_DEG } from "./skillsWheel";

type Group = Enums<"cv_skill_category"> | "tools";

/*
 * From 900 px wide with motion, every skill and tool sits on the rim of one
 * wheel, its name facing a still orb that takes the shape of its logo. Each
 * item is placed by its index (--i), the wheel itself is turned step by step
 * by the scroll. Below that, the lists stay a plain grid.
 */
const WHEEL_ITEM =
  "pinned-wide:absolute pinned-wide:top-1/2 pinned-wide:left-1/2 pinned-wide:size-0 pinned-wide:opacity-(--visible,0) pinned-wide:[transform:rotate(calc(var(--i)*var(--wheel-step)))_translateX(var(--wheel-radius))]";
const WHEEL_LABEL =
  "pinned-wide:absolute pinned-wide:top-0 pinned-wide:right-0 pinned-wide:origin-right pinned-wide:-translate-y-1/2 pinned-wide:whitespace-nowrap pinned-wide:scale-(--zoom,1) pinned-wide:items-end pinned-wide:text-right pinned-wide:text-[clamp(1.25rem,3.2vmin,2rem)]";

/** One skill or tool on the rim: SkillsMotion finds it by `data-wheel-item` and reads its logo from `data-logo-url`. */
function WheelItem({
  index,
  logoUrl,
  children,
}: {
  index: number;
  logoUrl: string | null;
  children: ReactNode;
}) {
  return (
    <li
      data-wheel-item
      data-logo-url={logoUrl ?? undefined}
      style={{ "--i": index } as CSSProperties}
      className={WHEEL_ITEM}
    >
      {children}
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
  const groupLabels: Record<Group, string> = { ...t.categories, tools: t.tools };
  const skillsByCategory = Constants.public.Enums.cv_skill_category.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  }));
  // Wheel order follows the page order: skills category after category, then the tools.
  const orderedSkills = skillsByCategory.flatMap(({ items }) => items);
  const skillIndex = new Map(orderedSkills.map((skill, index) => [skill.id, index]));

  return (
    <section id="skills" aria-labelledby="skills-title" data-theme="light">
      <SkillsMotion>
        <PinnedStage
          screens={1 + (orderedSkills.length + tools.length - 1) * STEP_SCREENS}
          stageClassName="section-shell [--wheel-radius:clamp(14rem,62dvh,40rem)] pinned-wide:relative pinned-wide:py-12"
        >
          <h2
            id="skills-title"
            className="title-section pinned-wide:absolute pinned-wide:inset-x-0 pinned-wide:top-8 pinned-wide:z-10 pinned-wide:text-center"
          >
            {t.title}
            <OrbAnchor isFollowed={false} />
          </h2>

          {/* The still orb: its box tells the scene where to pose it. */}
          <div
            aria-hidden="true"
            data-skills-blob
            className="hidden pinned-wide:absolute pinned-wide:top-1/2 pinned-wide:right-[12%] pinned-wide:block pinned-wide:size-[clamp(12rem,38dvh,24rem)] pinned-wide:-translate-y-1/2"
          />

          <div
            data-skills-wheel
            style={{ "--wheel-step": `${WHEEL_STEP_DEG}deg` } as CSSProperties}
            className="mt-10 grid gap-10 md:grid-cols-2 pinned-wide:absolute pinned-wide:top-[calc(50%-var(--wheel-radius))] pinned-wide:left-[calc(44%-var(--wheel-radius)*2)] pinned-wide:mt-0 pinned-wide:block pinned-wide:size-[calc(var(--wheel-radius)*2)]"
          >
            {skillsByCategory.map(({ category, items }) => (
              <div key={category} className="pinned-wide:contents">
                <h3 className="title-card pinned-wide:sr-only">{groupLabels[category]}</h3>
                <ul className="mt-4 flex flex-wrap gap-3 pinned-wide:contents">
                  {items.map((skill) => (
                    <WheelItem
                      key={skill.id}
                      index={skillIndex.get(skill.id) ?? 0}
                      logoUrl={skill.logo_url}
                    >
                      <SkillChip
                        label={skill.label}
                        details={skill.details}
                        className={`${WHEEL_LABEL} pinned-wide:bg-transparent pinned-wide:shadow-none`}
                      />
                    </WheelItem>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-2 pinned-wide:contents">
              <h3 className="title-card pinned-wide:sr-only">{groupLabels.tools}</h3>
              <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 pinned-wide:contents">
                {tools.map((tool, index) => (
                  <WheelItem
                    key={tool.id}
                    index={orderedSkills.length + index}
                    logoUrl={tool.logo_url}
                  >
                    <Card
                      className={`flex h-full flex-col items-center justify-center gap-2 text-center ${WHEEL_LABEL} pinned-wide:bg-transparent pinned-wide:p-0 pinned-wide:shadow-none`}
                    >
                      <CvIcon
                        name={tool.icon_key}
                        className="size-8 text-accent pinned-wide:hidden"
                      />
                      <span className="font-medium">{tool.name}</span>
                      {tool.purpose && (
                        <span className="text-caption text-text-muted pinned-wide:sr-only">
                          {tool.purpose}
                        </span>
                      )}
                    </Card>
                  </WheelItem>
                ))}
              </ul>
            </div>
          </div>
        </PinnedStage>
      </SkillsMotion>
    </section>
  );
}
