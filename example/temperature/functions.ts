type Location = {
  lat: number
  lng: number
}

export const getCurrentLocation = (): Location => {
  return {
    lat: 37.773972,
    lng: -122.431297,
  }
}

export enum Unit {
  Celsius = 'metric',
  Fahrenheit = 'imperial',
}

export const getTemperature = async (location: Location, unit: Unit = Unit.Fahrenheit) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lng}&units=${unit}&appid=${process.env.OPEN_WEATHER_API_KEY}`
  )
  const data = await res.json()
  if (!data?.current?.temp) {
    throw new Error('Could not get temperature. Please try again.')
  }
  return Number(data.current.temp)
}
