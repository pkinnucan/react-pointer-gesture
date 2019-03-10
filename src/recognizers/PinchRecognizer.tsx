import Recognizer from './Recognizer'
import {PointerDiff, Pointers, GestureProps, GestureType} from '../gtypes'

/**
 * Recognizes a pinch in or out gesture from a pointer event. This object
 * recognizes a pinch in from two pointers moving toward each other. It 
 * recognizes a pinch out event from two pointers moving away from each 
 * other.
 *
 * @export
 * @class PinchRecognizer
 * @extends {Recognizer}
 */
export class PinchRecognizer extends Recognizer {

  prevPointerDiff?: PointerDiff = undefined
  isPtr1: boolean = true

  constructor() {
    super()
/*     this.pointerDown = this.pointerDown.bind(this)
    this.pointerMove = this.pointerMove.bind(this)
    this.pointerUp = this.pointerUp.bind(this)
    this.recognize = this.recognize.bind(this)
    this.pointerCancel = this.pointerCancel.bind(this) */
  }

  pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerDown(pointersMap, callbacks, srcEvent)
    this.prevPointerDiff = undefined
  }

  pointerMove(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerMove(pointerMap, callbacks, srcEvent)
    this.recognize(pointerMap, callbacks, srcEvent)
  }

  recognize(pointers: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
    super.pointerUp(pointers, callbacks, srcEvent)

    // If two pointers are down, check for pinch gestures
    if (pointers.size === 2) {

      if (this.isPtr1) {
        this.isPtr1 = false
        return false
      } else {
        this.isPtr1 = true
      }

      // Calculate the difference between the two pointers. The difference
      // is a vector resulting from subtracting the position vector of one
      // pointer from the position vector of the other.
      const ptrs = this.pointers
      const ptr1 = ptrs[0]
      const ptr2 = ptrs[1]

      // log(`ptr1 = (${ptr1.x},${ptr1.y}) ptr2 = (${ptr2.x},${ptr2.y})`)

      const curPointerDiff = new PointerDiff(ptr1, ptr2)

      if (this.prevPointerDiff !== undefined) {

        const curDiff = curPointerDiff.length
        const prevDiff = this.prevPointerDiff.length

        // log(`prevDiff: ${prevDiff}, curDiff: ${curDiff}`)

        if (prevDiff > 0) {

          let gestureEvent = this.createGestureEvent()

          const scale = curDiff / prevDiff
          gestureEvent.scale = scale

          if (scale > 1) {
            // The distance between the two pointers has increased
            // log("Pinch moving OUT -> Zoom in");
            gestureEvent.gestureType = GestureType.PinchOut
            this.triggerEvent(callbacks, gestureEvent)
          } else {
            // The distance between the two pointers has decreased
            // log("Pinch moving IN -> Zoom out");
            gestureEvent.gestureType = GestureType.PinchIn
            this.triggerEvent(callbacks, gestureEvent)
          }

          gestureEvent =this.createGestureEvent()
          gestureEvent.gestureType = GestureType.PinchMove
          gestureEvent.scale = scale
          this.triggerEvent(callbacks, gestureEvent)

          gestureEvent =this.createGestureEvent()
          gestureEvent.gestureType = GestureType.Pinch
          gestureEvent.scale = scale
          this.triggerEvent(callbacks, gestureEvent)

        }
      } else {       
        let gestureEvent = this.createGestureEvent()
        gestureEvent.gestureType = GestureType.PinchStart
        this.triggerEvent(callbacks, gestureEvent)
      }

      // Cache the distance for the next move event 
      this.prevPointerDiff = curPointerDiff;
      return true
    }

    return true
  }

  pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerUp(pointerMap, callbacks, srcEvent)
    if (this.prevPointerDiff !== undefined) {
      this.prevPointerDiff = undefined
      const gestureEvent = this.createGestureEvent()
      gestureEvent.gestureType = GestureType.PinchEnd
      this.triggerEvent(callbacks, gestureEvent)
    }
  }

  pointerCancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerCancel(pointersMap, callbacks, srcEvent)
    const gestureEvent = this.createGestureEvent()
    gestureEvent.gestureType = GestureType.PanCancel
    gestureEvent.gestureType = GestureType.PinchCancel
    this.triggerEvent(callbacks, gestureEvent)
  }     

}

export default PinchRecognizer