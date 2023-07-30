import Anthropic from '@anthropic-ai/sdk'
import dedent from 'dedent'
import { XMLParser } from 'fast-xml-parser'
import { Project } from 'ts-morph'
import ts from 'typescript'

type FileDef = [string, string]

export const getFileTypeDeclaration = (filePath: string): FileDef => {
  const project = new Project({ compilerOptions: { declaration: true } })
  project.addSourceFileAtPath(filePath)

  const result = project.emitToMemory({ emitOnlyDtsFiles: true })

  const file = result.getFiles()[0]

  // We're generating typedefs side by side, so we can safely replace the extension
  const filename = file.filePath.replace('.d.ts', '.ts')

  return [filename, file.text]
}

export const buildPrompt = (file: FileDef, task: string) => {
  const [filename, functions] = file

  return dedent`
    Human:
    You are a service that provides answers to user questions. You have a set of functions that you can call in order to answer user questions.

    Here is the user task:
    <task>${task}</task>

    Here are TypeScript function definitions of functions you can import from "${filename}":
    <functions>${functions}</functions>
    
    If JSDoc is provided for a function, you must use it to understand what the function does.
    Otherwise, you must use the function type signature (including name and its arguments) to understand what it does.

    If function has multiple choices and user did not specify which one to use, you must use the first one.
    
    In order to complete a given task, you must do the following:
    1. Analyse the task carefully and break it down into separate steps.
    2. For each step, import a function from the "${filename}" that can fully satisfy that step.
    3. Generate a valid TypeScript code that completes the entire task using functions provided.
    
    Never import any libraries, functions or types from other files other than the ones provided to you in <functions> tag.
    
    If any functions are missing or available functions do not fully satisfy a given step, you must mark that step as a TODO.
    If there are any TODOs in the code, you must include a detailed <error> tag that explains what functionalities are missing.

    Your response must look as follows:
    <response>
      <code><![CDATA[
        async function main(): Promise<string> {
          // code
        }
        main()
      ]]></code>
      <error></error>
    </response>
    
    Do not include anything before or after the <response />.

    Assistant:
    <response>
  `
}

export const parseCode = (code: string) => {
  return ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
}

export const runCode = async (code: ts.TranspileOutput) => {
  return (await eval(code.outputText)) as Promise<string>
}

type ClaudeResponse = {
  code: string
  error?: string
}

export async function callClaude(prompt: string, apiKey: string): Promise<ClaudeResponse> {
  const parser = new XMLParser()

  const anthropic = new Anthropic({
    apiKey,
  })

  const response = await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 25_000,
    prompt,
  })

  const xml = `<response>${response.completion}`

  const data = parser.parse(xml)

  return {
    code: data.response.code,
    error: data.response.error?.length > 0 ? data.response.error : undefined,
  }
}
