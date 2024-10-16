import { useEffect, useMemo, useState } from 'react'
import LuckyWheel from './LuckyWheel'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IConfig, IFormData } from './type'

interface ISetUpFromProps {
  onContinue: (data: IFormData) => void
}

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

          <LuckyWheel {...data} />
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

const SetUpForm = (props: ISetUpFromProps) => {
  const [csvUrl, setCsvUrl] = useState('')
  const [config, setConfig] = useState<IConfig>({
    special: 1,
    first: 1,
    second: 1,
    third: 1,
    four: 5
  })

  const total = useMemo(
    () =>
      Object.values(config).reduce((preValue, value) => preValue + value, 0),
    [JSON.stringify(config)]
  )

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
    <div className='h-full w-full flex items-center justify-center text-white'>
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

        <div className='grid grid-cols-2 gap-4'>
          <label className='input input-bordered flex items-center px-2 col-span-2'>
            <p className='flex-shrink-0'>Số giải đặc biệt</p>
            <input
              type='number'
              className='text-center w-full'
              placeholder='Số lượng'
              onChange={(e) => {
                setConfig({
                  ...config,
                  special: Number(e.target.value)
                })
              }}
              value={config.special}
            />
          </label>
          <label className='input input-bordered flex items-center px-2'>
            <p className='flex-shrink-0'>Số giải nhất</p>
            <input
              type='number'
              className='text-center w-full'
              placeholder='Số lượng'
              onChange={(e) => {
                setConfig({
                  ...config,
                  first: Number(e.target.value)
                })
              }}
              value={config.first}
            />
          </label>
          <label className='input input-bordered flex items-center px-2'>
            <p className='flex-shrink-0'>Số giải nhì</p>
            <input
              type='number'
              className='text-center w-full'
              placeholder='Số lượng'
              onChange={(e) => {
                setConfig({
                  ...config,
                  second: Number(e.target.value)
                })
              }}
              value={config.second}
            />
          </label>
          <label className='input input-bordered flex items-center px-2'>
            <p className='flex-shrink-0'>Số giải ba</p>
            <input
              type='number'
              className='text-center w-full'
              placeholder='Số lượng'
              onChange={(e) => {
                setConfig({
                  ...config,
                  third: Number(e.target.value)
                })
              }}
              value={config.third}
            />
          </label>
          <label className='input input-bordered flex items-center px-2'>
            <p className='flex-shrink-0'>Số giải khuyến khích</p>
            <input
              type='number'
              className='text-center w-full'
              placeholder='Số lượng'
              onChange={(e) => {
                setConfig({
                  ...config,
                  four: Number(e.target.value)
                })
              }}
              value={config.four}
            />
          </label>
        </div>
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
                total,
                config
              })
            }
          }}
        >
          Tiếp tục
        </button>
        <p className='text-sm'>Số lượng giải: {total}</p>
        {wheelItems?.length ? (
          <p className='text-sm'>Số người tham gia: {wheelItems.length}</p>
        ) : null}
      </form>
    </div>
  )
}

export default Home
