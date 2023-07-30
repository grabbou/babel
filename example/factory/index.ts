import 'dotenv/config'

import * as path from 'path'

import run from '../../src'

// Main entry point
;(async () => {
  const response = await run({
    functions: path.join(__dirname, './functions.ts'),
    prompt:
      'For the iPhone of IMEI 123456789, check whether it passes the overall quality assurance. To pass, it has to score over 0.5 on average in the battery, defects and liability scores.',
    debug: true,
    apiKey: process.env.CLAUDE_KEY as string,
  })

  console.log(response)
})()
