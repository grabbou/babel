import 'dotenv/config'

import { join } from 'path'

import { buildPrompt, callClaude, getFileTypeDeclaration } from '../../src/lib'

const typeDefs = getFileTypeDeclaration(join(__dirname, './functions.ts'))

const prompt = buildPrompt(typeDefs, 'Generate an image of a cat.')

;(async () => {
  const result = await callClaude(prompt)
  console.log(result)
})()
