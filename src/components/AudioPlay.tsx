import React, { useEffect, useRef, useState } from 'react'

const AudioPlay = () => {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // Start playing the audio when the component mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.2
    }
    play()
    return () => {
      // Pause audio when component unmounts
      pause()
    }
  }, [])

  const play = () => {
    audioRef.current?.play()
    setPaused(false)
  }

  const pause = () => {
    audioRef.current?.pause()
    setPaused(true)
  }

  return (
    <div className='absolute bottom-6 left-6'>
      <audio ref={audioRef} loop>
        <source src='/nhac-xo-so.mp3' type='audio/mp3' />
      </audio>
      <button onClick={() => (paused ? play() : pause())}>
        <img
          src={paused ? '/images/no-sound.png' : '/images/sound.png'}
          width={40}
          height={40}
        />
      </button>
    </div>
  )
}

export default AudioPlay
