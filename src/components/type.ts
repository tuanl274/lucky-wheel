export interface IFormData {
  wheelItems: any[]
  total: number
  config: IConfigLevel
}

export interface IConfigLevel {
  special: number
  first: number
  second: number
  third: number
  four: number
}

export interface WheelItem {
  option: string
  value?: string | number
  data: string
}

export interface IResult extends WheelItem {
  type?: ResultType
}

export enum ResultType {
  special,
  first,
  second,
  third,
  four
}
