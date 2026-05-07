export type UUID = string
export type ISODateString = string

export type ResourceValue = {
  current: number
  max: number
}

export type Range = {
  min: number
  max: number
}

export type WeightedValue<T extends string = string> = {
  key: T
  weight: number
}
