import * as React from 'react'
import Recognizer from './recognizers/Recognizer'

export class Point {
    x: number
    y: number

    constructor (x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export enum MoveDirection {
    None = 1,  // 00001
    Left = 2,  // 00010
    Right = 4, // 00100
    Up = 8,    // 01000
    Down = 16, // 10000
    Horizontal = Left | Right,  // 00110
    Vertical = Up | Down,       // 11000
    Any = Horizontal & Vertical // 11110
}

export const getMoveDirection = (dx: number, dy: number): MoveDirection => {
    if (dx === dy) {
        return MoveDirection.None
    } else {
        if (Math.abs(dx) >= Math.abs(dy)) {
            return (dx <= 0) ? MoveDirection.Left : MoveDirection.Right
        } else {
            return (dy <= 0) ? MoveDirection.Up : MoveDirection.Down
        }
    }
}

export class Pointer {

    x: number
    y: number

    dx?: number // distance pointer moved horizontally
    dy?: number // distance pointer moved vertically

    ds?: number // distance pointer moved curvilinearly

    t = Date.now()
    dt?: number

    moveDirection?: MoveDirection

    constructor(e:  React.PointerEvent<any>) {
        this.x = e.clientX
        this.y = e.clientY
    }

    move(e:  React.PointerEvent<any>): void {
        const x = e.clientX
        const y = e.clientY
        const dx = x - this.x
        const dy = y - this.y
        const ds = Math.sqrt(dx * dx + dy * dy)

        this.moveDirection = getMoveDirection(dx, dy)

        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.ds = ds

        const t = Date.now()
        this.dt = t - this.t
        this.t = t

    }

}

export type Pointers = Map<number, Pointer>

/**
 * Vector difference between two points, ptr1 and ptr2
 * 
 *  diff = p2 - p1
 * 
 */
export class PointerDiff {

    /**
     * Length of pointer difference vector
     *
     * @type {number}
     * @memberof PointerDiff
     */
    length: number

    /**
     * Angle of pointer difference vector in degrees
     *
     * @type {number}
     * @memberof PointerDiff
     */
    angle: number

    constructor (ptr1: Pointer, ptr2: Pointer) {

        const dx = ptr2.x - ptr1.x
        const dy = ptr2.y - ptr1.y
        this.length = Math.sqrt(dx * dx + dy * dy)

        const radian = Math.atan2(dy, dx)
        this.angle = 180 / (Math.PI / radian)
    }

}

export enum GestureType {
    Pan = 'Pan',
    PanStart = 'PanStart',
    PanMove = 'PanMove',
    PanEnd = 'PanEnd',
    PanCancel = 'PanCancel',
    PanLeft = 'PanLeft',
    PanRight = 'PanRight',
    PanUp = 'PanUp',
    PanDown = 'PanDown',

    Pinch = 'Pinch',
    PinchStart = 'PinchStart',
    PinchMove = 'PinchMove',
    PinchEnd = 'PinchEnd',
    PinchCancel = 'PinchCancel',
    PinchOut = 'PinchOut',
    PinchIn = 'PinchIn',

    Rotate = 'Rotate',
    RotateStart = 'RotateStart',
    RotateEnd = 'RotateEnd',
    RotateCancel = 'RotateCancel',

    Tap = 'Tap',
    DoubleTap = 'DoubleTap',

    // swipe
    Swipe = 'Swipe',
    SwipeLeft = 'SwipeLeft',
    SwipeRight = 'SwipeRight',
    SwipeUp = 'SwipeUp',
    SwipeDown = 'SwipeDown',
    SwipeCancel = 'SwipeCancel',

    Unknown  = 'Unknown'

}

export enum GenericGestureType {
  Pan = 'Pan',
  Pinch = 'Pinch',
  Rotate = 'Rotate',
  Swipe = 'Swipe',
  Tap = 'Tap'
}

export type GenericGestureTypesType = Array<GenericGestureType>

export const genericGestureTypes: GenericGestureTypesType = 
[
  GenericGestureType.Pan, 
  GenericGestureType.Pinch,
  GenericGestureType.Rotate,
  GenericGestureType.Swipe,
  GenericGestureType.Tap
]

export type PointerMoveDelta = {
    dx: number,
    dy: number
}

export type GestureEventProps = {
    gestureType: GestureType
    pointers: Array<Pointer>
    srcEvent: React.PointerEvent<any>
    delta?: PointerMoveDelta
    scale?: number
    angle?: number
}

export class GestureEvent {

    gestureType: GestureType
    pointers: Array<Pointer>
    srcEvent: React.PointerEvent<any>
    delta?: PointerMoveDelta
    scale?: number
    angle?: number
    direction: MoveDirection

    constructor(props: GestureEventProps) {
        this.gestureType = props.gestureType
        this.srcEvent = props.srcEvent
        this.pointers = props.pointers
        this.delta = props.delta
        this.scale = props.scale
        this.angle = props.angle
        this.direction = MoveDirection.None
    }
  }

export type GestureEventHandler = (e: GestureEvent) => void;

export type GestureProps = {

    onPan?: GestureEventHandler
    onPanStart?: GestureEventHandler
    onPanMove?: GestureEventHandler
    onPanEnd?: GestureEventHandler
    onPanCancel?: GestureEventHandler
    onPanLeft?: GestureEventHandler
    onPanRight?: GestureEventHandler
    onPanUp?: GestureEventHandler
    onPanDown?: GestureEventHandler

    onPinch?: GestureEventHandler
    onPinchStart?: GestureEventHandler
    onPinchMove?: GestureEventHandler
    onPinchEnd?: GestureEventHandler
    onPinchCancel?: GestureEventHandler
    onPinchIn?: GestureEventHandler
    onPinchOut?: GestureEventHandler

    onRotate?: GestureEventHandler
    onRotateStart?: GestureEventHandler
    onRotateMove?: GestureEventHandler
    onRotateEnd?: GestureEventHandler
    onRotateCancel?: GestureEventHandler

    onTap?: GestureEventHandler
    onDoubleTap?: GestureEventHandler

    // swipe
    onSwipe?: GestureEventHandler;
    onSwipeLeft?: GestureEventHandler;
    onSwipeRight?: GestureEventHandler;
    onSwipeUp?: GestureEventHandler;
    onSwipeDown?: GestureEventHandler;
    onSwipeCancel?: GestureEventHandler;

    // original dom element event handler
    onPointerDown?: React.PointerEventHandler<any>;
    onPointerMove?: React.PointerEventHandler<any>;
    onPointerUp?: React.PointerEventHandler<any>;
    onPointerCancel?: React.PointerEventHandler<any>;

    recognizers?: Array<Recognizer>
}

