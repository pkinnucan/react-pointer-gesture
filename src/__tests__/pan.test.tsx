import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent } from '../gtypes';
import {configure, mount} from 'enzyme'

import Adapter from 'enzyme-adapter-react-16';


configure({ adapter: new Adapter() });

type PanTestDiagramState = {
  tx: number
  ty: number
}

class PanTestDiagram extends React.Component<Object, PanTestDiagramState> {

  constructor(props: Object) {
    super(props)
    this.state = {
      tx: 0,
      ty: 0,
    }

    this.pan = this.pan.bind(this)
    this.panStart = this.panStart.bind(this)
    this.panMove = this.panMove.bind(this)
    this.panEnd = this.panEnd.bind(this)

  }

  pan(e: GestureEvent): void {       
    const tx = this.state.tx + e.delta!.dx
    const ty = this.state.ty + e.delta!.dy
    this.setState({...this.state, tx, ty})
  }

  panStart(_e: GestureEvent): void {}
  panMove(_e: GestureEvent): void {}
  panEnd(_e: GestureEvent): void {}


  render() {
    return (
      <Gesture
        onPan={this.pan}
        onPanStart={this.panStart}
        onPanMove={this.panMove}
        onPanEnd={this.panEnd}
      >
        <svg viewBox="0, 0, 500, 500" style={{ touchAction: "none" }}>
          <g id="g"
            style={{ transform: `translate(${this.state.tx}px, ${this.state.ty}px)` }}
          >
            <circle id="circle" cx="50" cy="50" r="40" stroke="green" strokeWidth="4"
              fill="red" key="circle" />
          </g>
        </svg>
      </Gesture>
    )
  }
}

type Vector = {
  length: number,
  angle: number
}

type PanResult = {
  tx: number,
  ty: number
}

const simulatePan = (wElem: any, v: Vector): PanResult => {
  const ds = v.length/10;
  const dx = ds * Math.cos(v.angle)
  const dy = ds * Math.sin(v.angle)
  let x = 20;
  let y = 20;
  let tx = 0;
  let ty = 0;

  wElem.simulate('pointerdown', {clientX: x, clientY: y}) 
  for (let i = 0; i < 10; ++i) {
    x = x + dx
    y = y + dy
    tx = tx + dx
    ty = ty + dy
    wElem.simulate('pointermove', {clientX: x, clientY: y})
  }
  wElem.simulate('pointerup', {clientX: x, clientY: y})

  return {tx, ty}

}

describe('Test pan gestures', () => {

  let wDiagram: any
  let wCircle: any


  beforeEach(() => {
    wDiagram = mount(<PanTestDiagram />)
    expect(wDiagram).toBeDefined()
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toEqual(0)
    expect(state.ty).toEqual(0)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    wCircle = nodes.at(0)
  })


  test('test pan down', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/2})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2) 
  })

  test('test pan up', () => {
    const r = simulatePan(wCircle, {length: 10, angle: -Math.PI/2})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan right', () => {
    const r = simulatePan(wCircle, {length: 10, angle: 0})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan left', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan diagonal', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

})

describe('Test pan events', () => {

  test('test panStart event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panStart'] = spy

    const wDiagram = mount(<PanTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(1);
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test panMove event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panMove'] = spy

    const wDiagram = mount(<PanTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(9);
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test panEnd event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panEnd'] = spy

    const wDiagram = mount(<PanTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(1);
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })


})
