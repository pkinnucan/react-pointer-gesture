import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent } from '../gtypes';
import {configure, mount} from 'enzyme'
import * as lolex from 'lolex'

import Adapter from 'enzyme-adapter-react-16';


configure({ adapter: new Adapter() });

let clock : lolex.NodeClock

type SwipeTestDiagramState = {
  tx: number
  ty: number
}

class SwipeTestDiagram extends React.Component<Object, SwipeTestDiagramState> {

  constructor(props: Object) {
    super(props)
    this.state = {
      tx: 0,
      ty: 0,
    }

    this.swipe = this.swipe.bind(this)
    this.swipeLeft = this.swipeLeft.bind(this)
    this.swipeRight = this.swipeRight.bind(this)
    this.swipeUp = this.swipeUp.bind(this)
    this.swipeDown = this.swipeDown.bind(this)
    this.swipeCancel = this.swipeCancel.bind(this)

  }

  swipe(e: GestureEvent): void {       
    const tx = this.state.tx + e.delta!.dx
    const ty = this.state.ty + e.delta!.dy
    this.setState({...this.state, tx, ty})
  }
  
  swipeLeft(_e: GestureEvent): void {}
  swipeRight(_e: GestureEvent): void {}
  swipeUp(_e: GestureEvent): void {}
  swipeDown(_e: GestureEvent): void {}
  swipeCancel(_e: GestureEvent): void {}


  render() {
    return (
      <Gesture
        onSwipe={this.swipe}
        onSwipeLeft={this.swipeLeft}
        onSwipeRight={this.swipeRight}
        onSwipeUp={this.swipeUp}
        onSwipeDown={this.swipeDown}
        onSwipeCancel={this.swipeCancel}
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
  velocity: number
}

type SwipeResult = {
  tx: number,
  ty: number
}

const simulateSwipe = (wElem: any, v: Vector, cancel?: boolean): SwipeResult => {
  const nMoveEvents = 10 // Number of move events
  const ds = v.length/nMoveEvents // length per move event in pixels
  const dx = ds * Math.cos(v.angle) // Distance in pixels moved horizontally per move event
  const dy = ds * Math.sin(v.angle)  // Distance in pixels moved vertically per move event
  let x = 20;
  let y = 20;
  let tx = 0;
  let ty = 0;
  const moveIntervalPerPixel = 1/v.velocity;
  const moveInterval = ds * moveIntervalPerPixel // Time required to move ds pixels

  wElem.simulate('pointerdown', {clientX: x, clientY: y}) 

  // const startTime = Date.now();

  for (let i = 0; i < 10; ++i) {
    x = x + dx
    y = y + dy
    tx = tx + dx
    ty = ty + dy
    setTimeout(() => {wElem.simulate('pointermove', {clientX: x, clientY: y})}, moveInterval);
    // jest.advanceTimersByTime(moveInterval);
    clock.tick(moveInterval)
  }

  // const endTime = Date.now() - startTime
  // console.log(`Time required to move ${v.length} pixels: ${endTime} milliseconds`)
  // console.log(`Move event interval: ${moveInterval}`)

  if (cancel === undefined || cancel === false) {
    wElem.simulate('pointerup', {clientX: x, clientY: y})
  } else {
    wElem.simulate('pointercancel', {clientX: x, clientY: y})
  }

  return {tx, ty}

}


describe('Test swipe events', () => {

  beforeEach(() => {
    // jest.useFakeTimers();
    clock = lolex.install()
  })

  afterEach(() => {
    clock.reset()
  })

  test('test fast left swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeLeft'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test slow long left swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeLeft'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 12, angle: Math.PI, velocity: .25})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test fast right swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeRight'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: 0, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test fast up swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeUp'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: -Math.PI/2, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test fast down swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeDown'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI/2, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test fast swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipe'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI/2, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test slow, short swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipe'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI/2, velocity: .25})
    expect(spy).toHaveBeenCalledTimes(0);  
  })

  test('test 45 degree swipe', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipe'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI/4, velocity: 1})
    expect(spy).toHaveBeenCalledTimes(0);  
  })

  test('test swipeCancel event triggered', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    SwipeTestDiagram.prototype['swipeCancel'] = spy

    const wDiagram = mount(<SwipeTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateSwipe(wCircle, {length: 6, angle: Math.PI, velocity: 1}, true)
    expect(spy).toHaveBeenCalledTimes(1);

  })

  





})
