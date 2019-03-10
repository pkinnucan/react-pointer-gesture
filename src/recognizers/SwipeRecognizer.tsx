import Recognizer from './Recognizer'
import {Pointers, GestureProps,  GestureType, MoveDirection, getMoveDirection} from '../gtypes'

/**
 *
 *
 * @export
 * @class SwipeRecognizer
 * @extends {Recognizer}
 */
class SwipeRecognizer extends Recognizer {

  startX: number | undefined
  startY: number | undefined
  startTime: number | undefined

  pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
      super.pointerDown(pointersMap, callbacks, srcEvent)
      this.startX = undefined
  }


pointerMove(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
  super.pointerMove(pointerMap, callbacks, srcEvent)

  const pointers = this.pointers
  if (pointers.length === 1) {
    if (this.startX === undefined) {
      this.startX = pointers[0].x
      this.startY = pointers[0].y
      this.startTime = Date.now()
    }
  }

}

  pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
      super.pointerUp(pointerMap, callbacks, srcEvent)
      this.recognize(pointerMap, callbacks, srcEvent)
  }

  recognize(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
      super.recognize(pointerMap, callbacks, srcEvent)
      const pointers = this.pointers
      if (pointers.length === 1) {

          const dx = pointers[0].x - this.startX!
          const dy = pointers[0].y - this.startY!

          const curTime = Date.now()

          const triggerDistance = 10 // pixels
          const triggerVelocity = 0.33 // pixels per millisecond

          const swipeDistance =  Math.sqrt(dx * dx + dy * dy)
          const swipeVelocity = swipeDistance/(curTime - this.startTime!)

          // log(`Swipe distance: ${swipeDistance} Swipe velocity ${swipeVelocity}`)

          // Trigger a swipe event if he swipe is fast enough or long enough.
          if (swipeVelocity > triggerVelocity || swipeDistance > triggerDistance) {
              const moveDirection = getMoveDirection(dx, dy)
              
              if (moveDirection !== MoveDirection.None) {

                let gestureEvent = this.createGestureEvent()

                gestureEvent.delta = {dx, dy}
                gestureEvent.direction = moveDirection

                gestureEvent.gestureType = GestureType.Swipe 
                this.triggerEvent(callbacks, gestureEvent)

                gestureEvent = this.createGestureEvent()

                gestureEvent.delta = {dx, dy}
                gestureEvent.direction = moveDirection
                
                switch (moveDirection) {
                    case MoveDirection.Left:
                        gestureEvent!.gestureType = GestureType.SwipeLeft
                        break
                    case MoveDirection.Right:
                        gestureEvent!.gestureType = GestureType.SwipeRight
                        break
                    case MoveDirection.Up:
                        gestureEvent!.gestureType = GestureType.SwipeUp
                        break
                    case MoveDirection.Down:
                        gestureEvent!.gestureType = GestureType.SwipeDown
                        break
                }

                this.triggerEvent(callbacks, gestureEvent)
                return true

              }

          }

          return false
          
      } else {
          return false
      }
  }

pointerCancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
  super.pointerCancel(pointersMap, callbacks, srcEvent)
  const gestureEvent = this.createGestureEvent()
  gestureEvent.gestureType = GestureType.SwipeCancel
  this.triggerEvent(callbacks, gestureEvent)
}

}

export default SwipeRecognizer
