type locationProps = {
  location: string
}
export const getCurrentLocation = async (props: locationProps) => {
  // TODO do something with the location
  const res = {
    lat: 37.773972,
    long: -122.431297,
  }
  console.log('response is:' + res)
  return res
}

export const getTemperature = async (lat: number, long: number) => {
  console.log(lat, long)
  const URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OPEN_WEATHER_API_KEY}`
  console.log(URL)
  const res = await fetch(URL)
  const data = await res.json()
  console.log(data)
  return data.current.temp
}
