# Babel 🗼

Babel is an innovative framework designed for constructing autonomous agent-driven applications leveraging TypeScript. It establishes itself as a modern counterpart to OpenAI functions, providing an LLM-agnostic solution compatible with any available model.

Built upon the latest research insights from Microsoft, Babel employs TypeScript type definitions to guide the LLM output. This framework allows developers to define functions (and in the future, serverless lambda functions and other endpoints) as available procedures and then harnesses the power of Claude 2 to generate a runtime that functions as an autonomous agent.

For its initial iteration, Babel has utilized Claude 2 as a reference implementation, integrating its precision, steerability, and coding capabilities to produce a straightforward, agentic runtime for your functions.

> Note: Babel is not ready for production yet and is intended for research purposes at this stage. We are working on the prerelease and should be out there in the nearest future. If you wish to participate in the development, please open up an issue or contact me via my email [Mike]

## 🚀 Getting Started

1. Create .env file and set CLAUDE_KEY as an environment variable.
2. Install all necessary dependencies by running the command:
```bash
$ yarn
``````
3. Execute the following command:
```bash
$ yarn tsx example/temperature/index.ts
```
4. Ask it a question! 

> Note: Our default example is best at giving you weather update and sending it over an email (if you want to!)

## 🧩 Implementation

### 1. Define Your Runtime
Babel requires a TypeScript file with the functions that are available in your environment. To make a function accessible, you must export it.

```ts
export const getCurrentLocation = (): Location => {
  return {
    lat: 37.773972,
    lng: -122.431297,
  }
}
```

### 2. Generate Types for Your Runtime
Babel leverages the TypeScript compiler to transform your file into TypeScript type definitions (.d.ts).

```ts
type Location = {
  lat: number;
  lng: number;
};
export declare const getCurrentLocation: () => Location;
```

### 3. Prompt Claude 2 to Create the Agent
Babel produces a prompt, instructing Claude 2 to create a runtime TypeScript file. Given the available functions, this file will attempt to solve the task at hand.

The response is an XML object adhering to the following high-level format:

```xml
<response>
  <code><![CDATA[
    async function main(): Promise<string> {
      // code
    }
    main()
  ]]></code>
  <error></error>
</response>
```
If <error></error> is present, it indicates a problem with generating runtime code, signifying that it cannot be safely executed.

> We have noticed that allowing Claude 2 to produce potentially invalid code and return an error message often proves more predictable than requiring it to return either code or a message. This approach is a fundamental aspect of our underlying implementation, though it's subject to further research.

## 👥 Team

This project was initiated at the Anthropic hackathon in San Francisco by our dedicated team:

[Mike Grabowski](https://github.com/grabbou)
[Shalini Ananda](https://github.com/ShaliniAnandaPhD)

We appreciate your interest in Babel and welcome your feedback, contributions, and questions. Let's create a better future with AI together! 🎉
