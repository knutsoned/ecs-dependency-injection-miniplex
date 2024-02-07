export const enum NumberType {
  i8,
  ui8,
  i16,
  ui16,
  i32,
  ui32, // CDR sequemce length, bitECS EID
  f32,
  f64, // ES number type
}

// NumberValue is number
// strings are internally a numeric index into the flyweight array
// i64 and ui64 are supported by CDR but not reliable in JavaScript

// when serializing flyweight strings, values are just the literal string
export type CDRType = NumberType | string
export type CDRValue = number | string

export type FlyWeightString = {
  id: number
  value: string
}

export interface IEntity {}

export interface IState {}

export interface IWorld {}
