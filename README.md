# waver-js - JavaScript "shaders" for audio

Contents:
1. [Install](#install)
0. [Usage](#usage)
0. [API](#api)
0. [Language rules](#language-rules)

## __Install:__
```bash
npm install waver-js --save
```

## __Usage:__

test.wv:
```text
output destination oTarget;

input buffer iSound;

node pan nPan;
node gain nGain;

param float pRange;

iSound => nPan => nGain => oTarget;

nPan.pan {
  Math.sin(Math.PI * 0.5 * Date.now() * 0.001) * this.pRange
}

nGain.gain {
  ((Date.now() * 0.001) % 1.35) / 1.35
}
```

index.js:
```javascript
import { createWaver, createAudioContext } from 'waver-js';

const context = createAudioContext();
const sound = document.getElementById("sound");

function startup(source) {
  sound.play();

  const waver = createWaver(context, source);
  const soundSource = context.createMediaElementSource(sound);

  waver.bindOutput('oTarget', context.destination);
  waver.bindInput('iSound', soundSource);
  waver.setParam('pRange', 0.65);
  waver.enabled = true;
}

fetch('./test.wv')
  .then(response => response.text())
  .then(source => startup(source));
```

## API

__`Waver.createAudioContext()`__
- return: `AudioContext` instance;

Creates instance of AudioContext.

------

__`Waver.createWaver()`__
- return: `Waver` instance;

Creates instance od Waver.

------

__`Waver(context, source)`__
- context: AudioContext instance;
- source: string with waver program code;

Waver class constructor. It compile `source` program or throw an error on failure.

------

__`Waver.dispose()`__

Release resources of this instance.

------

__`Waver.bindOutput(id, value)`__
- id: string with output id;
- value: AudioNode instance used as output.

Binds given AudioNode as output.

------

__`Waver.bindInput(id, value)`__
- id: string with input id;
- value: AudioNode instance used as input.

Binds given AudioNode as input.

------

__`Waver.setParam(id, value)`__
- id: string with param id;
- value: parameter value.

Apply given value to waver parameter.

------

__`get Waver.valid`__
- value: boolean;

It tells if this waver is valid (it's properly compiled)

------

__`get Waver.outputs`__
- value: array[string];

It tells what outputs are used by this waver.

------

__`get Waver.inputs`__
- value: array[string];

It tells what inputs are used by this waver.

------

__`get Waver.params`__
- value: array[string];

It tells what params are used by this waver.

------

__`get Waver.nodes`__
- value: array[string];

It tells what nodes are used by this waver.

------

__`get/set Waver.enabled`__
- value: boolean;

Tell or change it's enabled state (if this waver is able to process).

## Language Rules

There are 3 types of operations:
- Node/param declarations;
- Connection chains;
- Nodes setup/update;

### Node/param declaration

There are 4 declaration modes:
- `output` - Tells about output node;
- `input` - Tells about input node;
- `node` - Tells about internal processing node;
- `param` - Tells about manipulation parameter;

__Example__
```text
output destination oTarget;
input buffer iSound;
node gain nGain;
param float pVolume;
```

__`output`__ (`output <type> <name>;`)
_It's used as last node in connection chain._
type: available types and their WebAudio API mappings:
- `destination`: [AudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode)
- `stream`: [MediaStreamAudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode)

__`input`__ (`input <type> <name>;`)
_It's used as first node in connection chain._
type: available types and their WebAudio API mappings:
- `buffer`: [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)
- `constant`: [ConstantSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/ConstantSourceNode)
- `media`: [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode)
- `MediaStreamAudioSourceNode`: [ConstantSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode)

__`node`__ (`node <type> <name> [(<param>)];`)
_It's used as intermediate node in connection chain._
_You can set initialization parameter in parenthesis after it's name._
type: available types and their WebAudio API mappings:
- `biquadFilter`: [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode) - Initialization parameter is a type name (`node biquadFilter nFilter(highpass);`)
- `delay`: [DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode) - Initialization parameter is a delay value in seconds (`node delay nDelay(0.5);`)
- `compressor`: [DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode)
- `gain`: [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) - Initialization parameter is a gain value in factor units (`node gain nGain(0.5);`)
- `oscillator`: [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) - Initialization parameter is a type name (`node oscillator nOscillator(sine);`)
- `pan`: [StereoPannerNode](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode) - Initialization parameter is a pan value in [-1; 1] space (`node pan nPan(-1);`)

__`param`__ (`param <type> <name>;`)
_It's used as node manipulation parameter as a way to control nodes from outside of waver._
_You can set initialization parameter in parenthesis after it's name._
type: available types and their JavaScript mappings:
- `float`: number

### Connection chain

Nodes are connected in chains where all node names are separated by arrow (`=>` ).

__Example__
```text
iSound => nGain => nPan => oTarget;
```

### Node setup/update

Here you assign expression to node properties (a-rate AudioParam or node property) or declare JavaScript lambda to update it.
When use lambda, you can access params by `this` context (`nPan { this.pPanning }`).

__Example__
```text
nPan.pan = pPanning;
nGain.gain = 0.5;
nPan2.pan {
  Math.sin(Math.PI * 0.5 * Date.now() * 0.001) * this.pRange
}
```
