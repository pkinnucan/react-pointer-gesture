import * as React from 'react'
import Gesture from '../Gesture'
import { GestureEvent } from '../gtypes';
import {configure, mount} from 'enzyme'
import * as lolex from 'lolex'

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

let clock : lolex.NodeClock

type TapTestDiagramState = {

}

class TapTestDiagram extends React.Component<Object, TapTestDiagramState> {

  constructor(props: Object) {
    super(props)
    this.state = {
    }

    this.tap = this.tap.bind(this)
    this.doubleTap = this.doubleTap.bind(this)

  }

  tap(_e: GestureEvent): void {}
  
  doubleTap(_e: GestureEvent): void {}

  render() {
    return (
      <Gesture
        onTap={this.tap}
        onDoubleTap={this.doubleTap}
      >
        <svg viewBox="0, 0, 500, 500" style={{ touchAction: "none" }}>
          <g id="g">
            <circle id="circle" cx="50" cy="50" r="40" stroke="green" strokeWidth="4"
              fill="red" key="circle" />
          </g>
        </svg>
      </Gesture>
    )
  }
}



const simulateTap = (wElem: any, tapDuration: number): void => {

  let x = 20;
  let y = 20;

  wElem.simulate('pointerdown', {clientX: x, clientY: y}) 
  clock.tick(tapDuration)
  wElem.simulate('pointerup', {clientX: x, clientY: y}) 

}


describe('Test tap events', () => {

  beforeEach(() => {
    // jest.useFakeTimers();
    clock = lolex.install()
  })

  afterEach(() => {
    clock.reset()
  })

  test('test single tap', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    TapTestDiagram.prototype['tap'] = spy

    const wDiagram = mount(<TapTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateTap(wCircle, 240)
    expect(spy).toHaveBeenCalledTimes(1);  
  })


  test('test slow single tap', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    TapTestDiagram.prototype['tap'] = spy

    const wDiagram = mount(<TapTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateTap(wCircle, 260)
    expect(spy).toHaveBeenCalledTimes(0);  
  })

  test('test double tap', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    TapTestDiagram.prototype['doubleTap'] = spy

    const wDiagram = mount(<TapTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateTap(wCircle, 240)
    clock.tick(200)
    simulateTap(wCircle, 240)
    expect(spy).toHaveBeenCalledTimes(1);  
  })

  test('test two taps', () => {
    
    // Lots of examples on the web of mocking  wrapper
    // instance methods but I could not get it to work.
    // Resorting to this workaround.
    const spy = jest.fn((_e: GestureEvent) => {})
    TapTestDiagram.prototype['doubleTap'] = spy

    const wDiagram = mount(<TapTestDiagram />)
    const nodes = wDiagram.find('#circle')
    expect(nodes).toHaveLength(1);
    const wCircle = nodes.at(0)

    simulateTap(wCircle, 240) 
    clock.tick(260)
    simulateTap(wCircle, 240)
    expect(spy).toHaveBeenCalledTimes(1);  
  })


})
