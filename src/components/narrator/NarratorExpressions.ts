// Face presets. The rig smoothly blends toward whichever one is active.
// eyeX/eyeY: eye scale | blush: cheek opacity | smile: beak widening
// beakOpen: resting beak opening | tilt: head roll
export interface ExpressionPreset {
  eyeX: number;
  eyeY: number;
  blush: number;
  smile: number;
  beakOpen: number;
  tilt: number;
}

export const EXPRESSIONS: Record<string, ExpressionPreset> = {
  neutral:   { eyeX: 1.0,  eyeY: 1.0,  blush: 0.55, smile: 0.0, beakOpen: 0.03, tilt: 0 },
  happy:     { eyeX: 1.05, eyeY: 0.82, blush: 1.0,  smile: 1.0, beakOpen: 0.07, tilt: 0.04 },
  surprised: { eyeX: 1.2,  eyeY: 1.25, blush: 0.7,  smile: 0.0, beakOpen: 0.28, tilt: 0 },
  curious:   { eyeX: 1.08, eyeY: 1.1,  blush: 0.7,  smile: 0.3, beakOpen: 0.04, tilt: -0.1 },
};
