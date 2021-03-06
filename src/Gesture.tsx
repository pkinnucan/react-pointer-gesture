/* tslint:disable:no-console */
import * as React from 'react'
import {getEventName} from './util'
import Recognizer from './recognizers/Recognizer'
import TapRecognizer from './recognizers/TapRecognizer'
import recognizerRegistry from './recognizers/RecognizerRegistry'
import {Pointer, Pointers} from './gtypes'
import {GestureProps, GenericGestureTypesType, GenericGestureType, genericGestureTypes} from './gtypes'
// import {log} from './util'


class Gesture extends React.Component<GestureProps, Object> {

  pointers: Pointers = new Map<number, Pointer>()
  recognizers = new Array<Recognizer>()

  constructor(props: GestureProps) {
    super(props)

    this._handlePointerDown = this._handlePointerDown.bind(this)
    this._handlePointerMove = this._handlePointerMove.bind(this)
    this._handlePointerUp = this._handlePointerUp.bind(this)
    this._handlePointerCancel = this._handlePointerCancel.bind(this)
    this.getExpectedGestures = this.getExpectedGestures.bind(this)


    this.triggerUserCb = this.triggerUserCb.bind(this)

    const expectedGestures = this.getExpectedGestures()
    if (expectedGestures !== undefined) {
      expectedGestures.forEach((gesture) => {
        const recognizer = recognizerRegistry.getRecognizer(gesture)
        if (recognizer !== undefined) {
          this.recognizers.push(recognizer)
          if (recognizer instanceof TapRecognizer) {
            TapRecognizer.tapInterval = this.props.tapInterval ? this.props.tapInterval : 250
            TapRecognizer.doubleTapInterval = this.props.doubleTapInterval ? this.props.doubleTapInterval : 250
          }
        }
      })
    }

    if (props.recognizers !== undefined) {
      this.recognizers = this.recognizers.concat(props.recognizers)
    }

  }

  getExpectedGestures() : GenericGestureTypesType | undefined {

    let types: GenericGestureTypesType = []
    for (let prop in this.props) {
      genericGestureTypes.forEach((type) => {
        if (prop.indexOf(type) > -1) {
          types.push(type as GenericGestureType)
        }
      })
    }     
    return [...Array.from(new Set(types))];
  }

  /**
   * If the Gesture object provides a callback for any of the standard
   * touch events (start, move, end), this function invokes the callback.
   */
  triggerUserCb = (eventSubtype: string, e: React.PointerEvent<any>) => {
    const cbName = getEventName("onPointer", eventSubtype)
    if (cbName in this.props) {
      const handler = this.props[cbName] as any
      if (handler !== undefined) {
        handler(e)
      }
    }
  }


  _handlePointerDown(e: React.PointerEvent<any>) {
    // const target: any = e.target
    e.stopPropagation()
    // target.setPointerCapture(e.pointerId);
    this.triggerUserCb('down', e);
    this.pointers.set(e.pointerId, new Pointer(e))

    // log(`pointer ${e.pointerId} down `)

    for (let i = 0; i < this.recognizers.length; i++) {
      this.recognizers[i].pointerDown(this.pointers, this.props, e)
    }

  }

  _handlePointerMove(e: React.PointerEvent<any>) {
    this.triggerUserCb('move', e);
    e.stopPropagation()

    // log(`pointer ${e.pointerId} move`)

    const pointer = this.pointers.get(e.pointerId)

    if (pointer !== undefined) {
      pointer.move(e)

      // log(` dx: ${pointer.dx}`)
      // log(` dy: ${pointer.dx}`)

      for (let i = 0; i < this.recognizers.length; i++) {
        this.recognizers[i].pointerMove(this.pointers, this.props, e)
      }
    }
  } 

  _handlePointerLeave(e: React.PointerEvent<any>) {
    e.stopPropagation()
    // log(`pointer ${e.pointerId} leave`)
  }

  _handlePointerOut(e: React.PointerEvent<any>) {
    e.stopPropagation()
    // log(`pointer ${e.pointerId} out`)
  }
    
  _handlePointerUp(e: React.PointerEvent<any>) {
    // log(`pointer ${e.pointerId} up `)
    e.stopPropagation()
    this.triggerUserCb('up', e)

    for (let i = 0; i < this.recognizers.length; i++) {
      this.recognizers[i].pointerUp(this.pointers, this.props, e)
    }

    this.pointers.delete(e.pointerId)
  }

  _handlePointerCancel(e: React.PointerEvent<any>) {
    e.stopPropagation()
    // log(`pointer ${e.pointerId} cancel`)
    this.triggerUserCb('cancel', e)

    for (let i = 0; i < this.recognizers.length; i++) {
      this.recognizers[i].pointerCancel(this.pointers, this.props, e)
    }

    this.pointers.delete(e.pointerId)
  }

  render() {
    const children = this.props.children

    const child:any = React.Children.only(children);

    const events = {
      onPointerDown: this._handlePointerDown,
      onPointerMove: this._handlePointerMove,
      onPointerUp: this._handlePointerUp,
      onPointerLeave: this._handlePointerLeave,
      onPointerOut: this._handlePointerOut,
      onPointerCancel: this._handlePointerCancel,
    };

    return React.cloneElement(child, {
      ...events,
      style: {
        ...(child.props.style || {}),
      },
    })
  }

}

export default Gesture

