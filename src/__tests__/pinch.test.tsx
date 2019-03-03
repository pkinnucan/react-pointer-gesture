import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent, GestureType } from '../gtypes';
import {configure, mount} from 'enzyme'

import Adapter from 'enzyme-adapter-react-16';


configure({ adapter: new Adapter() });


type PinchTestDiagramState = {
  scale: number
}

class PinchTestDiagram extends React.Component<Object, PinchTestDiagramState> {

  constructor(props: Object) {
    super(props)
    this.state = {
      scale: 0
    }

    this.pinch = this.pinch.bind(this)
    this.pinchOut = this.pinchOut.bind(this)
    this.pinchIn = this.pinchIn.bind(this)
    this.pinchStart = this.pinchStart.bind(this)
    this.pinchMove = this.pinchMove.bind(this)
    this.pinchEnd = this.pinchEnd.bind(this)
    this.pinchCancel = this.pinchCancel.bind(this)

  }

  pinch(e: GestureEvent): void {       
    const scale = e.scale!
    this.setState({...this.state, scale})
  }
  
  pinchOut(_e: GestureEvent): void {}
  pinchIn(_e: GestureEvent): void {}
  pinchStart(_e: GestureEvent): void {}
  pinchMove(_e: GestureEvent): void {}
  pinchEnd(_e: GestureEvent): void {}
  pinchCancel(_e: GestureEvent): void {}



  render() {
    return (
      <Gesture
        onPinch={this.pinch}
        onPinchOut={this.pinchOut}
        onPinchIn={this.pinchIn}
        onPinchStart={this.pinchStart}
        onPinchMove={this.pinchMove}
        onPinchEnd={this.pinchEnd}
        onPinchCancel={this.pinchCancel}
      >
        <svg viewBox="0, 0, 500, 500" style={{ touchAction: "none" }}>
          <g id="g"
            style={{ transform: `scale(${this.state.scale})` }}
          >
            <circle id="circle" cx="50" cy="50" r="40" stroke="green" strokeWidth="4"
              fill="red" key="circle" />
          </g>
        </svg>
      </Gesture>
    )
  }
}


const simulatePinch = (wElem: any, startDiff: number, endDiff: number, pinchAngle: number, pinchOut: boolean, cancel?: boolean): number => {

  let ds = 1  // length per pinch gesture in pixels

  let dx = ds * Math.cos(pinchAngle) // Distance in pixels moved horizontally per pinch event
  let dy = ds * Math.sin(pinchAngle)  // Distance in pixels moved vertically per pinch event

  if (pinchOut) {
    ds = -ds
    dx = -dx
    dy = -dy
  }

  let xPtr1 = 20;
  let yPtr1 = 20;
  let xPtr2 = xPtr1 + startDiff * Math.cos(pinchAngle)
  let yPtr2 = yPtr1 + startDiff * Math.sin(pinchAngle)

  wElem.simulate('pointerdown', {pointerId: 0, clientX: xPtr1, clientY: yPtr1}) 
  wElem.simulate('pointerdown', {pointerId: 1, clientX: xPtr2, clientY: yPtr2}) 

  let ptrDiff = startDiff
  let moveCount = 0

  if (pinchOut) {
    while (ptrDiff < endDiff) {
      ptrDiff = ptrDiff - ds
      xPtr1 = xPtr1 + dx
      yPtr1 = yPtr1 + dy
      xPtr2 = xPtr2 - dx
      yPtr2 = yPtr2 - dy
      wElem.simulate('pointermove', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
      wElem.simulate('pointermove', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
      moveCount = moveCount + 2
    }
  } else {
    while (ptrDiff > endDiff) {
      ptrDiff = ptrDiff - ds
      xPtr1 = xPtr1 + dx
      yPtr1 = yPtr1 + dy
      xPtr2 = xPtr2 - dx
      yPtr2 = yPtr2 - dy
      wElem.simulate('pointermove', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
      wElem.simulate('pointermove', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
      moveCount = moveCount + 2
    }

  }

  if (cancel === undefined || cancel === false) {
    wElem.simulate('pointerup', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
    wElem.simulate('pointerup', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
  } else {
    wElem.simulate('pointercancel', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
    wElem.simulate('pointercancel', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
  }

  return moveCount

}


describe('Test pinch events', () => {


  test('test pinch in event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    PinchTestDiagram.prototype['pinchIn'] = spy

    const wDiagram = mount(<PinchTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const moveCount = simulatePinch(wCircle, 10, 5, Math.PI/4, false)
    expect(spy).toHaveBeenCalledTimes(moveCount - 1);  

    for (let i = 1; i < moveCount - 1; i++) {
      const event = spy.mock.results[i].value
      expect(event.scale).toBeLessThan(1)
      expect(event.gestureType).toBe(GestureType.PinchIn)
    }

  })

  test('test pinch out event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => {return e})
    PinchTestDiagram.prototype['pinchOut'] = spy

    const wDiagram = mount(<PinchTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const moveCount = simulatePinch(wCircle, 5, 15, Math.PI/6, true)
    expect(spy).toHaveBeenCalledTimes(moveCount - 1);  

    for (let i = 1; i < moveCount - 1; i++) {
      const event = spy.mock.results[i].value
      expect(event.scale).toBeGreaterThan(1)
      expect(event.gestureType).toBe(GestureType.PinchOut)
    }

  })

  test('test pinch/pinchOut event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => {return e})
    PinchTestDiagram.prototype['pinch'] = spy

    const wDiagram = mount(<PinchTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const moveCount = simulatePinch(wCircle, 5, 15, Math.PI/2, true)
    expect(spy).toHaveBeenCalledTimes(moveCount - 1);
    
    for (let i = 1; i < moveCount - 1; i++) {
      const event = spy.mock.results[i].value
      expect(event.scale).toBeGreaterThan(1)
      expect(event.gestureType).toBe(GestureType.Pinch)
    }

  })

  test('test pinch/pinch in event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    PinchTestDiagram.prototype['pinch'] = spy

    const wDiagram = mount(<PinchTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const moveCount = simulatePinch(wCircle, 10, 5, Math.PI/4, false)
    expect(spy).toHaveBeenCalledTimes(moveCount - 1);  

    for (let i = 1; i < moveCount - 1; i++) {
      const event = spy.mock.results[i].value
      expect(event.scale).toBeLessThan(1)
      expect(event.gestureType).toBe(GestureType.Pinch)
    }

  })


 

})