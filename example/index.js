var context = Waver.createAudioContext();

function startup(source, sound) {
  sound.start();

  var waver = Waver.createWaver(context, source);

  waver.bindOutput('oTarget', context.destination);
  waver.bindInput('iSound', sound);
  waver.enabled = true;

  setInterval(function() {
    if (!waver.valid) {
      return;
    }

    var panning = Math.sin(Math.PI * 0.5 * Date.now() * 0.001) * 0.65;
    var volume = ((Date.now() * 0.001) % 1.35) / 1.35;

    waver.setParam('pPanning', panning);
    waver.setParam('pVolume', volume);
  }, 10);
}

Promise.all([
  fetchText('./test.wv'),
  fetchBuffer('./test.mp3')
    .then(function(buffer) {
      return context.decodeAudioData(buffer);
    })
    .then(function(data) {
      var sound = context.createBufferSource();

      sound.buffer = data;
      return sound;
    })
])
  .then(function(assets) {
    startup(assets[0], assets[1]);
  });
