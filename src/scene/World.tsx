import { AgentForm } from './AgentForm'
import { AgentScreens } from './AgentScreens'
import { Slot } from './AssetSlot'
import { Doors } from './Doors'
import { FrameworkPanels } from './FrameworkPanels'
import { Lighting } from './Lighting'
import { Particles } from './Particles'
import { AgentRoom } from './procedural/AgentRoom'
import { City } from './procedural/City'
import { Corridor } from './procedural/Corridor'
import { Ground } from './procedural/Ground'
import { HeroBuilding } from './procedural/HeroBuilding'
import { HeroSign } from './HeroSign'
import { Sky } from './procedural/Sky'

/**
 * Scene composition. Each <Slot> renders the registered glTF (src/config/assets.ts)
 * or its procedural placeholder. Content-driven pieces (panels, screens, doors,
 * the agent form, lighting) are always React components so they keep working
 * whichever shell models are swapped in.
 */
export function World() {
  return (
    <>
      <Slot name="sky" fallback={<Sky />} />
      <Slot name="ground" fallback={<Ground />} />
      <Slot name="city" fallback={<City />} />
      <Slot name="heroBuilding" fallback={<HeroBuilding />} />
      <HeroSign />
      <Doors />
      <Slot name="corridor" fallback={<Corridor />} />
      <FrameworkPanels />
      <Slot name="agentRoom" fallback={<AgentRoom />} />
      <AgentScreens />
      <AgentForm />
      <Particles />
      <Lighting />
    </>
  )
}
