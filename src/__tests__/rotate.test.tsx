import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent, GestureType } from '../gtypes';
import {configure, mount} from 'enzyme'

import Adapter from 'enzyme-adapter-react-16';


configure({ adapter: new Adapter() });


type RotateTestDiagramState = {
  scale: number
}

class RotateTestDiagram extends React.Component<Object, RotateTestDiagramState> {

  constructor(props: Object) {
    super(props)
    this.state = {
      scale: 0
    }

    this.rotate = this.rotate.bind(this)
    this.rotateStart = this.rotateStart.bind(this)
    this.rotateEnd = this.rotateEnd.bind(this)
    this.rotateCancel = this.rotateCancel.bind(this)

  }

  rotate(e: GestureEvent): void {       
    const scale = e.scale!
    this.setState({...this.state, scale})
  }
  
  rotateStart(_e: GestureEvent): void {}
  rotateEnd(_e: GestureEvent): void {}
  rotateCancel(_e: GestureEvent): void {}

  render() {
    return (
      <Gesture
        onRotate={this.rotate}
        onRotateStart={this.rotateStart}
        onRotateEnd={this.rotateEnd}
        onRotateCancel={this.rotateCancel}
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


const simulateRotate = (wElem: any, startAngle: number, angle: number, cancel?: boolean): number => {

  let rotateCount = 10

  const da = angle/rotateCount // angle delta in radians
  const r = 5 // distance of pointers from center of rotation

  const xCtr = 100
  const yCtr = 100

  let xPtr1 = r * Math.cos(startAngle + Math.PI) + xCtr;
  let yPtr1 = r * Math.sin(startAngle + Math.PI) + yCtr;
  let xPtr2 = r * Math.cos(startAngle) + xCtr;
  let yPtr2 = r * Math.sin(startAngle) + yCtr;


  wElem.simulate('pointerdown', {pointerId: 0, clientX: xPtr1, clientY: yPtr1}) 
  wElem.simulate('pointerdown', {pointerId: 1, clientX: xPtr2, clientY: yPtr2}) 

  let curAngle = startAngle

  for (let i = 0; i < 10; i++) {
    curAngle = curAngle + da

    let xPtr1 = r * Math.cos(curAngle + Math.PI) + xCtr;
    let yPtr1 = r * Math.sin(curAngle + Math.PI) + yCtr;
    let xPtr2 = r * Math.cos(curAngle) + xCtr;
    let yPtr2 = r * Math.sin(curAngle) + yCtr;

    wElem.simulate('pointermove', { pointerId: 0, clientX: xPtr1, clientY: yPtr1 })
    wElem.simulate('pointermove', { pointerId: 1, clientX: xPtr2, clientY: yPtr2 })
  }

  if (cancel === undefined || cancel === false) {
    wElem.simulate('pointerup', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
    wElem.simulate('pointerup', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
  } else {
    wElem.simulate('pointercancel', {pointerId: 0, clientX: xPtr1, clientY: yPtr1})
    wElem.simulate('pointercancel', {pointerId: 1, clientX: xPtr2, clientY: yPtr2})
  }

  return rotateCount

}


describe('Test rotate events', () => {


  test('test rotate event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    RotateTestDiagram.prototype['rotate'] = spy

    const wDiagram = mount(<RotateTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const startAngle = 0
    const rotateCount = simulateRotate(wCircle, startAngle, Math.PI/4)
    expect(spy).toHaveBeenCalledTimes(rotateCount-1);  

    const da = Math.PI/4 / rotateCount
    for (let i = 1; i < rotateCount - 1; i++) {
      const event = spy.mock.results[i].value
      let angle = startAngle + da // rotation in radians
      angle = 180 / (Math.PI / angle) // convert to degrees
      expect(event.angle).toBeCloseTo(angle)
      expect(event.gestureType).toBe(GestureType.Rotate)
    }

  })

  test('test rotate start event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    RotateTestDiagram.prototype['rotateStart'] = spy

    const wDiagram = mount(<RotateTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateRotate(wCircle, 0, Math.PI/4)
    expect(spy).toHaveBeenCalledTimes(1);  

  })

  test('test rotate end event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    RotateTestDiagram.prototype['rotateEnd'] = spy

    const wDiagram = mount(<RotateTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateRotate(wCircle, 0,  Math.PI/4, false)
    expect(spy).toHaveBeenCalledTimes(1);  

  })

  test('test rotate cancel event', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((e: GestureEvent) => { return e})
    RotateTestDiagram.prototype['rotateCancel'] = spy

    const wDiagram = mount(<RotateTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateRotate(wCircle, 0, Math.PI/4, true)
    expect(spy).toHaveBeenCalledTimes(2);  

  })
 

})