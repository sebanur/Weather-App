const API_KEY = "8f84d51bcab1852dcade6d30d1e57566"
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


export const getWeatherByCoord = async (lat, long, units= "metric") => {
    
    const url = `${BASE_URL}?lat=${lat}&lon=${long}&units=${units}&appid=${API_KEY}&lang=tr`

    const req = await fetch(url)
    const data = await req.json()

    console.log(data)
    return data
}


export const getFlagUrl = (countryCode) => `https://flagcdn.com/108x81/${countryCode.toLowerCase()}.png`


export const getWeatherData = async (city, units="metric")=>{
    const url = `${BASE_URL}?q=${city}&units=${units}&appid=${API_KEY}&lang=tr`

    const req = await fetch(url)

    const data = await req.json()

    return data
}