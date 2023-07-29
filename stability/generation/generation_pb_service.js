// package: gooseai
// file: generation.proto

var generation_pb = require('./generation_pb')
var grpc = require('@improbable-eng/grpc-web').grpc

var GenerationService = (function () {
  function GenerationService() {}
  GenerationService.serviceName = 'gooseai.GenerationService'
  return GenerationService
})()

GenerationService.Generate = {
  methodName: 'Generate',
  service: GenerationService,
  requestStream: false,
  responseStream: true,
  requestType: generation_pb.Request,
  responseType: generation_pb.Answer,
}

GenerationService.ChainGenerate = {
  methodName: 'ChainGenerate',
  service: GenerationService,
  requestStream: false,
  responseStream: true,
  requestType: generation_pb.ChainRequest,
  responseType: generation_pb.Answer,
}

exports.GenerationService = GenerationService

function GenerationServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost
  this.options = options || {}
}

GenerationServiceClient.prototype.generate = function generate(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: [],
  }
  var client = grpc.invoke(GenerationService.Generate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage(responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage)
      })
    },
    onEnd(status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers })
      })
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers })
      })
      listeners = null
    },
  })
  return {
    on(type, handler) {
      listeners[type].push(handler)
      return this
    },
    cancel() {
      listeners = null
      client.close()
    },
  }
}

GenerationServiceClient.prototype.chainGenerate = function chainGenerate(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: [],
  }
  var client = grpc.invoke(GenerationService.ChainGenerate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage(responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage)
      })
    },
    onEnd(status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers })
      })
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers })
      })
      listeners = null
    },
  })
  return {
    on(type, handler) {
      listeners[type].push(handler)
      return this
    },
    cancel() {
      listeners = null
      client.close()
    },
  }
}

exports.GenerationServiceClient = GenerationServiceClient
