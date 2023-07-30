// eslint-disable-next-line @typescript-eslint/no-unused-vars
const request = async (url: string) => {
  return await (await fetch(url)).json()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBatteryEfficiencyScore(imei: string): Promise<number> {
  return Promise.resolve(Math.random() * 100)
  // return request(`https://localhost:1324/factory-c/battery-checks/${imei}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getQualityScore(imei: string): Promise<number> {
  return Promise.resolve(Math.random() * 100)
  // return request(`https://localhost:5731/factory-a/quality-checks/${imei}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getLiabilityScore(imei: string): Promise<number> {
  return Promise.resolve(Math.random() * 100)
  // return request(`https://localhost:1235/factory-b/total-cost/${imei}`)
}
