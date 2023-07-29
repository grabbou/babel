import { grpc as GRPCWeb } from '@improbable-eng/grpc-web'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'

import * as Generation from './generation/generation_pb'
import { GenerationServiceClient } from './generation/generation_pb_service'
import { buildGenerationRequest, executeGenerationRequest } from './helpers'

// This is a NodeJS-specific requirement - browsers implementations should omit this line.
GRPCWeb.setDefaultTransport(NodeHttpTransport())

// Create a generation client to use with all future requests
const client = new GenerationServiceClient('https://grpc.stability.ai', {})

export async function executeGenerationRequestHelper(prompt: string) {
  // Authenticate using your API key, don't commit your key to a public repository!
  const metadata = new GRPCWeb.Metadata()
  metadata.set('Authorization', 'Bearer ' + process.env.STABILITY_API_KEY)
  console.log('metadata is...' + metadata.get('Authorization'))

  const request = buildGenerationRequest('stable-diffusion-xl-1024-v0-9', {
    type: 'text-to-image',
    prompts: [
      {
        text: prompt,
      },
    ],
    width: 1024,
    height: 1024,
    samples: 1,
    cfgScale: 8,
    steps: 30,
    seed: 992446758,
    sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
  })

  const res = await executeGenerationRequest(client, request, metadata)
  return res
}
