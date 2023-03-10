import { atom } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

export const clendarKey = atom({
  key: 'clendarKey',
  default: uuidv4(),
})
