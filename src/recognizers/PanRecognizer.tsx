import Recognizer from './Recognizer'
import {Pointers, GestureProps, GestureType} from '../gtypes'

/**
 *
 * Recognizes a pan gesture. A pan gesture occurs when the user moves
 * a single pointer over the display surface.
 * 
 * Note: This recognizer is disabled if the Gesture client specifies a
 * swipe callback. In other words, a client cannot recognize both pan and
 * swipe gestures.
 * 
 * @export
 * @class PanRecognizer
 * @extends {Recognizer}
 */
class PanRecognizer extends Recognizer {

  isPanStart = true

  constructor() {
    super()
    this.pointerDown = this.pointerDown.bind(this)
  }

  pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
      super.pointerDown(pointersMap, callbacks, srcEvent)
      this.isPanStart = true
  }

pointerMove(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
  super.pointerMove(pointersMap, callbacks, srcEvent)
  this.recognize(pointersMap, callbacks, srcEvent)
  // console.log('Pan pointer down event')
}

recognize(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
  super.recognize(pointersMap, callbacks, srcEvent)
  const onSwipe = callbacks.onSwipe || callbacks.onSwipeDown || callbacks.onSwipeUp
    || callbacks.onSwipeLeft || callbacks.onSwipeRight

  if (this.pointers.length === 1 && !onSwipe) {

    let gestureEvent = this.createGestureEvent()

    const delta = { dx: this.pointers[0].dx!, dy: this.pointers[0].dy! }
    gestureEvent.delta = delta

    gestureEvent.gestureType = GestureType.Pan
    this.triggerEvent(callbacks, gestureEvent)

    gestureEvent = this.createGestureEvent()

    if (this.isPanStart) {
      gestureEvent.gestureType = GestureType.PanStart
      this.triggerEvent(callbacks, gestureEvent)
      this.isPanStart = false
    } else {
      gestureEvent.gestureType = GestureType.PanMove
      this.triggerEvent(callbacks, gestureEvent)
    }

    gestureEvent = this.createGestureEvent()

    const gestureType = 'Pan' + this.pointers[0].moveDirection
    gestureEvent.gestureType = GestureType[gestureType]
    this.triggerEvent(callbacks, gestureEvent)

    return true
  } else {
    return false
  }

}

pointerUp(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
  super.pointerUp(pointersMap, callbacks, srcEvent)

  let gestureEvent = this.createGestureEvent()

  const delta = { dx: this.pointers[0].dx!, dy: this.pointers[0].dy! }

  gestureEvent.delta = delta

  gestureEvent.gestureType = GestureType.PanEnd
  this.triggerEvent(callbacks, gestureEvent)

}

pointerCancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
  super.pointerCancel(pointersMap, callbacks, srcEvent)
  const delta = { dx: this.pointers[0].dx!, dy: this.pointers[0].dy! }

  let gestureEvent = this.createGestureEvent()

  gestureEvent.delta = delta
  gestureEvent.gestureType = GestureType.PanCancel
  this.triggerEvent(callbacks, gestureEvent)
}
}

export default PanRecognizer
