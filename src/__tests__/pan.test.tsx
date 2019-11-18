import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent } from '../gtypes';
import {configure, mount, ReactWrapper, HTMLAttributes} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';

/* Configure enzyme to work with react 16. This is necessary for debugger.*/
configure({ adapter: new Adapter() });

/**
 * Position of pointer in test diagram.
 */
type PanTestDiagramState = {
  tx: number
  ty: number
}

/**
 * A React component that models an SVG diagram that reacts to pointer gestures.
 * The pan tests use this component with enzyme to test pan gestures.
 */
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
    this.panCancel = this.panCancel.bind(this)

  }

  /**
   * Invoked by a pan gesture. Updates the position of the pointer.
   * 
   * @param e gesture event
   */
  pan(e: GestureEvent): void {       
    const tx = this.state.tx + e.delta!.dx
    const ty = this.state.ty + e.delta!.dy
    this.setState({...this.state, tx, ty})
  }

  panStart(_e: GestureEvent): void {}
  panMove(_e: GestureEvent): void {}
  panEnd(_e: GestureEvent): void {}
  panCancel(_e: GestureEvent): void {}

  /** 
   * Returns a Gesture component that wraps the test diagram, thereby
   * enabling the test diagram component to react to pointer gestures.
  */
  render() {
    return (
      <Gesture
        onPan={this.pan}
        onPanStart={this.panStart}
        onPanMove={this.panMove}
        onPanEnd={this.panEnd}
        onPanCancel={this.panCancel}
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

/* Defines enzyme wrapper for diagram component */
interface DiagramWrapper extends ReactWrapper<Object, PanTestDiagramState, PanTestDiagram> {}

/* Defines enzyme wrapper around a DOM node */
interface NodeWrapper extends ReactWrapper<HTMLAttributes, any, React.Component<{}, {}, any>> {}

type Vector = {
  length: number,
  angle: number
}

type PanResult = {
  tx: number,
  ty: number
}

/**
 * Simulate dragging a diagram element. This method moves the pointer 10 times
 * by the amount specified by a displacement vector.
 * 
 * @param wElem Enzyme wrapper around diagram element to be dragged
 * @param v Move displacement vector
 * @param cancel Cancel the drag operation
 */
const simulatePan = (wElem: NodeWrapper, v: Vector, cancel?: boolean): PanResult => {
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

  if (cancel === undefined || cancel === false) {
    wElem.simulate('pointerup', {clientX: x, clientY: y})
  } else {
    wElem.simulate('pointercancel', {clientX: x, clientY: y})
  }

  return {tx, ty}

}

describe('Test pan gestures', () => {

  let wDiagram: DiagramWrapper
  let wCircle: NodeWrapper


  beforeEach(() => {
    wDiagram = mount(<PanTestDiagram />)
    expect(wDiagram).toBeDefined()
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toEqual(0)
    expect(state.ty).toEqual(0)
    const nodes:NodeWrapper = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    wCircle= nodes.at(0)
  })


  test('test pan down', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/2})
    const state = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2) 
  })

  test('test pan up', () => {
    const r = simulatePan(wCircle, {length: 10, angle: -Math.PI/2})
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan right', () => {
    const r = simulatePan(wCircle, {length: 10, angle: 0})
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan left', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI})
    const state:PanTestDiagramState= wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test pan diagonal', () => {
    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    const state:PanTestDiagramState = wDiagram.state()
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

    const wDiagram:DiagramWrapper = mount(<PanTestDiagram />)
    const nodes:NodeWrapper = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle:NodeWrapper = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(1);
    const state:PanTestDiagramState = wDiagram.state() as PanTestDiagramState
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test panMove event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panMove'] = spy

    const wDiagram:DiagramWrapper = mount(<PanTestDiagram />)
    const nodes:NodeWrapper = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle:NodeWrapper = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(9);
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test panEnd event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panEnd'] = spy

    const wDiagram:DiagramWrapper = mount(<PanTestDiagram />)
    const nodes:NodeWrapper = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle:NodeWrapper = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4})
    expect(spy).toHaveBeenCalledTimes(1);
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

  test('test panCancel event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    PanTestDiagram.prototype['panCancel'] = spy

    const wDiagram:DiagramWrapper = mount(<PanTestDiagram />)
    const nodes:NodeWrapper = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle:NodeWrapper = nodes.at(0)

    const r = simulatePan(wCircle, {length: 10, angle: Math.PI/4}, true)
    expect(spy).toHaveBeenCalledTimes(1);
    const state:PanTestDiagramState = wDiagram.state()
    expect(state.tx).toBeCloseTo(r.tx, 2)
    expect(state.ty).toBeCloseTo(r.ty, 2)  
  })

})
