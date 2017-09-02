# waver-js
## JavaScript "shaders" for audio

__Install:__
```bash
npm install waver-js --save
```

__Usage:__

test.wv:
```text
output destination oTarget;

input media iSound;

node pan nPan;
node gain nGain;

param float pPanning;
param float pVolume(1);

iSound => nPan => nGain => oTarget;

nPan.pan = pPanning;
nGain.gain = pVolume;
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
  waver.enabled = true;

  setInterval(() => {
    if (!waver.valid) {
      return;
    }

    const panning = Math.sin(Math.PI * 0.5 * Date.now() * 0.001) * 0.65;
    const volume = ((Date.now() * 0.001) % 1.35) / 1.35;

    waver.setParam('pPanning', panning);
    waver.setParam('pVolume', volume);
  }, 10);
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
