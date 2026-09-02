import { useMemo } from 'react'
import { mulberry32 } from '../../lib/rng'
import { Building } from './Building'

const CITY_SEED = 0xe10f
const COUNT = 18

/** Background skyline: 18 random towers kept clear of the hero building's approach. */
export function City() {
  const buildings = useMemo(() => {
    const rand = mulberry32(CITY_SEED)
    const list: { x: number; z: number; w: number; d: number; h: number; seed: number }[] = []
    for (let i = 0; i < COUNT; i++) {
      let x = 0
      let z = 0
      let guard = 0
      do {
        x = (rand() - 0.5) * 180
        z = -80 + rand() * 60
        guard++
      } while (Math.abs(x) < 20 && z > -50 && guard < 40)
      list.push({
        x,
        z,
        w: 6 + rand() * 10,
        d: 6 + rand() * 10,
        h: 15 + rand() * 35,
        seed: CITY_SEED + i * 7919,
      })
    }
    return list
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} w={b.w} h={b.h} d={b.d} seed={b.seed} position={[b.x, b.h / 2, b.z]} />
      ))}
    </group>
  )
}
