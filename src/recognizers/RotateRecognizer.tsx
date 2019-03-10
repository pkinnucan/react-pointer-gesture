import Recognizer from './Recognizer'
import {PointerDiff, Pointers, GestureProps, GestureType} from '../gtypes'

class RotateRecognizer extends Recognizer {

  prevPointerDiff?: PointerDiff = undefined
  isPtr1: boolean = true

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

    // log('Rotate Recognizer')
    // log (`Callbacks: ${Object.keys(callbacks)}`)

    // Do not attempt rotate recognition if the client is also testing for pinch
    // recognition. The following line tests if the client callbacks include callbacks
    // that start with onPinch, e.g., onPinch, onPinchStart, etc.
    if (Object.keys(callbacks).some((prop): boolean => { return prop.indexOf('onPinch') === 0 })) {
      return false
    }

    // If two pointers are down, check for rotate gestures
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

        // log('Rotate')

        const curDiffAngle = curPointerDiff.angle
        const prevDiffAngle = this.prevPointerDiff.angle

        // log(`prevDiff: ${prevDiff}, curDiff: ${curDiff}`)

        const angle = curDiffAngle - prevDiffAngle

        if (angle !== 0) {

          // The pointer difference vector has rotated. Trigger a
          // rotate event

          let gestureEvent = this.createGestureEvent()
          gestureEvent.angle = angle
          gestureEvent.gestureType = GestureType.Rotate
          this.triggerEvent(callbacks, gestureEvent)
        }

        this.prevPointerDiff = curPointerDiff
        return true
      } else {       
        let gestureEvent = this.createGestureEvent()
        gestureEvent.gestureType = GestureType.RotateStart
        this.triggerEvent(callbacks, gestureEvent)
      }

      this.prevPointerDiff = curPointerDiff
    }

    return true

  }

  pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerUp(pointerMap, callbacks, srcEvent)
    if (this.prevPointerDiff !== undefined) {
      this.prevPointerDiff = undefined
      const gestureEvent = this.createGestureEvent()
      gestureEvent.gestureType = GestureType.RotateEnd
      this.triggerEvent(callbacks, gestureEvent)
    }
  }

  pointerCancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerCancel(pointersMap, callbacks, srcEvent)
    let gestureEvent = this.createGestureEvent()
    gestureEvent.gestureType = GestureType.RotateCancel
    this.triggerEvent(callbacks, gestureEvent)
  }

}

export default RotateRecognizer