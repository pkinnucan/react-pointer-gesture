import Recognizer from './Recognizer'
import {Pointers, GestureProps,  GestureType} from '../gtypes'

class TapRecognizer extends Recognizer {

  timeAtPointerDown: number | undefined
  timeAtPointerUp: number | undefined
  tapType: GestureType | undefined
  handlerName: string | undefined

  static doubleTapTarget: any | undefined = undefined
  static tapInterval = 250 // Time in milliseconds between tap pointer down, pointer up
  static doubleTapInterval = 250  // Time in millisections between double tap taps

  pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerDown(pointersMap, callbacks, srcEvent)
    // console.log('Tap pointer down event')
    this.timeAtPointerDown = Date.now()

    const target: any = srcEvent.target

    this.tapType = GestureType.Tap
    this.handlerName = 'onTap'
    if (TapRecognizer.doubleTapTarget === undefined || target !== TapRecognizer.doubleTapTarget) {
      TapRecognizer.doubleTapTarget = target
    } else {
      const timeBetweenTaps = this.timeAtPointerDown - this.timeAtPointerUp!
      if (timeBetweenTaps < TapRecognizer.doubleTapInterval) {
        this.tapType = GestureType.DoubleTap
        this.handlerName = 'onDoubleTap'
      }
       else {
        const gestureEvent = this.createGestureEvent()
        gestureEvent.gestureType = this.tapType!
        console.log('Tap pointer down event')
        callbacks[this.handlerName!](gestureEvent)
      } 
      TapRecognizer.doubleTapTarget = undefined
    }

  }


  pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerUp(pointerMap, callbacks, srcEvent)
    this.timeAtPointerUp = Date.now()
    this.recognize(pointerMap, callbacks, srcEvent)
  }

  recognize(pointers: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
    super.recognize(pointers, callbacks, srcEvent)
    if (pointers.size === 1) {

      if (callbacks[this.handlerName!] !== undefined) {

        let tapInterval = (this.timeAtPointerUp! - this.timeAtPointerDown!);

        if (tapInterval < TapRecognizer.tapInterval) {
          const gestureEvent = this.createGestureEvent()
          gestureEvent.gestureType = this.tapType!
          callbacks[this.handlerName!](gestureEvent)
        }

        return true
      }

    }
    return false
  }
}

export default TapRecognizer