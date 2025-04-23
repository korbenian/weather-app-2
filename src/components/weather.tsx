import React, { FormEvent, useState } from 'react'
import { useEffect } from 'react'
import DarkModeIcon from '@mui/icons-material/DarkMode'

import { Interface } from 'readline'

interface WeatherApiResponse {
  location: {
    name: string
    region: string
    country: string
    localtime: string
  }
  current: {
    temp_c: number
    feelslike_c: number
    condition: {
      text: string
      icon: string
    }
    humidity: number
    wind_kph: number
    vis_km: number
  }
  forecast: {
    forecastday: ForecastDay[]
  }
}

interface ForecastDay {
  date: string
  day: {
    maxtemp_c: number
    mintemp_c: number
    avgtemp_c: number
    condition: {
      text: string
      icon: string
    }
  }
}

interface DailyWeather {
  dt: number
  temp: {
    day: number
    min: number
    max: number
  }
  weather: {
    description: string
    icon: string
  }[]
}

interface WeatherData {
  coord: {
    lat: number
    lon: number
  }

  visibility: Number
  name: String
  main: {
    temp: Number
    feels_like: Number
    humidity: Number
  }
  wind: {
    speed: Number
  }
  weather: {
    description: String
    icon: String
  }[]
}

const WeatherSearch: React.FC = () => {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [forecastData, setForecastData] = useState<WeatherApiResponse | null>(
    null
  )
  const API_KEY_7 = '37c34f12900d473eb7251140251304'
  const [forecast, setForecast] = useState<DailyWeather[]>([])
  const API_KEY = 'b219755a66a96264db0a67bb2811c702'

  const getWeatherByLocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером')
      return
    }

    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        try {
          const forecastResponse = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY_7}&q=${lat},${lon}&days=7&lang=ru`
          )
          const forecastJson: WeatherApiResponse = await forecastResponse.json()
          setForecastData(forecastJson)

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
          )
          const data: WeatherData = await response.json()
          setWeather(data)
        } catch (err) {
          setError('Не удалось получить данные по геолокации')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Пользователь запретил доступ к местоположению')
        setLoading(false)
      }
    )
  }

  const getWeekday = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { weekday: 'short' })
  }
  const [isDark, setIsDark] = useState(false)

  const toggleBackground = () => {
    setIsDark(prev => !prev)
  }

  const fetchWeather = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!city.trim()) {
      setError('Введите название города')
      return
    }

    setLoading(true)
    setError('')
    setWeather(null)

    const forecastResponse = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY_7}&q=${city}&days=7&lang=ru`
    )
    const forecastJson: WeatherApiResponse = await forecastResponse.json()
    setForecastData(forecastJson)

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
      )

      const data: WeatherData = await response.json()
      setWeather(data)
      const { lat, lon } = data.coord
    } catch (err) {
      setError('Ошибка не найдена')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='main'>
      {!isDark && (
        <video autoPlay loop muted className='background-video'>
          <source src='/videos/clouds.mp4' type='video/mp4' />
          Ваш браузер не поддерживает видео фон.
        </video>
      )}
      {isDark && (
        <video
          autoPlay
          loop
          preload='auto'
          muted
          className='background-video-dark'
        >
          <source src='/videos/night-clouds.mp4' type='video/mp4' />
          Ваш браузер не поддерживает видео фон.
        </video>
      )}

      <div className='dark-theme'>
        <button className='dark-button' onClick={toggleBackground}>
          <DarkModeIcon />
        </button>
        <button className='button-geolocation' onClick={getWeatherByLocation}>
          📍 Моя погода по геолокации
        </button>
      </div>
      <h1 className='title'>Прогноз погоды</h1>

      <form className='form' onSubmit={fetchWeather}>
        <input
          className='input'
          type='text'
          placeholder='Введите город'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCity(e.target.value)
          }
        ></input>
        <button className='button' type='submit'>
          Узнать погоду
        </button>
      </form>

      {loading && <p>...Загрузка</p>}
      {error && <p>{error}</p>}
      {weather && weather.weather && weather.weather[0] ? (
        <div>
          <h2>{weather.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={String(weather.weather[0].description)}
          />
          <p>{weather.weather[0].description}</p>
          <div className='weather'>
            <div className='discription'>
              <p>Температура: {String(weather.main.temp)}°C</p>
              <p>💧 Влажность: {String(weather.main.humidity)}%</p>
              <p>Скорость ветра:{String(weather.wind.speed)}м/с</p>
            </div>
            <div className='sec-description'>
              <p>Ощущается как: {String(weather.main.feels_like)}</p>
              <p>Дата: {new Date().toLocaleDateString()}</p>
              <p>Видимость: {String(weather.visibility)}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Город не найден</p>
      )}
      {forecastData &&
        forecastData.forecast &&
        forecastData.forecast.forecastday.length > 0 && (
          <div>
            <h3>Прогноз на 7 дней:</h3>
            <div className='forecast-grid'>
              {forecastData.forecast.forecastday.map((day, index) => (
                <button key={index} className='forecast-day'>
                  <p>{getWeekday(day.date)}</p>
                  <p>{day.date}</p>
                  <img
                    className='image'
                    src={day.day.condition.icon} 
                    alt={day.day.condition.text}
                  />

                  <p className='max-temp'>{day.day.maxtemp_c}°C</p>
                  <p className='min-temp'>{day.day.mintemp_c}°C</p>
                  <p className='discription'>{day.day.condition.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
export default WeatherSearch
