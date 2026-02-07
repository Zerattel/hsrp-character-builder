import { START_PHYS, START_SKILL } from './env.js';

const pools = {
  phys: START_PHYS,
  skill: START_SKILL,
};

const user = {
  name: "",
  belong: "",
  classId: "",
  className: "",
  stats: {},
  skills: {},
};

export { pools, user };