import React, { useMemo, useRef, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { IConfigLevel, IResult, ResultType, WheelItem } from './type'

interface LuckyWheelProps {
  wheelItems: WheelItem[]
  total: number
  config: IConfigLevel
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({
  wheelItems,
  total,
  config
}) => {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [results, setResults] = useState<IResult[]>([])
  const [hideUsers, setHideUsers] = useState<IResult[]>([])
  const modalRef = useRef(null)

  const items = wheelItems
    // .concat(...wheelItems)
    .filter((value) => !results.some((rs) => rs.value == value.value))
    .filter((value) => !hideUsers.some((u) => u.value == value.value))

  console.log('results......', results)
  console.log('hiden.........', hideUsers)

  const handleSpinClick = () => {
    if (items.length > 1 && results.length < total) {
      const newPrizeNumber = Math.floor(Math.random() * items.length)
      setPrizeNumber(newPrizeNumber)
      setMustSpin(true)
    } else {
      toast('DONE')
    }
  }

  const currentLevel = useMemo(() => {
    const length = results.length

    if (length < config.four) {
      return ResultType.four
    } else if (length < config.four + config.third) {
      return ResultType.third
    } else if (length < config.four + config.third + config.second) {
      return ResultType.second
    } else if (
      length <
      config.four + config.third + config.second + config.first
    ) {
      return ResultType.first
    } else return ResultType.special
  }, [results])

  const getTypeLabel = (type: ResultType) => {
    switch (type) {
      case ResultType.special:
        return 'Giải Đặc Biệt'
      case ResultType.first:
        return 'Giải Nhất'
      case ResultType.second:
        return 'Giải Nhì'
      case ResultType.third:
        return 'Giải Ba'

      default:
        return 'Giải Khuyến Khích'
    }
  }

  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-8 gap-12'>
        <div className='flex items-center flex-col justify-between relative'>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={items}
            backgroundColors={['#87A9DF', '#B4C7F1']}
            textColors={['#000']}
            onStopSpinning={() => {
              setMustSpin(false)

              setTimeout(() => {
                // @ts-ignore
                modalRef.current?.showModal()
              }, 200)
            }}
            outerBorderColor='#588CF5'
            outerBorderWidth={10}
            radiusLineWidth={0}
            fontSize={14}
          />
          <div className='text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
            Logo
          </div>
          {/* <img src='/images/2024-10-15.jpg' /> */}
        </div>
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
              <span className='text-primary'>{items[prizeNumber]?.option}</span>
            </p>
            <div className='modal-action'>
              <form method='dialog'>
                {/* if there is a button in form, it will close the modal */}
                <button
                  className='btn btn-primary mr-4'
                  type='button'
                  onClick={() => {
                    const luckyMan = items[prizeNumber]
                    console.log(luckyMan)
                    setResults([
                      ...results,
                      {
                        ...luckyMan,
                        type: currentLevel
                      }
                    ])

                    // @ts-ignore
                    modalRef.current?.close()
                  }}
                >
                  Lưu
                </button>
                <button
                  className='btn'
                  type='button'
                  onClick={() => {
                    const unLuckyMan = items[prizeNumber]
                    setHideUsers([...hideUsers, { ...unLuckyMan }])

                    // @ts-ignore
                    modalRef.current?.close()
                  }}
                >
                  Bỏ qua
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
      <div className='col-span-4 text-start flex flex-col space-y-4'>
        <h2>GIẢI ĐẶC BIỆT</h2>
        {results
          .filter((value) => value.type === ResultType.special)
          .map((item) => (
            <p>{item.option}</p>
          ))}
        <h2>GIẢI NHẤT</h2>
        {results
          .filter((value) => value.type === ResultType.first)
          .map((item) => (
            <p>{item.option}</p>
          ))}
        <h2>GIẢI NHÌ</h2>
        {results
          .filter((value) => value.type === ResultType.second)
          .map((item) => (
            <p>{item.option}</p>
          ))}
        <h2>GIẢI BA</h2>
        {results
          .filter((value) => value.type === ResultType.third)
          .map((item) => (
            <p>{item.option}</p>
          ))}
        <h2>GIẢI KHUYẾN KHÍCH</h2>
        {results
          .filter((value) => value.type === ResultType.four)
          .map((item) => (
            <p>{item.option}</p>
          ))}

        <button
          type='button'
          className='btn btn-ghost'
          onClick={() =>
            saveExcelFile(
              results.map((value: any) => {
                const data = value.data.split('_')
                data.push(getTypeLabel(value.type))

                return data
              }),
              'lucky_wheel'
            )
          }
        >
          Lưu kết quả
        </button>
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
