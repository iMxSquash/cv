import { getMessages } from "@/lib/i18n/messages";

// The backoffice is French only; public pages read the labels of the visitor's locale.
export const SKILL_CATEGORY_LABELS = getMessages("fr").skills.categories;
export const LINK_PLATFORM_LABELS = getMessages("fr").linkPlatforms;
