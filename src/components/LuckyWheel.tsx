import React, { useRef, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

interface WheelItem {
  option: string
  style?: {
    backgroundColor?: string
    textColor?: string
  }
  value?: any
  data?: any
}

interface LuckyWheelProps {
  wheelItems: WheelItem[]
  total: number
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ wheelItems, total }) => {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const modalRef = useRef(null)

  const items = wheelItems
    // .concat(...wheelItems)
    .filter((value) => !results.some((rs) => rs.value == value.value))

  console.log('results......', results)

  const handleSpinClick = () => {
    if (items.length > 1 && results.length < total) {
      const newPrizeNumber = Math.floor(Math.random() * items.length)
      setPrizeNumber(newPrizeNumber)
      setMustSpin(true)
    } else {
      toast('DONE')
    }
  }

  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-8 gap-12'>
        <div className='flex items-center flex-col justify-between'>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={items}
            backgroundColors={['#87A9DF', '#B4C7F1']}
            textColors={['#000']}
            onStopSpinning={() => {
              setMustSpin(false)
              const luckyMan = items[prizeNumber]
              console.log(luckyMan)
              setResults([...results, luckyMan])
              setTimeout(() => {
                // @ts-ignore
                modalRef.current?.showModal()
              }, 200)
            }}
            outerBorderColor='#588CF5'
            outerBorderWidth={10}
            radiusLineWidth={0}
          />
          {/* <img src='/images/2024-10-15.jpg' /> */}
          <button
            className='btn btn-primary mt-6 w-24'
            onClick={handleSpinClick}
            disabled={mustSpin}
          >
            Quay
          </button>

          <dialog id='my_modal_1' className='modal' ref={modalRef}>
            <div className='modal-box'>
              <h3 className='font-bold text-lg'>Xin chúc mừng</h3>
              <p className='py-4 text-2xl'>
                Người may mắn là{' '}
                <span className='text-primary'>
                  {results[results.length - 1]?.option}
                </span>
              </p>
              <div className='modal-action'>
                <form method='dialog'>
                  {/* if there is a button in form, it will close the modal */}
                  <button className='btn'>Tiếp tục</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
      <div className='col-span-4'>
        <div className='flex justify-around items-center'>
          <h2>Người may mắn:</h2>
          <button
            type='button'
            className='btn btn-ghost'
            onClick={() =>
              saveExcelFile(
                results.map((value: any) => value.data.split('_')),
                'lucky_wheel'
              )
            }
          >
            Save Excel
          </button>
        </div>
        <div className='grid grid-cols-12 gap-4 mt-6'>
          {results.map((item: any) => {
            return <div className='col-span-6 text-center'>{item.option}</div>
          })}
        </div>
      </div>
    </div>
  )
}

const saveExcelFile = (data: any[], fileName: string) => {
  // 1. Chuyển đổi dữ liệu sang worksheet (bảng)
  const worksheet = XLSX.utils.json_to_sheet(data)

  // 2. Tạo một workbook (file Excel)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 3. Xuất file Excel
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

export default LuckyWheel
