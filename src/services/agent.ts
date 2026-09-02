import { AGENT_OUTPUT, SCREEN_COUNT, type AgentOutput } from '../config/content'

export interface AgentRunResult {
  output: AgentOutput
  /** How many wall screens the run lights up, in order. */
  screenCount: number
}

/**
 * Backend swap point.
 * TODO: replace with
 *   fetch('/api/agent/run', { method: 'POST', body: JSON.stringify({ brief }) })
 * and map the response onto AgentRunResult. The wall-screen artwork is still
 * drawn client-side in src/lib/textures/screens.ts until the server supplies it.
 */
export async function requestAgentRun(brief: string): Promise<AgentRunResult> {
  void brief
  return { output: AGENT_OUTPUT, screenCount: SCREEN_COUNT }
}
