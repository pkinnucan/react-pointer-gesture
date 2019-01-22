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
    
    gestureEvent: GestureEvent | undefined
    pointers = new Array<Pointer>()

    constructor () {
        this.recognize = this.recognize.bind(this)
        this.pointerUp = this.pointerUp.bind(this)
        this.cancel = this.cancel.bind(this)
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
        this.gestureEvent = new GestureEvent({
            gestureType: GestureType.Unknown,
            pointers: this.pointers,
            srcEvent})
        return true
    }

    pointerDown(pointerMap: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): void {
        this.pointers = [...pointerMap.values()]
        this.gestureEvent = new GestureEvent({
            gestureType: GestureType.Unknown,
            pointers: this.pointers,
            srcEvent})
    }

    pointerMove(pointers: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>): void {
        this.pointers = [...pointers.values()]
        this.gestureEvent = new GestureEvent({
            gestureType: GestureType.Unknown,
            pointers: this.pointers,
            srcEvent})
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
        this.gestureEvent = new GestureEvent({
            gestureType: GestureType.Unknown,
            pointers: this.pointers,
            srcEvent})
    }

    /**
     * Handle a cancel event
     *
     * @param {Pointers} _pointers
     * @param {GestureProps} _callbacks
     * @param {React.PointerEvent<any>} _srcEvent
     * @memberof Recognizer
     */
    cancel(pointers: Pointers, _callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        this.pointers = [...pointers.values()]
        this.gestureEvent = new GestureEvent({
            gestureType: GestureType.Unknown,
            pointers: this.pointers,
            srcEvent})
    }

    triggerEvent(callbacks: GestureProps) {
      if (this.gestureEvent !== undefined) {
        const gestureEvent = this.gestureEvent
        const gestureType = gestureEvent.gestureType

        const callback = 'on' + gestureType

        if (callbacks[callback] !== undefined) {
            callbacks[callback](gestureEvent)
        }
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

        if (this.pointers.length === 1 && !onSwipe && this.gestureEvent !== undefined) {

            const delta = {dx: this.pointers[0].dx!, dy: this.pointers[0].dy!}
            this.gestureEvent.delta = delta

            this.gestureEvent.gestureType = GestureType.Pan
            this.triggerEvent(callbacks)

            if (this.isPanStart) {
                this.gestureEvent.gestureType = GestureType.PanStart
                this.triggerEvent(callbacks)
                this.isPanStart = false
            } else {
                this.gestureEvent.gestureType = GestureType.PanMove
                this.triggerEvent(callbacks)
            }

            const gestureType = 'Pan' + this.pointers[0].moveDirection
            this.gestureEvent.gestureType  = GestureType[gestureType]
            this.triggerEvent(callbacks)

            return true
        } else {
            return false
        }

    }

    pointerUp(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.pointerUp(pointersMap, callbacks, srcEvent)
        const delta = {dx: this.pointers[0].dx!, dy: this.pointers[0].dy!}

        if (this.gestureEvent !== undefined) {
          this.gestureEvent.delta = delta

          this.gestureEvent.gestureType  = GestureType.PanEnd
          this.triggerEvent(callbacks)
        } else {
          throw Error("gesture event undefined")
        }
    }

    cancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.cancel(pointersMap, callbacks, srcEvent)
        const delta = {dx: this.pointers[0].dx!, dy: this.pointers[0].dy!}

        if (this.gestureEvent !== undefined) {
          this.gestureEvent.delta = delta
          this.gestureEvent.gestureType  = GestureType.PanCancel
          this.triggerEvent(callbacks)
        } else {
          throw Error("gesture event undefined")
        }

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
        if (pointers.size === 2 && this.gestureEvent !== undefined) {

            this.gestureEvent.gestureType = GestureType.PinchStart
            this.triggerEvent(callbacks)

            // Calculate the difference between the two pointers. The difference
            // is a vector resulting from subtracting the position vector of one
            // pointer from the position vector of the other.
            const ptrs = this.gestureEvent.pointers
            const ptr1 = ptrs[0]
            const ptr2 = ptrs[1]

            // log(`ptr1 = (${ptr1.x},${ptr1.y}) ptr2 = (${ptr2.x},${ptr2.y})`)

            const curPointerDiff = new PointerDiff(ptr1, ptr2)

            if (this.prevPointerDiff !== undefined) {

                const curDiff = curPointerDiff.length
                const prevDiff = this.prevPointerDiff.length

                // log(`prevDiff: ${prevDiff}, curDiff: ${curDiff}`)

                if (prevDiff > 0) {

                    const scale = curDiff / prevDiff
                    this.gestureEvent.scale = scale

                    if (scale > 1) {
                        // The distance between the two pointers has increased
                        // log("Pinch moving OUT -> Zoom in");
                        this.gestureEvent.gestureType = GestureType.PinchIn
                        this.triggerEvent(callbacks)
                    } else {
                        // The distance between the two pointers has decreased
                        // log("Pinch moving IN -> Zoom out");
                        this.gestureEvent.gestureType = GestureType.PinchOut
                        this.triggerEvent(callbacks)
                    }

                    this.gestureEvent.gestureType = GestureType.Pinch
                    this.triggerEvent(callbacks)

                }

            }

            // Cache the distance for the next move event 
            this.prevPointerDiff = curPointerDiff;
            return true
        }

        if (this.prevPointerDiff !== undefined && this.gestureEvent !== undefined) {
            this.gestureEvent.gestureType = GestureType.PinchEnd
            this.triggerEvent(callbacks)
            return true
        } else {
            return false
        }
    }

    cancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.cancel(pointersMap, callbacks, srcEvent)

        if (this.gestureEvent !== undefined) {
          this.gestureEvent.gestureType  = GestureType.PinchCancel
          this.triggerEvent(callbacks)
        } else {
          throw Error("gesture event undefined")
        }

    }

}

