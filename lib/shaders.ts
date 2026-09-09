import { palette, type ShaderUniforms } from "@/components/shader-background";

/**
 * Shared tuning notes
 * -------------------
 * The stock "Grain Gradient" preset ships at grain 0.042 / contrast 1.005,
 * which reads as a soft wash once it's scaled up to a full panel. Both
 * presets below push grain and contrast hard and keep blur at zero so the
 * colour fields stay crisp at large sizes.
 */
const BASE: Partial<ShaderUniforms> = {
  warp: 0,
  brightness: 0,
  hue: 0,
  vignette: 0,
  blur: 0,
  rotate: 0,
  drift: 0,
  cursorEnabled: false,
  oklab: 1,
};

/** the ElevenLabs-style distorted green: emerald, olive, teal, sand */
export const GREEN_MESH: Partial<ShaderUniforms> = {
  ...BASE,
  colors: palette(["#0C3A20", "#2FA35C", "#AFC24E", "#E6C36A", "#126E63"]),
  colorCount: 5,
  scale: 1.06,
  intensity: 0.46,
  paramA: 0.34,
  detail: 2.75,
  contrast: 1.3,
  saturation: 1.12,
  grain: 0.17,
  seed: 7,
  timeScale: 0.3,
};

/** same field, cooler and deeper — used behind the final call to action */
export const GREEN_MESH_DEEP: Partial<ShaderUniforms> = {
  ...GREEN_MESH,
  colors: palette(["#08301B", "#1F8C4E", "#8FAE44", "#D8B75F", "#0E5F57"]),
  colorCount: 5,
  intensity: 0.4,
  contrast: 1.34,
  grain: 0.19,
  seed: 21,
  timeScale: 0.22,
};

/** the GovDash-style blurred, heavily grained warm grey */
export const GREY_GRAIN: Partial<ShaderUniforms> = {
  ...BASE,
  colors: palette(["#7A756B", "#B4AFA3", "#E9E5DA", "#98938A"]),
  colorCount: 4,
  scale: 1.5,
  intensity: 0.34,
  paramA: 0.22,
  detail: 2.2,
  contrast: 1.14,
  saturation: 0.35,
  grain: 0.22,
  seed: 3,
  timeScale: 0.14,
};
