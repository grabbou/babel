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
  if (config.debug) console.log(`Received agent code: ${agent}`)

  const code = parseCode(agent)
  const result = await runCode(code)

  return result
}
