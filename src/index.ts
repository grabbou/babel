import { buildPrompt, callClaude, getFileTypeDeclaration, parseCode, runCode } from './lib'

type Config = {
  functions: string
  prompt: string
  apiKey: string
  debug?: boolean
}

export default async function run(config: Config) {
  if (config.debug) console.log(`Building agent for question: ${config.prompt}`)

  const prompt = buildPrompt(getFileTypeDeclaration(config.functions), config.prompt)
  if (config.debug) console.log(`Sending the prompt to Claude: ${prompt}`)

  const agent = await callClaude(prompt, config.apiKey)
  if (config.debug) console.log(`Received agent code: ${agent.code}`)

  if (agent.error) {
    console.log(`Received agent error: ${agent.error}`)
    console.log(`Code: ${agent.code}`)
    return agent.error
  }

  const code = parseCode(agent.code)

  try {
    const result = await runCode(code)
    return result
  } catch (e) {
    console.log(`Error while running the agent: ${e}`)
    console.log(`Code: ${agent.code}`)
    return e
  }
}
