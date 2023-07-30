import 'dotenv/config'

import path from 'path'
import readline from 'readline'

import run from '../../src'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper function to ask a question and return a promise
function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const prompt = await ask('Please enter the prompt: ')

      if (!prompt) {
        console.log('No prompt provided. Please try again.')
        continue
      }

      const response = await run({
        functions: path.join(__dirname, './functions.ts'),
        prompt,
        apiKey: process.env.CLAUDE_KEY as string,
      })

      console.log(response)
    }
  } catch (error) {
    console.error('An error occurred:', error)
  } finally {
    // Close the readline interface
    rl.close()
  }
}

// Call the function to start the loop
main()
