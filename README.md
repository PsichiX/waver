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
