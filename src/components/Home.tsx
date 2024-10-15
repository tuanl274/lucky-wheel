import { useEffect, useState } from 'react'
import LuckyWheel from './LuckyWheel'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home = () => {
  const [data, setData] = useState<any>(null)

  return (
    <div
      className='h-screen w-screen bg-slate-950 p-8'
      style={{
        backgroundImage: `url("/images/wheel_bg.png")`
      }}
    >
      {data ? (
        <div className='text-center'>
          <h1 className='text-8xl mb-20'>Vòng quay may mắn</h1>

          <LuckyWheel wheelItems={data.wheelItems} total={data.total} />
        </div>
      ) : (
        <SetUpForm
          onContinue={(value: any) => {
            setData(value)
          }}
        />
      )}
      <ToastContainer />
    </div>
  )
}

const SetUpForm = (props: any) => {
  const [csvUrl, setCsvUrl] = useState('')
  const [total, setTotal] = useState(10)
  const [wheelItems, setWheelItems] = useState<{ option: string }[]>([])

  const fetchGoogleSheetCSV = async () => {
    try {
      const response = await axios.get(csvUrl)
      const data = response.data

      // Split CSV thành mảng các hàng
      const rows = data.split('\n').map((row: string) => row.split(',')) || []

      // Map dữ liệu CSV thành các mục cần thiết
      const wheelItems = rows.slice(1).map((row: string[]) => ({
        option: row[1],
        value: row[0],
        data: row.join('_')
      }))

      return wheelItems
    } catch (error) {
      toast('Error fetching CSV data:')
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const items = await fetchGoogleSheetCSV()
      setWheelItems(items)
    }

    if (csvUrl) {
      fetchData()
    }
  }, [csvUrl])

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <form className='w-[540px] flex flex-col space-y-4'>
        <label className='input input-bordered flex items-center gap-2'>
          Excel:
          <input
            type='text'
            className='grow'
            placeholder='Paste link csv here'
            onChange={(e) => setCsvUrl(e.target.value)}
          />
        </label>

        <label className='input input-bordered flex items-center gap-2'>
          Số lượng giải
          <input
            type='number'
            className='grow'
            placeholder='10'
            onChange={(e) => {
              setTotal(Number(e.target.value))
            }}
            value={total}
          />
        </label>
        <button
          type='button'
          className='btn'
          onClick={() => {
            if (!wheelItems?.length) {
              toast('Chưa có người tham gia')
            } else if (wheelItems?.length < total) {
              toast('Số lượng người tham gia nhỏ hơn tổng giải thưởng')
            } else {
              props.onContinue({
                wheelItems,
                total
              })
            }
          }}
        >
          Go
        </button>
        {wheelItems?.length ? (
          <p className='text-sm'>Số người tham gia: {wheelItems.length}</p>
        ) : null}
      </form>
    </div>
  )
}

export default Home
