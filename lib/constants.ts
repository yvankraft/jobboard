export const SITE = {
  name: "Jobwave",
  title: "Jobwave — Offres d'emploi tech",
  description:
    "La job board des talents tech : offres vérifiées, candidature en 2 minutes, suivi en temps réel.",
  email: "hello@jobwave.dev",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const CONTRACT_LABELS: Record<string, string> = {
  CDI: "CDI",
  CDD: "CDD",
  FREELANCE: "Freelance",
  STAGE: "Stage",
  ALTERNANCE: "Alternance",
};

export const REMOTE_LABELS: Record<string, string> = {
  ONSITE: "Sur site",
  HYBRID: "Hybride",
  FULL_REMOTE: "Full remote",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
  CLOSED: "Clôturée",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  NEW: "Nouvelle",
  REVIEWED: "Vue",
  INTERVIEW: "Entretien",
  REJECTED: "Refusée",
  ACCEPTED: "Acceptée",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employeur",
  CANDIDATE: "Candidat",
};
