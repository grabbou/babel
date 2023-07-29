import 'dotenv/config'

import * as path from 'path'

import run from '../../src'

// Main entry point
;(async () => {
  const response = await run({
    functions: path.join(__dirname, './functions.ts'),
    prompt: 'What is the temperature right now?',
  })

  console.log(response)
})()
