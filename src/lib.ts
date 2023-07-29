import Anthropic from '@anthropic-ai/sdk'
import dedent from 'dedent'
import { Project } from 'ts-morph'
import ts from 'typescript'

type FileDefs = {
  [key: string]: string
}

export const getFileTypeDeclaration = (filePath: string): FileDefs => {
  const project = new Project({ compilerOptions: { declaration: true } })
  project.addSourceFileAtPath(filePath)

  const result = project.emitToMemory({ emitOnlyDtsFiles: true })

  const file = result.getFiles()[0]

  // We're generating typedefs side by side, so we can safely replace the extension
  const filename = file.filePath.replace('.d.ts', '.ts')

  return {
    [filename]: file.text,
  }
}

export const buildPrompt = (files: FileDefs, question: string) => {
  return dedent`
    Human:
    You are a service that provides answers to user questions. You have a set of functions that you can call in order to answer user questions.

    Here is the user question:
    <question>${question}</question>

    Here are the function definitions you can call, grouped in a file:
    ${Object.entries(files).map(
      ([path, content]) => `
        <file path="${path}">
          ${content}
        </file>
      `
    )}
    
    You must:
    - Only call the functions provided in the files above.
    - Return a valid TypeScript file that can be executed.
    - Import all necessary functions from the files above using absolute paths.

    Each <file> tag as a "path" attribute that has an absolute path to a file location. When importing necessary functions,
    you must use exactly that absolute path. You must not use relative paths, as you do not know where your file is executed.
    
    You must include all code in the function that satisfies the following type:
    <response>
      function main(): Promise<string>
    </response
    where \`string\` is the human-readable answer to the user question.

    You must execute the \`main\` function as a last statement in the file.

    You must not:
    - Use any other functions, including built-ins, except for the ones provided in the files above.
    - Define or generate any missing types or structs on the fly.

    If you can't provide a valid TypeScript code that answers the user question, return an empty string.
    If there is a function that is missing and you can't provide an answer to the user question based on available APIs,
    return an empty string.

    You must only return the code snippet that will be executed. Do not include anything before or after the code you return.

    Assistant:
    // file: index.ts
  `
}

export const parseCode = (code: string) => {
  return ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
}

export const runCode = async (code: ts.TranspileOutput) => {
  return (await eval(code.outputText)) as Promise<string>
}

export async function callClaude(prompt: string, apiKey: string) {
  const anthropic = new Anthropic({
    apiKey,
  })

  const response = await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 25_000,
    prompt,
  })

  return response.completion
}
