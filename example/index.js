var context = Waver.createAudioContext();

function startup(source, sound) {
  sound.start();

  var waver = Waver.createWaver(context, source);

  waver.bindOutput('oTarget', context.destination);
  waver.bindInput('iSound', sound);
  waver.setParam('pRange', 0.65);
  waver.enabled = true;
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
