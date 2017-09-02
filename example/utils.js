function fetchText(url) {
  return fetch(url)
    .then(function(response) {
      return response.text();
    });
}

function fetchBuffer(url) {
  return fetch(url)
    .then(function(response) {
      return response.arrayBuffer();
    });
}
