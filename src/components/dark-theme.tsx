import React, { FormEvent, useState } from 'react'
import DarkModeIcon from '@mui/icons-material/DarkMode'
const ChangeTheme = () => {
  const [isDark, setIsDark] = useState(false)
  const toggleBackground = () => {
    setIsDark(prev => !prev)
    console.log('Nothing')
  }
  return (
    <div>
      <video
        autoPlay
        loop
        muted
        preload='auto'
        className={isDark ? 'background-video-dark' : 'background-video'}
        key={isDark ? 'dark' : 'light'}
      > 
        <source
          src={isDark ? '/videos/night-clouds.mp4' : '/videos/clouds.mp4'}
          type='video/mp4'
        />
        Ваш браузер не поддерживает видео фон.
      </video>

      <div className='dark-theme'>
        <button className='dark-button' onClick={toggleBackground}>
          <DarkModeIcon />
        </button>
      </div>
    </div>
  )
}
export default ChangeTheme
