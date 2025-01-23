import React from 'react'

const Reset = () => {
  return (
    <div className='absolute bottom-6 right-6'>
      <button onClick={() => window?.location?.reload()}>Reset</button>
    </div>
  )
}

export default Reset
