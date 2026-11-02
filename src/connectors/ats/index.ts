import type { Connector } from '../../type/types.js';
import { greenhouse } from './greenhouse.js';
import { lever } from './lever.js';
import { workable } from './workable.js';
import { ashby } from './ashby.js';
import { smartrecruiters } from './smartrecruiters.js';
import { recruitee } from './recruitee.js';

export const atsConnectors: Record<string, Connector> = {
  greenhouse, lever, workable, ashby, smartrecruiters, recruitee,
  // TODO: bamboohr, breezy, comeet, freshteam, icims, jobvite, join,
  // oracle-recruiting, personio, pinpoint, rippling, successfactors,
  // taleo, teamtailor, workday
};