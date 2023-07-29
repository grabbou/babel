import { buildPrompt, callClaude, getFileTypeDeclaration } from './lib'

type Config = {
  functions: string
  prompt: string
}

export default async function run(config: Config) {
  const typeDefs = getFileTypeDeclaration(config.functions)
  const prompt = buildPrompt(typeDefs, config.prompt)

  const result = await callClaude(prompt)

  return result
}
