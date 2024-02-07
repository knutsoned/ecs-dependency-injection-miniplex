// import { defineComponent, Types } from 'bitecs'
import { NumberType as Types, ISchema, Vector2 } from '../../types/Ex.It'

export const schema: ISchema = {
  components: {
    Position: Vector2,
    Velocity: Vector2,
    Sprite: {
      texture: Types.ui8,
    },
    Tint: {
      color: Types.ui32,
    },
    Follow: {
      eid: Types.ui32,
      offsetX: Types.f32,
      offsetY: Types.f32,
      state: Types.ui8,
    },
    MovementInput: {
      direction: Types.ui8,
    },
    Ball: {
      startX: Types.f64,
      startY: Types.f64,
      followOffsetX: Types.f32,
      followOffsetY: Types.f32,
    },
    Launcher: {
      state: Types.ui8,
    },
    BoxCollider: {
      width: Types.ui32,
      height: Types.ui32,
      chamferRadius: Types.ui32,
    },
    CircleCollider: {
      radius: Types.ui8,
    },
    Friction: {
      friction: Types.f32,
      frictionAir: Types.f32,
    },
    Bouncy: {
      restitution: Types.f32,
    },
    ChangeVelocity: {
      x: Types.f32,
      y: Types.f32,
    },
    Direction: {
      direction: Types.ui8,
    },
  },
  markers: [
    'ActiveState',
    'Brick',
    'FixedRotation',
    'Paddle',
    'PhysicsBody',
    'Static',
  ],
}

export enum Direction {
  Left = 0b01,
  Right = 0b10,
}
