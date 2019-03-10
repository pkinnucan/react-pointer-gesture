import Recognizer from './Recognizer'
import PanRecognizer from './PanRecognizer';
import PinchRecognizer from './PinchRecognizer'
import RotateRecognizer from './RotateRecognizer'
import SwipeRecognizer from './SwipeRecognizer'
import TapRecognizer from './TapRecognizer'
import { GenericGestureType } from '../gtypes'

type RecognizerMap = Map<GenericGestureType, Recognizer>

class RecognizerRegistry {

  recognizerMap: RecognizerMap = new Map()

  constructor() {
    this.recognizerMap.set(GenericGestureType.Pan, new PanRecognizer())
    this.recognizerMap.set(GenericGestureType.Pinch, new PinchRecognizer())
    this.recognizerMap.set(GenericGestureType.Rotate, new RotateRecognizer())
    this.recognizerMap.set(GenericGestureType.Swipe, new SwipeRecognizer())
    this.recognizerMap.set(GenericGestureType.Tap, new TapRecognizer())
  }

  getRecognizer(type: GenericGestureType): Recognizer | undefined {
    return this.recognizerMap.get(type)
  }

}

const recognizerRegistry = new RecognizerRegistry

export default recognizerRegistry