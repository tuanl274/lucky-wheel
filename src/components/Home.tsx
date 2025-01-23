import { useEffect, useMemo, useState } from 'react'
import LuckyWheel from './LuckyWheel'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IConfigLevel, IFormData } from './type'
import AudioPlay from './AudioPlay'
import Reset from './Reset'

interface ISetUpFromProps {
  onContinue: (data: IFormData) => void
}

const capitalizeFirstLetter = (str: string) => {
  return str
    .split(' ') // Split the string by spaces into words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter, lowercase the rest
    })
    .join(' ') // Join the words back together
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
          <h1 className='text-8xl mb-20 text-white'>Vòng quay may mắn</h1>

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
      <AudioPlay />
      {/* {data ? null : (
        <div className='absolute bottom-4 right-4 text-sm text-white'>
          Quyên ăn chặn tiền công của dev
        </div>
      )} */}
      <Reset />
    </div>
  )
}

const SetUpForm = (props: ISetUpFromProps) => {
  const [csvUrl, setCsvUrl] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [config, setConfig] = useState<IConfigLevel>({
    special: 1,
    first: 1,
    second: 1,
    third: 1,
    four: 5,
    normal: 0
  })

  const [normalWheel, setNormalWheel] = useState(false)
  const [price, setPrice] = useState(0)

  const total = useMemo(
    () =>
      normalWheel
        ? config.normal
        : Object.values(config).reduce(
            (preValue, value) => preValue + value,
            0
          ),
    [JSON.stringify(config), normalWheel]
  )

  const [wheelItems, setWheelItems] = useState<{ option: string }[]>([])

  const fetchGoogleSheetCSV = async () => {
    try {
      const response = await axios.get(csvUrl)
      const data = response.data

      // Split CSV thành mảng các hàng
      const rows = data.split('\n').map((row: string) => row.split(',')) || []

      // console.log('rows.......', rows)

      // Map dữ liệu CSV thành các mục cần thiết
      const wheelItems = rows.slice(1).map((row: string[]) => ({
        option: capitalizeFirstLetter(row[1] || ''),
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
    // Set a timer to update debouncedValue after a delay
    const handler = setTimeout(() => {
      setDebouncedValue(csvUrl)
    }, 500) // 500ms debounce delay

    // Clean up the timeout if the user types within the delay time
    return () => {
      clearTimeout(handler)
    }
  }, [csvUrl])

  useEffect(() => {
    const fetchData = async () => {
      const items = await fetchGoogleSheetCSV()
      setWheelItems(items)
    }

    if (debouncedValue) {
      fetchData()
    }
  }, [debouncedValue])

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
        <p className='text-sm text-gray-400 break-all'>
          <span className='text-primary'>Excel: </span>
          https://docs.google.com/spreadsheets/d/1Y2PKMDp6tBs8QbsH7V8hmWdMA8KvfYnxC4C37wP4XNI
        </p>
        <p className='text-sm text-gray-400 break-all'>
          <span className='text-primary'>CSV Sharing: </span>
          https://docs.google.com/spreadsheets/d/e/2PACX-1vS3dIbzkQ2mA6ewQlUimcQlSeuy0ycVS9uR9lFChQ_S87AIhl9_E2MJi_u3ow8vEeSfByqIFhuuFxW9/pub?output=csv
        </p>

        <div className='flex items-center justify-between'>
          <label className='label cursor-pointer justify-start space-x-4 flex-1'>
            <input
              type='radio'
              name='radio-1'
              className='radio'
              checked={!normalWheel}
              onChange={() => setNormalWheel(false)}
            />
            <span className='label-text'>Sắp xếp</span>
          </label>

          <label className='label cursor-pointer justify-start space-x-4 flex-1'>
            <input
              type='radio'
              name='radio-2'
              className='radio'
              checked={normalWheel}
              onChange={() => setNormalWheel(true)}
            />
            <span className='label-text'>Đồng giá</span>
          </label>
        </div>

        {normalWheel ? (
          <div className='grid grid-cols-1 gap-4'>
            <label className='input input-bordered flex items-center px-2'>
              <p className='flex-shrink-0'>Số lượng</p>
              <input
                type='number'
                className='text-center w-full'
                placeholder='Số lượng'
                onChange={(e) => {
                  setConfig({
                    ...config,
                    normal: Number(e.target.value)
                  })
                }}
                value={config.normal}
              />
            </label>

            <label className='input input-bordered flex items-center px-2'>
              <p className='flex-shrink-0'>Giá trị ($$$)</p>
              <input
                type='number'
                className='text-center w-full'
                placeholder='Số lượng'
                onChange={(e) => {
                  setPrice(Number(e.target.value))
                }}
                value={price}
              />
            </label>
          </div>
        ) : (
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
        )}

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
                config,
                normalWheel: normalWheel,
                price
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
