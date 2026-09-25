import { START_PHYS, START_SKILL, START_PERK } from './env.js';

const pools = {
  phys: START_PHYS,
  skill: START_SKILL,
  perk: START_PERK,
};

const user = {
  name: "",
  belong: "",
  classId: "",
  className: "",
  stats: {},
  skills: {},
  perks: {}, // { perkId: cost }
};

export { pools, user };
