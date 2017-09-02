var context = Waver.createAudioContext();
var sound = document.getElementById("sound");

function startup(source) {
  sound.play();

  var waver = Waver.createWaver(context, source);
  var soundSource = context.createMediaElementSource(sound);

  waver.bindOutput('oTarget', context.destination);
  waver.bindInput('iSound', soundSource);
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

fetchText('./test.wv')
  .then(function(source) {
    startup(source);
  });