export class RotateRecognizer extends Recognizer {

    prevPointerDiff?: PointerDiff = undefined

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
        if (Object.keys(callbacks).some((prop): boolean => { return prop.indexOf('onPinch') === 0})) {
            return false
        }

        // If two pointers are down, check for rotate gestures
        if (pointers.size === 2 && this.gestureEvent !== undefined) {
            this.gestureEvent.gestureType = GestureType.RotateStart
            this.triggerEvent(callbacks)

            // Calculate the difference between the two pointers. The difference
            // is a vector resulting from subtracting the position vector of one
            // pointer from the position vector of the other.
            const ptrs = this.gestureEvent.pointers
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

                    this.gestureEvent.angle = angle
                    this.gestureEvent.gestureType = GestureType.Rotate
                    this.triggerEvent(callbacks)
                } 

                this.prevPointerDiff = curPointerDiff
                return true
            }  

            this.prevPointerDiff = curPointerDiff
        }

        if (this.prevPointerDiff !== undefined && this.gestureEvent !== undefined) {
            this.gestureEvent.gestureType = GestureType.PinchEnd
            this.triggerEvent(callbacks)
            return true
        } else {
            return false
        }
    }

    cancel(pointersMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.cancel(pointersMap, callbacks, srcEvent)

        if (this.gestureEvent !== undefined) {
          this.gestureEvent.gestureType  = GestureType.RotateCancel
          this.triggerEvent(callbacks)
        } else {
          throw Error("gestureEvent undefined")
        }

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

        if (this.gestureEvent !== undefined) {
          const pointers = this.gestureEvent.pointers
          if (pointers.length === 1) {
              if (this.startX === undefined) {
                  this.startX = pointers[0].x
                  this.startY = pointers[0].y
                  this.startTime = Date.now()
              }
          }
        } else {
          throw Error("gesture event undefined")
        }

    }

    pointerUp(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>) {
        super.pointerUp(pointerMap, callbacks, srcEvent)
        this.recognize(pointerMap, callbacks, srcEvent)
    }

    recognize(pointerMap: Pointers, callbacks: GestureProps, srcEvent: React.PointerEvent<any>): boolean {
        super.recognize(pointerMap, callbacks, srcEvent)
        const pointers = this.gestureEvent!.pointers
        if (pointers.length === 1) {

            const dx = pointers[0].x - this.startX!
            const dy = pointers[0].y - this.startY!

            const curTime = Date.now()

            const triggerDistance = 10
            const triggerVelocity = 0.33

            const swipeDistance =  Math.sqrt(dx * dx + dy * dy)
            const swipeVelocity = swipeDistance/(curTime - this.startTime!)

            // log(`Swipe distance: ${swipeDistance} Swipe velocity ${swipeVelocity}`)

            if (swipeDistance > triggerDistance && swipeVelocity > triggerVelocity) {
                const moveDirection = getMoveDirection(dx, dy)
                
                this.gestureEvent!.delta = {dx, dy}
                this.gestureEvent!.direction = moveDirection
                this.gestureEvent!.gestureType = GestureType.Swipe 
                this.triggerEvent(callbacks)


                switch (moveDirection) {
                    case MoveDirection.Left:
                        this.gestureEvent!.gestureType = GestureType.SwipeLeft
                        break
                    case MoveDirection.Right:
                        this.gestureEvent!.gestureType = GestureType.SwipeRight
                        break
                    case MoveDirection.Up:
                        this.gestureEvent!.gestureType = GestureType.SwipeUp
                        break
                    case MoveDirection.Down:
                        this.gestureEvent!.gestureType = GestureType.SwipeDown
                        break

                }

                this.triggerEvent(callbacks)
                return true

            }

            return false
            
        } else {
            return false
        }
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
                    callbacks[this.handlerName!](this.gestureEvent)
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


