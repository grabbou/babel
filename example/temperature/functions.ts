type Location = {
  lat: number
  lng: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getLocationForCityName = (city: string): Location => {
  return {
    lat: 37.773972,
    lng: -122.431297,
  }
}

/** Returns temperature in Farenheit */
export const getTemperature = async (location: Location) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`
  )
  const data = await res.json()
  if (!data?.current?.temp) {
    throw new Error('Could not get temperature. Please try again.')
  }
  return Number(data.current.temp)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendEmail = async (email: string, subject: string, body: string) => {
  // TODO: make it actually send an email
  return true
}
