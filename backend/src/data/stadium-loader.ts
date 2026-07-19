import { StadiumData } from '../types/stadium';
import { STADIUM_GATES } from './stadium-data';

export function getStadiumData(): StadiumData {
  return { gates: STADIUM_GATES };
}
