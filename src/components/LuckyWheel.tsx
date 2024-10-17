import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { IConfigLevel, IResult, ResultType, WheelItem } from './type'
// @ts-ignore
// import { Wheel } from 'spin-wheel'

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
  const [temp, setTemp] = useState<any>(null)
  const modalRef = useRef(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const items = wheelItems
    // .concat(...wheelItems)
    .filter((value) => !results.some((rs) => rs.value == value.value))
    .filter((value) => !hideUsers.some((u) => u.value == value.value))

  // console.log('results......', results)
  // console.log('hiden.........', hideUsers)

  const handleSpinClick = () => {
    if (items.length > 1 && results.length < total) {
      const newPrizeNumber = Math.floor(Math.random() * items.length)
      setPrizeNumber(newPrizeNumber)
      setMustSpin(true)
    } else {
      toast('Quay thưởng hoàn thành', {
        type: 'success'
      })
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

  const getTotalByLevel = (type: ResultType) => {
    switch (type) {
      case ResultType.special:
        return config.special
      case ResultType.first:
        return config.first
      case ResultType.second:
        return config.second
      case ResultType.third:
        return config.third

      default:
        return config.four
    }
  }

  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-8 gap-12'>
        <div className='flex items-center flex-col justify-between relative custom-spin'>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={items}
            backgroundColors={['#87A9DF', '#B4C7F1']}
            textColors={['#000']}
            onStopSpinning={() => {
              setMustSpin(false)
              const luckyMan = items[prizeNumber]
              setTemp(luckyMan)

              setTimeout(() => {
                // @ts-ignore
                modalRef.current?.showModal()
                audioRef.current?.play()
              }, 200)
            }}
            outerBorderColor='#588CF5'
            outerBorderWidth={10}
            radiusLineWidth={0}
            fontSize={12}
            fontWeight={400}
            fontFamily='Josefin Sans'
          />
          <div
            className='text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full overflow-hidden'
            onClick={() => {
              if (!mustSpin) {
                handleSpinClick()
              }
            }}
          >
            <img
              src='/images/logo.png'
              width={72}
              height={72}
              className='rounded-full'
            />
          </div>
        </div>
        <div className='col-span-8'>
          <button
            type='button'
            className='btn btn-link'
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

        <dialog id='my_modal_1' className='modal' ref={modalRef}>
          <div className='modal-box'>
            <h3 className='font-medium text-2xl text-white'>Xin chúc mừng </h3>
            <p className='py-4 text-3xl text-center text-primary'>
              🎉 {items[prizeNumber]?.option.toUpperCase()} 🎉
            </p>
            <div className='modal-action'>
              <form method='dialog'>
                {/* if there is a button in form, it will close the modal */}
                <button
                  className='btn btn-primary mr-4'
                  type='button'
                  onClick={() => {
                    const luckyMan = items[prizeNumber]
                    // setTemp(luckyMan)
                    // console.log(luckyMan)
                    setResults([
                      ...results,
                      {
                        ...luckyMan,
                        type: currentLevel
                      }
                    ])
                    setTemp(null)

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
                    setTemp(null)
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
        <h2 className='text-4xl text-primary font-medium'>
          0{getTotalByLevel(currentLevel)}{' '}
          {getTypeLabel(currentLevel).toUpperCase()} 🎁
        </h2>
        <div className='grid grid-cols-1 gap-6'>
          {results
            .filter((value) => value.type === currentLevel)
            .map((item) => (
              <div className='text-xl text-white flex space-x-3 items-center ml-10'>
                <img
                  width='32'
                  height='32'
                  src='/images/check.png'
                  alt='approval'
                />
                <p className='text-lg'>{item.option.toUpperCase()}</p>
              </div>
            ))}
          {temp && (
            <div className='text-xl text-white flex space-x-3 items-center ml-10'>
              <img
                width='32'
                height='32'
                src='/images/check.png'
                alt='approval'
              />
              <p className='text-lg'>{temp.option.toUpperCase()}</p>
            </div>
          )}
        </div>

        <audio ref={audioRef}>
          <source src='/ta-da.mp3' type='audio/mp3' />
        </audio>
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
