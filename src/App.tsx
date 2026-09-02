import { CorridorLabel } from './hud/CorridorLabel'
import { Flash } from './hud/Flash'
import { IntroCard } from './hud/IntroCard'
import { MainHud } from './hud/MainHud'
import { OutputModal } from './hud/OutputModal'
import { SkipIntro } from './hud/SkipIntro'
import { SummaryPanel } from './hud/SummaryPanel'
import { useFontsReady } from './lib/useFontsReady'
import { Experience } from './scene/Experience'
import { useExperience } from './state/experience'

export default function App() {
  const fontsReady = useFontsReady()
  const sceneReady = useExperience((s) => s.sceneReady)

  return (
    // `.ready` starts the CSS title animation at the same moment the scene clock starts
    <div className={sceneReady ? 'app ready' : 'app'}>
      <div id="canvas-container">{fontsReady && <Experience />}</div>

      <IntroCard />
      {!sceneReady && <div id="intro-loading">BUILDING SCENE</div>}
      <Flash />
      <CorridorLabel />
      <MainHud />
      <SummaryPanel />
      <OutputModal />
      <SkipIntro />
    </div>
  )
}
