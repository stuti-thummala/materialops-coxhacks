import type { LanguagePref } from "@/store/useMaterialOpsStore";

// Lightweight translation table for the mobile field app. Covers the account
// screen and bottom navigation so a language change is immediately visible.
type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.tasks": "Tasks",
  "nav.scan": "Scan",
  "nav.report": "Report",
  "nav.proof": "Proof",
  "nav.account": "Account",
  // account
  "account.title": "Account",
  "account.subtitle": "Your profile and app settings",
  "account.role": "Crew Alpha · Field Recovery",
  "account.badge": "Top Recoverer · MBS 2026",
  "account.stat.scanned": "Items scanned",
  "account.stat.tasks": "Tasks done",
  "account.stat.reports": "Spots reported",
  "account.settings": "Settings",
  "account.notifications": "Notifications",
  "account.language": "Language",
  "account.darkMode": "Dark mode",
  "account.privacy": "Privacy & data",
  "account.privacyBody":
    "Your location is only shared while you have an active recovery task. Scan photos stay on-device unless you submit a report.",
  "account.exportData": "Export my data",
  "account.help": "Help & support",
  "account.helpBody": "Need a hand in the field? Reach the ops desk anytime.",
  "account.callOps": "Call ops desk",
  "account.emailSupport": "Email support",
  "account.signOut": "Sign out",
  // theme values
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
};

const es: Dict = {
  "nav.tasks": "Tareas",
  "nav.scan": "Escanear",
  "nav.report": "Reportar",
  "nav.proof": "Prueba",
  "nav.account": "Cuenta",
  "account.title": "Cuenta",
  "account.subtitle": "Tu perfil y ajustes de la app",
  "account.role": "Crew Alpha · Recuperación en campo",
  "account.badge": "Mejor recuperador · MBS 2026",
  "account.stat.scanned": "Artículos escaneados",
  "account.stat.tasks": "Tareas hechas",
  "account.stat.reports": "Puntos reportados",
  "account.settings": "Ajustes",
  "account.notifications": "Notificaciones",
  "account.language": "Idioma",
  "account.darkMode": "Modo oscuro",
  "account.privacy": "Privacidad y datos",
  "account.privacyBody":
    "Tu ubicación solo se comparte mientras tienes una tarea de recuperación activa. Las fotos quedan en el dispositivo salvo que envíes un reporte.",
  "account.exportData": "Exportar mis datos",
  "account.help": "Ayuda y soporte",
  "account.helpBody": "¿Necesitas ayuda en el campo? Contacta al equipo cuando sea.",
  "account.callOps": "Llamar a operaciones",
  "account.emailSupport": "Enviar correo",
  "account.signOut": "Cerrar sesión",
  "theme.system": "Sistema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
};

const fr: Dict = {
  "nav.tasks": "Tâches",
  "nav.scan": "Scanner",
  "nav.report": "Signaler",
  "nav.proof": "Preuve",
  "nav.account": "Compte",
  "account.title": "Compte",
  "account.subtitle": "Votre profil et les réglages",
  "account.role": "Crew Alpha · Récupération terrain",
  "account.badge": "Meilleur récupérateur · MBS 2026",
  "account.stat.scanned": "Articles scannés",
  "account.stat.tasks": "Tâches faites",
  "account.stat.reports": "Points signalés",
  "account.settings": "Réglages",
  "account.notifications": "Notifications",
  "account.language": "Langue",
  "account.darkMode": "Mode sombre",
  "account.privacy": "Confidentialité",
  "account.privacyBody":
    "Votre position n'est partagée que pendant une tâche de récupération active. Les photos restent sur l'appareil sauf si vous envoyez un signalement.",
  "account.exportData": "Exporter mes données",
  "account.help": "Aide et support",
  "account.helpBody": "Besoin d'aide sur le terrain ? Contactez l'équipe à tout moment.",
  "account.callOps": "Appeler l'équipe",
  "account.emailSupport": "Envoyer un e-mail",
  "account.signOut": "Se déconnecter",
  "theme.system": "Système",
  "theme.light": "Clair",
  "theme.dark": "Sombre",
};

const de: Dict = {
  "nav.tasks": "Aufgaben",
  "nav.scan": "Scannen",
  "nav.report": "Melden",
  "nav.proof": "Nachweis",
  "nav.account": "Konto",
  "account.title": "Konto",
  "account.subtitle": "Dein Profil und App-Einstellungen",
  "account.role": "Crew Alpha · Feld-Rückgewinnung",
  "account.badge": "Top-Sammler · MBS 2026",
  "account.stat.scanned": "Gescannte Artikel",
  "account.stat.tasks": "Erledigte Aufgaben",
  "account.stat.reports": "Gemeldete Stellen",
  "account.settings": "Einstellungen",
  "account.notifications": "Benachrichtigungen",
  "account.language": "Sprache",
  "account.darkMode": "Dunkelmodus",
  "account.privacy": "Datenschutz",
  "account.privacyBody":
    "Dein Standort wird nur während einer aktiven Aufgabe geteilt. Fotos bleiben auf dem Gerät, bis du eine Meldung sendest.",
  "account.exportData": "Meine Daten exportieren",
  "account.help": "Hilfe & Support",
  "account.helpBody": "Brauchst du Hilfe im Feld? Erreiche das Team jederzeit.",
  "account.callOps": "Team anrufen",
  "account.emailSupport": "E-Mail senden",
  "account.signOut": "Abmelden",
  "theme.system": "System",
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
};

const DICTS: Record<LanguagePref, Dict> = { en, es, fr, de };

export const LANGUAGE_LABELS: Record<LanguagePref, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export const LANGUAGE_ORDER: LanguagePref[] = ["en", "es", "fr", "de"];

export function translate(lang: LanguagePref, key: string): string {
  return DICTS[lang][key] ?? en[key] ?? key;
}
