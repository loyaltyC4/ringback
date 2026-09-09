import { palette, type ShaderUniforms } from "@/components/shader-background";

/**
 * Tuning notes
 * ------------
 * The stock "Grain Gradient" preset ships at grain 0.042 / contrast 1.005 /
 * warp 0, which at panel size reads as a flat wash with a hard diagonal band
 * through it. Three changes fix that, and they were arrived at by rendering
 * the shader side by side at several settings:
 *
 *  - `warp` above ~0.25 breaks the diagonal band into organic, mottled fields.
 *    This is what makes it read as "distorted" rather than a linear gradient.
 *  - `grain` around 0.11-0.15 gives visible film grain. Pushing it to 0.17+
 *    stops looking like grain and starts looking like compression artefacts.
 *  - a *small* `blur` (0.10-0.16) is essential. At blur 0 the colour field
 *    dithers into hard 4-6px blocks, which is the single thing that made the
 *    earlier CSS-gradient version look cheap. Blur smooths the field while the
 *    grain sits on top, so the result is soft *and* textured.
 *
 * `contrast` stays low (~1.06). Higher values posterise the field.
 */
const BASE: Partial<ShaderUniforms> = {
  brightness: 0,
  hue: 0,
  vignette: 0,
  rotate: 0,
  drift: 0,
  cursorEnabled: false,
  oklab: 0,
};

/** the ElevenLabs-style distorted green: deep forest, teal, olive, muted sand */
export const GREEN_MESH: Partial<ShaderUniforms> = {
  ...BASE,
  colors: palette(["#0A3320", "#26704A", "#5F7F3A", "#B0925A", "#12574E"]),
  colorCount: 5,
  scale: 1.3,
  intensity: 0.34,
  paramA: 0.28,
  warp: 0.25,
  detail: 3.4,
  contrast: 1.06,
  saturation: 0.9,
  blur: 0.1,
  grain: 0.11,
  seed: 11,
  timeScale: 0.26,
};

/** same family, darker and more mottled — sits behind the final call to action */
export const GREEN_MESH_DEEP: Partial<ShaderUniforms> = {
  ...BASE,
  colors: palette(["#07281A", "#1F6042", "#4E6B30", "#997C4B", "#0D4740"]),
  colorCount: 5,
  scale: 1.22,
  intensity: 0.36,
  paramA: 0.3,
  warp: 0.45,
  detail: 3.2,
  contrast: 1.08,
  saturation: 0.88,
  blur: 0.14,
  grain: 0.12,
  seed: 4,
  timeScale: 0.2,
};

/** the GovDash-style soft, heavily grained warm grey */
export const GREY_GRAIN: Partial<ShaderUniforms> = {
  ...BASE,
  colors: palette(["#7A756B", "#B4AFA3", "#E9E5DA", "#98938A"]),
  colorCount: 4,
  scale: 1.55,
  intensity: 0.3,
  paramA: 0.2,
  warp: 0.3,
  detail: 3.2,
  contrast: 1.04,
  saturation: 0.3,
  blur: 0.14,
  grain: 0.15,
  seed: 5,
  timeScale: 0.12,
};
