import type { Equipment, EquipmentInput } from "./types";

export const ALL_EQUIPMENT: Equipment[] = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "bands",
  "pullup_bar",
  "bench",
  "bodyweight",
];

/** Normalize a stored equipment value (array inventory or legacy string) → Set. */
export function equipmentSet(equip: EquipmentInput): Set<string> {
  if (Array.isArray(equip)) {
    const s = new Set<string>(equip);
    s.add("bodyweight"); // always available
    return s;
  }
  if (equip === "home") return new Set(["dumbbell", "bands", "bodyweight"]);
  if (equip === "minimal" || equip === "none") return new Set(["bodyweight"]);
  // "gym" / unknown → full access
  return new Set(ALL_EQUIPMENT);
}

/** eid → ordered fallbacks keyed by the equipment needed for each fallback. */
const SUBS: Record<string, Array<[string, string]>> = {
  bench: [["machine", "machine_chest_press"], ["dumbbell", "incline_db"], ["bodyweight", "pushup"]],
  cgbench: [["machine", "tricep_pushdown"], ["dumbbell", "incline_db"], ["bodyweight", "diamond_pushup"]],
  incline_db: [["machine", "machine_chest_press"], ["bodyweight", "decline_pushup"]],
  squat: [["machine", "leg_press"], ["dumbbell", "goblet_squat"], ["bodyweight", "air_squat"]],
  deadlift: [["dumbbell", "rdl"], ["kettlebell", "kb_swing"], ["bodyweight", "glute_bridge"]],
  rdl: [["kettlebell", "kb_swing"], ["dumbbell", "hip_thrust"], ["bodyweight", "glute_bridge"]],
  row: [["machine", "seated_cable_row"], ["dumbbell", "chest_supported_row"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  pullup: [["machine", "lat_pulldown"], ["pullup_bar", "chinup"], ["bands", "face_pull"], ["bodyweight", "inverted_row"]],
  ohp: [["dumbbell", "arnold_press"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]],
  dip: [["machine", "tricep_pushdown"], ["bodyweight", "diamond_pushup"]],
  farmer: [["dumbbell", "suitcase"], ["bodyweight", "plank"]],
  lunge: [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  bss: [["dumbbell", "step_up"], ["bodyweight", "air_squat"]],
  lat_raise: [["machine", "rear_delt_fly"], ["bands", "champagne"], ["bodyweight", "pike_pushup"]],
};

/** Equipment an exercise needs (anything not listed is bodyweight). */
const EX_EQUIP: Record<string, Equipment> = {
  bench: "barbell", cgbench: "barbell", squat: "barbell", deadlift: "barbell",
  rdl: "barbell", row: "barbell", ohp: "dumbbell", incline_db: "dumbbell",
  dip: "bodyweight", farmer: "dumbbell", lunge: "dumbbell", bss: "dumbbell",
  lat_raise: "dumbbell", pullup: "pullup_bar", face_pull: "bands",
  // Wave 2 catalog
  front_squat: "barbell", goblet_squat: "dumbbell", leg_press: "machine", hack_squat: "machine",
  leg_ext: "machine", leg_curl: "machine", calf_raise: "machine", step_up: "dumbbell",
  glute_bridge: "bodyweight", bb_hip_thrust: "barbell", kb_swing: "kettlebell",
  lat_pulldown: "machine", seated_cable_row: "machine", chest_supported_row: "dumbbell",
  inverted_row: "bodyweight", chinup: "pullup_bar", shrug: "dumbbell",
  machine_chest_press: "machine", cable_fly: "machine", pec_deck: "machine",
  pike_pushup: "bodyweight", decline_pushup: "bodyweight", diamond_pushup: "bodyweight",
  bb_ohp: "barbell", arnold_press: "dumbbell", rear_delt_fly: "dumbbell",
  bb_curl: "barbell", db_curl: "dumbbell", hammer_curl: "dumbbell", cable_curl: "machine",
  tricep_pushdown: "machine", skullcrusher: "barbell", overhead_ext: "dumbbell",
  hanging_leg_raise: "pullup_bar", cable_crunch: "machine", russian_twist: "bodyweight",
  side_plank: "bodyweight", mountain_climber: "bodyweight",
  row_erg: "machine", bike_erg: "machine", jump_rope: "bodyweight", box_jump: "bodyweight", wall_ball: "machine",
};

export function exerciseNeeds(eid: string): Equipment {
  return EX_EQUIP[eid] || "bodyweight";
}

/** Return an eid the user can actually perform with their equipment. */
export function substituteEid(eid: string, equip: EquipmentInput): string {
  const set = equipmentSet(equip);
  const need = exerciseNeeds(eid);
  if (need === "bodyweight" || set.has(need)) return eid;
  const subs = SUBS[eid] || [];
  for (const [req, altEid] of subs) {
    if (req === "bodyweight" || set.has(req)) return altEid;
  }
  return eid; // no known sub — leave as-is
}
