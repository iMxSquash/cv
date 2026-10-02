import { CvIcon } from "@/components/icons/CvIcon";
import { Flag } from "@/components/icons/Flag";
import { Card } from "@/components/ui/Card";
import type { Language, MobilityItem, Profile } from "@/lib/cv/types";

interface InfosSectionProps {
  profile: Profile;
  languages: Language[];
  mobility: MobilityItem[];
}

export function InfosSection({ profile, languages, mobility }: InfosSectionProps) {
  return (
    <section id="infos" aria-labelledby="infos-title" data-theme="dark" className="section-shell">
      <h2 id="infos-title" className="title-section">
        Infos pratiques
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {profile.availability_title && (
          <Card>
            <h3 className="flex items-center gap-2 title-card">
              {profile.is_available && (
                <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
              )}
              {profile.availability_title}
            </h3>
            {profile.availability_detail && (
              <p className="mt-2 text-text-muted">{profile.availability_detail}</p>
            )}
          </Card>
        )}
        <Card>
          <h3 className="title-card">Langues</h3>
          <ul className="mt-3 grid gap-2">
            {languages.map((language) => (
              <li key={language.id} className="flex items-center gap-3">
                <Flag code={language.flag_code} />
                <span>
                  {language.name} <span className="text-text-muted">({language.level})</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="title-card">Mobilité</h3>
          <ul className="mt-3 grid gap-2">
            {mobility.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <CvIcon name={item.icon_key} className="size-5 shrink-0 text-accent" />
                <span>
                  {item.label}
                  {item.detail && <span className="text-text-muted"> ({item.detail})</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
