import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/cv/queries";
import { OG_PALETTE } from "@/lib/og-palette";
import { SITE_URL } from "@/lib/site";

// Same daily refresh as the pages; /admin writes revalidate it immediately.
export const revalidate = 86400;

export const alt = "Carte de présentation du CV en ligne : nom, poste et disponibilité";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  surface: OG_PALETTE["--palette-primary-darkest"],
  text: OG_PALETTE["--palette-primary-lightest"],
  accent: OG_PALETTE["--palette-primary-light"],
  muted: OG_PALETTE["--palette-gray-light"],
  primary: OG_PALETTE["--palette-primary"],
  secondary: OG_PALETTE["--palette-secondary"],
  info: OG_PALETTE["--palette-info"],
  success: OG_PALETTE["--palette-success"],
};

// Static TTF instances: ImageResponse reads neither WOFF2 nor variable fonts.
const FONTS_DIR = join(process.cwd(), "src/assets/fonts");

export default async function OpengraphImage() {
  const [profile, outfit, dmSans] = await Promise.all([
    getProfile(),
    readFile(join(FONTS_DIR, "Outfit-SemiBold.ttf")),
    readFile(join(FONTS_DIR, "DMSans-Regular.ttf")),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        color: COLORS.text,
        fontFamily: "DM Sans",
        backgroundColor: COLORS.surface,
        // Same three hues as the hero WebGL gradient, kept away from the text.
        backgroundImage: [
          `radial-gradient(circle at 92% 8%, ${COLORS.primary} 0%, transparent 45%)`,
          `radial-gradient(circle at 70% 105%, ${COLORS.secondary} 0%, transparent 50%)`,
          `radial-gradient(circle at 105% 70%, ${COLORS.info} 0%, transparent 35%)`,
        ].join(", "),
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: COLORS.muted }}>
        {new URL(SITE_URL).host}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <div
          style={{
            fontFamily: "Outfit",
            fontSize: 128,
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            maxWidth: 900,
          }}
        >
          {profile.full_name}
        </div>
        <div style={{ marginTop: 28, fontFamily: "Outfit", fontSize: 56, color: COLORS.accent }}>
          {profile.headline}
        </div>
      </div>
      {profile.is_available && profile.availability_title && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <div
            style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.success }}
          />
          {profile.availability_title}
        </div>
      )}
    </div>,
    {
      ...size,
      fonts: [
        { name: "Outfit", data: outfit, weight: 600, style: "normal" },
        { name: "DM Sans", data: dmSans, weight: 400, style: "normal" },
      ],
    },
  );
}
