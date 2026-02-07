import { START_PHYS, START_SKILL } from './env.js';

let currentPhysPool = START_PHYS;
let currentSkillPool = START_SKILL;

let user = {
  name: "",
  belong: "",
  classId: "",
  className: "",
  stats: {},
  skills: {},
};

export { currentPhysPool, currentSkillPool, user };