// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCurrentLocation = async (location: string) => {
  // TODO detect location automatically
  return {
    lat: 37.773972,
    long: -122.431297,
  }
}

export const getTemperature = async (lat: number, long: number) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OPEN_WEATHER_API_KEY}`
  )
  const data = await res.json()
  if (!data?.current?.temp) {
    throw new Error('Could not get temperature. Please try again.')
  }
  return Number(data.current.temp)
}
