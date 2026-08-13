export const SITE = {
  name: "CAPITOVA",
  tagline: "Precision biology at the smallest scale.",
  description:
    "CAPITOVA is a biotechnology company applying computational protein design to therapeutic discovery — engineering molecules with atomic precision.",
  url: "https://capitova.com",
} as const;

export type NavItem = {
  id: string;
  label: string;
};

export const NAV: readonly NavItem[] = [
  { id: "about", label: "About" },
  { id: "technology", label: "Technology" },
  { id: "capabilities", label: "Capabilities" },
  { id: "impact", label: "Impact" },
  { id: "contact", label: "Contact" },
] as const;

export type Channel = { label: string; email: string };

export const CONTACT_CHANNELS: readonly Channel[] = [
  { label: "General", email: "hello@capitova.bio" },
  { label: "Research", email: "research@capitova.bio" },
  { label: "Press", email: "press@capitova.bio" },
] as const;
