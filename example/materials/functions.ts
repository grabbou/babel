import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

import { GenerationResponse } from '@/stability/helpers'
import { executeGenerationRequestHelper } from '@/stability/invoke'

type generateImageProps = {
  prompt: string
  negativePrompt: string
  story: string
}
export async function generateIllustration(props: generateImageProps) {
  const { prompt, negativePrompt, story } = props

  // generate a uuid for the request
  const uuid = uuidv4()
  const name = `${uuid}.png`

  console.log('prompt: ' + prompt)
  console.log('negativePrompt: ' + negativePrompt)
  let buffer: Buffer
  try {
    const res = await executeGenerationRequestHelper(prompt)
    buffer = onGenComplete(res, name)

    // save buffer to disk
    fs.writeFileSync(name, buffer)
  } catch (e) {
    console.log(e)
    throw e
  }
}

function onGenComplete(response: GenerationResponse, name: string) {
  if (response instanceof Error) {
    console.error('Generation failed', response)
    throw response
  }

  console.log(
    `${response.imageArtifacts.length} image${
      response.imageArtifacts.length > 1 ? 's' : ''
    } were successfully generated.`
  )

  // Do something with NSFW filtered artifacts
  if (response.filteredArtifacts.length > 0) {
    console.log(
      `${response.filteredArtifacts.length} artifact` +
        `${response.filteredArtifacts.length > 1 ? 's' : ''}` +
        ` were filtered by the NSFW classifier and need to be retried.`
    )
  }

  return Buffer.from(response.imageArtifacts[0].getBinary_asU8())
}
