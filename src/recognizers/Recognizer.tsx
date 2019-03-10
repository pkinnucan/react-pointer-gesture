import {
  Pointer,
  Pointers,
  GestureProps, 
  GestureEvent,
  GestureType} from '../gtypes'

// import {log} from './util'

/**
* Base class for objects that recognize gestures based on
* pointer movements.
*
* @class Recognizer
*/
class Recognizer { 

pointers = new Array<Pointer>()
srcEvent: React.PointerEvent<any> | undefined = undefined

constructor () {
  this.recognize = this.recognize.bind(this)
  this.pointerDown = this.pointerDown.bind(this)
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

export default Recognizer
