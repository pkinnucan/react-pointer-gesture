import {PointerDiff,
        Pointer,
        Pointers,
        GestureProps, 
        GestureEvent,
        GestureType,
        MoveDirection,
        getMoveDirection} from './gtypes'

// import {log} from './util'

/**
 * Base class for objects that recognize gestures based on
 * pointer movements.
 *
 * @class Recognizer
 */
export class Recognizer { 
    
    pointers = new Array<Pointer>()
    srcEvent: React.PointerEvent<any> | undefined = undefined

    constructor () {
        this.recognize = this.recognize.bind(this)
        this.pointerUp = this.pointerUp.bind(this)
        this.pointerCancel = this.pointerCancel.bind(this)
    }

    /**
     * Recognizes a gesture from a pointer event
     *
     * @param {Pointers} pointers pointers that triggered event
     * @param {GestureProps} callbacks Methods to call for this gesture
     * @param {React.PointerEvent<any>} srcEvent React pointer event that the pointers triggered
     * @returns {boolean} true if pointer event indicates this gesture
     * @memberof Recognizer
     */
    recognize(pointerMap: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
        this.pointers = [...pointerMap.values()]
        this.srcEvent = srcEvent
        return true
    }

    pointerDown(pointerMap: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): void {
        this.pointers = [...pointerMap.values()]
        this.srcEvent = srcEvent
    }

    pointerMove(pointers: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): void {
        this.pointers = [...pointers.values()]
        this.srcEvent = srcEvent
    }

    /**
     * Handle a pointer up event
     *
     * @param {Pointers} _pointers Pointers that triggered the event
     * @param {GestureProps} _callbacks Methods to call for this gesture
     * @param {React.PointerEvent<any>} _srcEvent React pointer event that the pointers triggered
     * @memberof Recognizer
     */
    pointerUp(pointers: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): void {
        this.pointers = [...pointers.values()]
        this.srcEvent = srcEvent
    }

    /**
     * Handle a cancel event
     *
     * @param {Pointers} _pointers
     * @param {GestureProps} _callbacks
     * @param {React.PointerEvent<any>} _srcEvent
     * @memberof Recognizer
     */
    pointerCancel(pointers: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        this.pointers = [...pointers.values()]
        this.srcEvent = srcEvent
    }

  createGestureEvent() {
    return new GestureEvent({
      gestureType: GestureType.Unknown,
      pointers: this.pointers,
      srcEvent: this.srcEvent!})
  }

  triggerEvent(callbacks: GestureProps, gestureEvent: GestureEvent) {
    const gestureType = gestureEvent.gestureType
    const callback = 'on' + gestureType
    if (callbacks[callback] !== undefined) {
      callbacks[callback](gestureEvent)
    }
  }      

}


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
export class PanRecognizer extends Recognizer {

    isPanStart = true

    pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.pointerDown(pointersMap, callbacks, srcEvent)
        this.isPanStart = true
    }

  pointerMove(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerMove(pointersMap, callbacks, srcEvent)
    this.recognize(pointersMap, callbacks, srcEvent)
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
    this.pointerDown = this.pointerDown.bind(this)
    this.pointerMove = this.pointerMove.bind(this)
    this.pointerUp = this.pointerUp.bind(this)
    this.recognize = this.recognize.bind(this)
    this.pointerCancel = this.pointerCancel.bind(this)
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

export class RotateRecognizer extends Recognizer {

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

/**
 *
 *
 * @export
 * @class SwipeRecognizer
 * @extends {Recognizer}
 */
export class SwipeRecognizer extends Recognizer {

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

export class TapRecognizer extends Recognizer {

  timeAtPointerDown: number | undefined
  tapType: GestureType | undefined
  handlerName: string | undefined

  static doubleTapTarget: any | undefined = undefined


  pointerDown(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerDown(pointersMap, callbacks, srcEvent)
    this.timeAtPointerDown = Date.now()
    const target: any = srcEvent.target
    if (target !== TapRecognizer.doubleTapTarget ||
      this.tapType === GestureType.DoubleTap) {
      TapRecognizer.doubleTapTarget = target
      this.tapType = GestureType.Tap
      this.handlerName = 'onTap'
    }
  }


  pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
    super.pointerUp(pointerMap, callbacks, srcEvent)
    this.recognize(pointerMap, callbacks, srcEvent)
  }

  recognize(pointers: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
    super.recognize(pointers, callbacks, srcEvent)
    if (pointers.size === 1) {

      if (callbacks[this.handlerName!] !== undefined) {

        const timeAtPointerUp = Date.now()
        let clickDuration = (timeAtPointerUp - this.timeAtPointerDown!);
        clickDuration = clickDuration / 1000

        if (clickDuration < .25) {
          const gestureEvent = this.createGestureEvent()
          gestureEvent.gestureType = this.tapType!
          callbacks[this.handlerName!](gestureEvent)
        }
      }

      if (this.tapType = GestureType.Tap) {
        this.tapType = GestureType.DoubleTap
        this.handlerName = 'onDoubleTap'
      }

      return true
    }
    return false
  }

}


