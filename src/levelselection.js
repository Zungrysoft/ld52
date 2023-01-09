import * as level1 from './data/level1.js'
import * as level2 from './data/level2.js'
import * as level3 from './data/level3.js'
import * as level4 from './data/level4.js'
import * as level5 from './data/level5.js'
import * as level6 from './data/level6.js'
import * as level7 from './data/level7.js'

export function selectLevel(level) {
  if (level === 2) {return level2.data}
  if (level === 3) {return level3.data}
  if (level === 4) {return level4.data}
  if (level === 5) {return level5.data}
  if (level === 6) {return level6.data}
  if (level === 7) {return level7.data}

  return level1.data
}