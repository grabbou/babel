import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

dotenv.config()

const source = readFileSync(path.join(__dirname, './prompt.txt'), 'utf-8')

const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })

eval(code.outputText)
