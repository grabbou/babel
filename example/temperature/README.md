# Basic agent example

## Preview

Here is a snapshot of a terminal session, where you can see the agent in action. For the purpose of the example, the entry point was designed as a chat-like interface rather than a single endpoint.

<img src="./terminal.png"  />

## Prompt

```
What is the temperature in San Francisco now?
```

## Available functions

```ts
type Location = {
  lat: number;
  lng: number;
};
export declare const getLocationForCityName: (city: string) => Location;
export declare const getTemperature: (location: Location) => Promise<number>;
export declare const sendEmail: (email: string, subject: string, body: string) => Promise<boolean>;
export {};
```

## Generated agent runtime

```ts
import { getLocationForCityName, getTemperature } from "/Users/themike/Repositories/babel/example/temperature/functions";

async function main(): Promise<string> {
  const location = getLocationForCityName("San Francisco");
  
  const temperature = await getTemperature(location);
  
  return `The temperature in San Francisco is ${temperature} degrees.`; 
}

main();
```

## Output

> The temperature in San Francisco is 66.36 degrees.
