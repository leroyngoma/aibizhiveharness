import z from "@deepseek-ai/schemastery";
// Upstream host entry from @deepseek-ai/dsh-client-ui-theme@0.1.2-rc.1 (kept DOM-free)

const THEME_PREFERENCES = ["light", "dark", "system"];
const THEME_SETTINGS_NAMESPACE = "ui-theme";
const THEME_PREFERENCE_FIELD = "preference";
const FONT_SIZE_FIELD = "fontSize";
const DEFAULT_PREFERENCE = "system";
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 17;
const DEFAULT_FONT_SIZE = 14;

const ThemeSettingsSchema = z.object({
  [THEME_PREFERENCE_FIELD]: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
  [FONT_SIZE_FIELD]: z.number().step(1).min(FONT_SIZE_MIN).max(FONT_SIZE_MAX).default(DEFAULT_FONT_SIZE),
});

function bootThemeScript(preference, fontSize) {
  return `(() => {\n  const preference = ${JSON.stringify(preference)}\n  const systemDark = preference === 'system'\n    && typeof matchMedia !== 'undefined'\n    && matchMedia('(prefers-color-scheme: dark)').matches\n  const dark = preference === 'dark' || systemDark\n  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'\n  document.body.toggleAttribute('data-ds-dark-theme', dark)\n  document.body.style.setProperty('--dsh-content-font-size', ${JSON.stringify(`${fontSize}px`)})\n})()`;
}

function bootThemeInjection(preference = DEFAULT_PREFERENCE, fontSize = DEFAULT_FONT_SIZE) {
  return {
    kind: "script",
    placement: "body",
    text: bootThemeScript(preference, fontSize),
  };
}

function readSection(ctx) {
  const fallback = { preference: DEFAULT_PREFERENCE, fontSize: DEFAULT_FONT_SIZE };
  const settings = ctx.get("settings");
  if (settings === void 0) return fallback;
  const section = settings.get(THEME_SETTINGS_NAMESPACE);
  if (section === void 0) return fallback;
  return section;
}

function apply(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(THEME_SETTINGS_NAMESPACE, ThemeSettingsSchema);
  });

  ctx.on("webserver/index-inject", (table) => {
    const section = readSection(ctx);
    table.push(bootThemeInjection(section.preference, section.fontSize));
  });
}

export {
  DEFAULT_FONT_SIZE,
  DEFAULT_PREFERENCE,
  FONT_SIZE_FIELD,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  THEME_PREFERENCES,
  THEME_PREFERENCE_FIELD,
  THEME_SETTINGS_NAMESPACE,
  apply,
};
