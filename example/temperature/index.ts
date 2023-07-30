import 'dotenv/config'

import * as path from 'path'

import run from '../../src'

// Main entry point
;(async () => {
  const response = await run({
    functions: path.join(__dirname, './functions.ts'),
    prompt: 'Check the temperature in Santa Clara and send it over to my email',
    debug: true,
    apiKey: process.env.CLAUDE_KEY as string,
  })

  console.log(response)
})()
