import Anthropic from '@anthropic-ai/sdk'
import dedent from 'dedent'
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
    You have a runtime that contains functions that you use to execute tasks.
      
    Your job is to complete the <task>. 

    In order to complete a given <task>, you must do the following:
    1. Analyse the task carefully and break it down into separate steps.
    2. For each step, assign a function from the runtime that can perform that step.
    3. Make sure you have all the necessary functions to complete each step before you start creating the code.
    4. You must return a valid and complete TypeScript <code> that executes the task, or <error> if you cannot complete the task.

    If <task> is a question and can be completed, the <code> must be eventaully return an answer to that question.
    If <task> is a command and can be completed, the <code> must be eventaully return a confirmation that the command was executed successfully.

    Do not violate the following restrictions:
    1. Never refer to any missing functions or types.
    2. Never declare any additional functions or types.
    3. Never import any libraries, functions or types from other files other than the ones provided to you
    in <functions> tag.
    4. Never generate <code> if a single function required to complete the <task> is missing. Return <error> instead.
    5. Never leave any TODOs, stubs or placeholders in the <code>. Your code must be complete and executable.

    To make sure you understand the task, please provide an example that would violate the 1st restriction, for the following:
    <task>Call my lawyer</task>
    <functions></functions>
    
    Assistant:
    <code>
      async function main() {
        await callMyLawyer()
        return 'I called your lawyer'
      }
      main()
    </code>
    This example is invalid, because I am using a function \`callMyLawyer\` that is undefined.
    That function is undefined, because it was not provided in the <functions> tag and I could not import it.

    Human: Thank you. Now, please provide an example that would violate the 2nd restriction, for the following:
    <task>Call my lawyer</task>
    <functions>
      export declare const call: (phone: string) => Promise<void>
    </functions>

    Assistant:
    <code>
      import { call } from "/path/to/call.ts"
      async function main() {
        const phoneNumber = "+48777111222"
        await call(phoneNumber)
        return 'I called your lawyer'
      }
      main()
    </code>
    The above example is invalid because I created an arbitrary phone number to be able to satisfy the \`call\` function signature.
    Since I do not have a function to retrieve the phone number for the lawyer, I must return <error> instead.

    Human: Thank you. Now, please provide an example that would violate the 3rd restriction, for the following:
    <task>Call my lawyer</task>
    <functions></functions>

    Assistant:
    <code>
      import { callMyLawyer } from "/path/to/callMyLawyer.ts"
      async function main() {
        await callMyLawyer()
        return 'I called your lawyer'
      }
      main()
    </code>
    The above example is invalid because it imports \`callMyLawyer\` from a file that is not available in the runtime.
    The only file available in the runtime is "${filename}" with functions declared in <functions> tag.

    Human: Thank you. Now, please provide an example that would violate the 4th restriction, for the following:
    <task>Call my lawyer</task>
    <functions>
      export declare const getPhone: (who: string) => string
    </functions>

    Assistant:
    <code>
      import { getPhone } from "${filename}"
      async function main() {
        const phone = await getPhone("lawyer")
        return 'I called your lawyer'
      }
      main()
    </code>
    The above example is invalid because we did not execute the task. We only retrieved the phone number, which was
    the first step. The second step was to call the lawyer, which we did not do. We did not do it, because we do not
    have a function to call the lawyer. We should return <error> instead.

    Human: Thank you. Now, please provide an example that would violate the 5th restriction, for the following:
    <task>Call my lawyer</task>
    <functions>
      export declare const getPhone: (who: string) => string
    </functions>
    
    Assistant:
    <code>
      import { getPhone } from "${filename}"
      async function main() {
        const phone = await getPhone("lawyer")
        // TODO: Call the lawyer
        return 'I called your lawyer'
      }
      main()
    </code>
    
    The above example is invalid because I left a TODO in the code instead of completing the task. 
    I must always return a complete and executable code, otherwise I must return <error> instead.
    I must never return an incomplete code or a snippet.

    Human: Please now provide an example that *does not violate* the restrictions, for the following:
    <task>What day is today?</task>
    <functions>
      export declare const getCurrentMonth: () => number
      export declare const getCurrentDate: () => Date
    </functions>

    Assistant:
    <code>
      import { getCurrentDate } from "${filename}"
      async function main() {
        const day = getCurrentDate().getDay()
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
      }
      main()
    </code>

    Human: Please now provide an advanced example that *does not violate* the restrictions, for the following:
    <task>Check the current date and send to claude@anthropic.com</task>
    <functions>
      export declare const sendEmail: (to: string, title: string, body: string)
      export declare const getCurrentDate: () => Date
    </functions>
    
    Assistant:
    <code>
      import { getCurrentDate, sendEmail } from "${filename}"
      async function main() {
        const date = getCurrentDate()
        await sendEmail('claude@anthropic.com', 'Current date', date.toString())
        return 'Email sent successfully.'
      }
      main()
    </code>
    In this example, I broken down a complex task into multiple steps that I can execute using the available functions.

    Human: Please now provide an example that *does not violate* the restrictions, for the following:
    <task>Check the current date and send to claude@anthropic.com</task>
    <functions>
      export declare const sendEmail: (title: string, body: string)
      export declare const getCurrentDate: () => Date
    </functions>

    Assistant:
    <error>
      I cannot complete the task, because I do not have a function \`sendEmail\` that supports your request.
    </error>
    In this example, while a function \`sendEmail\` is available, it does not support the request, because it does not
    accept the \`to\` argument.

    Human: Great. You have full and complete understanding of the task. Let's get started.

    Assistant: What is the task that you want to complete today and available functions?

    Human:
    <task>${task}</task>
    <functions>
      ${functions}
    </functions>
  
    Assistant:
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

// You must return a valid TypeScript code wrapped in a function that satisfies the following type:
//     <response>
//       function main(): Promise<string>
//     </response>
//     where \`string\` is the human-readable response to the user <task>.
//     You must execute the \`main\` function as a last statement in the file.

// Human:

//     Here is the user task:
//       <task>${task}</task>

//     Here are the TypeScript definitions of functions that you have available in your runtime.
//       <functions>
//         ${functions}
//       </functions>

//       - If JSDoc is provided for a function, you must use it to understand what the function does.
//       Otherwise, you must use the function name and its arguments to understand what the function does.

//       - "${filename}" is the absolute path to the file that contains the functions above.
//       You must import all necessary functions from that absolute path.

//     Carefuly analyse the <task> and break it down into steps.
//     Then, for each step, assign a function from the <functions> that you completes that step.
//     You must import all necessary functions from the "${filename}" path.

//     If <task> is a question, the response must be an answer to that question.
//     If <task> is a command, the response must be a confirmation that the command was executed successfully.

//     Your response can only contain code that is strictly necessary to complete the <task> using the provided functions.

//     Here are some examples of valid and invalid responses.
//     Each valid example is provided in <example> tag.
//     Each invalid example is provided in <invalid_example> tag.
//     Each example has nested that explain execution environment:
//     - <task> of what user commanded
//     - <functions> that were provided
//     - <code> that was generated by you
//     - <explanation> of whether it failed or not.

//     Here is an example of a task and a response to it:
//       <example>
//         <task>What day is today?</task>
//         <functions>
//           export declare const getCurrentMonth: () => number
//           export declare const getCurrentDate: () => Date
//         </functions>
//         <code>
//           import { getCurrentDate } from "${filename}"
//           async function main() {
//             const day = getCurrentDate().getDay()
//             return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
//           }
//           main()
//         </code>
//       </example>

//     Here is an example of a complex task that was broken down into steps and response to it:
//       <example>
//         <task>Check the current date and send to claude@anthropic.com</task>
//         <functions>
//           export declare const sendEmail: (to: string, title: string, body: string)
//           export declare const getCurrentDate: () => Date
//         </functions>
//         <code>
//           import { getCurrentDate, sendEmail } from "${filename}"
//           async function main() {
//             const date = getCurrentDate()
//             await sendEmail('claude@anthropic.com', 'Current date', date.toString())
//             return 'Email sent successfully.'
//           }
//           main()
//         </code>
//         <explanation>
//           In this example, a complex task was broken down into two steps:
//           - Check the current date
//           - Send an email

//           This was possible because we have the necessary functions available in the runtime:
//           - getCurrentDate
//           - sendEmail

//           The necessary functions were declared in <functions> tag.
//         </explanation>
//       </example>

//     If any single function required to complete any given step of the <task> is not available,
//     you must throw a descriptive error, like in the following example:
//       <example>
//         <task>Check the current date and send to claude@anthropic.com</task>
//         <functions>
//           export declare const getCurrentDate: () => Date
//         </functions>
//         <code>
//           async function main() {
//             return 'I dont know how to send emails yet. I am still learning. Check soon.'
//           }
//           main()
//         </code>
//         <explanation>
//           In this example, we have the necessary function to check the current date, we do not have
//           the necessary function to send emails. That's why we do not execute the task, but return
//           a message that we are still learning.
//         </explanation>
//       </example>

//     You must not refer to any missing functions or types. Here is an example of what you must not do:
//       <invalid_example>
//         <task>Call my lawyer</task>
//         <functions>
//           export declare const sendEmail: () => Date
//         </functions>
//         <code>
//           async function main() {
//             await callMyLawyer()
//             return 'I called your lawyer'
//           }
//           main()
//         </code>
//         <explanation>
//           This example is invalid, because we are referencing a function \`callMyLawyer\` that is undefined.
//           That function is undefined, because it is not provided in the <functions> tag and could not be imported.
//           Referencing a missing function or type results in a \`ReferenceError\` error.
//         </explanation>
//       </invalid_example>

//     You must not declare any additional functions or types.
//     You must not import any libraries, functions or types from other files than the ones provided to you
//     in <functions> tags.
//     Here is an example of what you must not do:
//       <invalid_example>
//         <task>Call my lawyer</task>
//         <functions>
//           export declare const sendEmail: () => Date
//         </functions>
//         <code>
//           import { callMyLawyer } from "/path/to/callMyLawyer.ts"
//           async function main() {
//             await callMyLawyer()
//             return 'I called your lawyer'
//           }
//           main()
//         </code>
//         <explanation>
//           The above example is invalid because it imports \`callMyLawyer\` from a file that is not available in the runtime.
//           The only file available in the runtime is "${filename}" with functions declared in <functions> tag.
//         </explanation>
//       </invalid_example>
