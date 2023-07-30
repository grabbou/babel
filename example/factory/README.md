# Factory

Babel brings the promise of autonomous AI-driven applications to life with practical real-world applications. One such implementation is the "Factory" example which integrates Babel in an industrial setting. Here, Babel is tasked with automating the quality assurance check for an iPhone, specifically evaluating if it passes the overall quality criteria set by the manufacturer.

The provided code exhibits how Babel seamlessly interacts with pre-existing functions in your environment to perform complex tasks. In this scenario, it utilizes available procedures to fetch the iPhone's battery efficiency, overall quality, and liability scores. Babel prompts Claude 2 to generate an agent runtime that averages these scores and determines whether the product meets the quality threshold.

> In our example, to better simulate the factory real-life environment, we are using pre-trained models (see `factory/ai`) for details.

## Prompt

```
For the iPhone of IMEI 123456789, check whether it passes the overall quality assurance.
To pass, it has to score over 0.5 on average in the battery, defects and liability scores.
```

## Available functions

```ts
export declare function getBatteryEfficiencyScore(imei: string): Promise<number>;
export declare function getQualityScore(imei: string): Promise<number>;
export declare function getLiabilityScore(imei: string): Promise<number>;
```

## Generated agent runtime

```ts
import { getBatteryEfficiencyScore, getQualityScore, getLiabilityScore } from "/babel/example/factory/functions.ts";
async function main(): Promise<string> {
  const imei = "123456789";
  
  const batteryScore = await getBatteryEfficiencyScore(imei);
  const defectsScore = await getQualityScore(imei);
  const liabilityScore = await getLiabilityScore(imei);

  const avgScore = (batteryScore + defectsScore + liabilityScore) / 3;

  if (avgScore > 0.5) {
    return "Passed"; 
  } else {
    return "Failed";
  }
}
```

## Output

> Passed
