import parser from './parser';

export {
  parser
};

const audioContext = window.AudioContext || window.webkitAudioContext;

function mapOutputType(type) {
  if (type === 'destination') {
    return AudioDestinationNode;
  } else if (type === 'stream') {
    return MediaStreamAudioDestinationNode;
  } else if (type === 'audio') {
    return AudioNode;
  }

  return null;
}

function mapInputType(type) {
  if (type === 'buffer') {
    return AudioBufferSourceNode;
  } else if (type === 'constant') {
    return ConstantSourceNode;
  } else if (type === 'media') {
    return MediaElementAudioSourceNode;
  } else if (type === 'stream') {
    return MediaStreamAudioSourceNode;
  } else if (type === 'audio') {
    return AudioNode;
  }

  return null;
}

function createNode(context, type) {
  const [ name, param ] = type;

  if (name === 'biquadFilter') {
    const result = context.createBiquadFilter();
    if (param !== null) {
      result.type = param;
    }
    return result;
  } else if (name === 'delay') {
    return context.createDelay(param);
  } else if (name === 'compressor') {
    return context.createDynamicsCompressor();
  } else if (name === 'gain') {
    const result = context.createGain();
    if (param !== null) {
      result.gain.value = param;
    }
    return result;
  } else if (name === 'oscillator') {
    const result = context.createOscillator();
    if (param !== null) {
      result.type = param;
    }
    return result;
  } else if (name === 'pan') {
    const result = context.createStereoPanner();
    if (param !== null) {
      result.pan.value = param;
    }
    return result;
  }

  return null;
}

export function createAudioContext() {
  return new audioContext();
}

export function createWaver(...args) {
  return new Waver(...args);
}

export default class Waver {

  get valid() {
    return !!this._valid;
  }

  get outputs() {
    return [ ...this._output.keys() ];
  }

  get inputs() {
    return [ ...this._input.keys() ];
  }

  get params() {
    return [ ...this._param.keys() ];
  }

  get nodes() {
    return [ ...this._node.keys() ];
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }
    if (!this._valid) {
      throw new Error('Waver is not valid!');
    }

    this._enabled = value;
    cancelAnimationFrame(this._request);
    if (value) {
      this._process();
    }
  }

  constructor(context, source) {
    if (!(context instanceof audioContext)) {
      throw new Error('`context` is not type of AudioContext!');
    }
    if (typeof source !== 'string') {
      throw new Error('`source` is not type of String!');
    }

    const compiled = parser.parse(source);

    this._context = context;
    this._outputTypes = new Map();
    this._inputTypes = new Map();
    this._paramTypes = new Map();
    this._output = new Map();
    this._input = new Map();
    this._node = new Map();
    this._param = new Map();
    this._chain = [];
    this._setup = [];
    this._enabled = false;
    this._request = 0;

    this._outputTypes.set('wv_audioDestination', AudioDestinationNode);
    this._output.set('wv_audioDestination', context.destination);

    for (const key in compiled.outputTypes) {
      const name = compiled.outputTypes[key];
      const type = mapOutputType(name);
      if (!type) {
        throw new Error(`Unsupported output type: ${name}`);
      }

      this._outputTypes.set(key, type);
      this._output.set(key, null);
    }

    for (const key in compiled.inputTypes) {
      const name = compiled.inputTypes[key];
      const type = mapInputType(name);
      if (!type) {
        throw new Error(`Unsupported input type: ${name}`);
      }

      this._inputTypes.set(key, type);
      this._input.set(key, null);
    }

    for (const key in compiled.nodeTypes) {
      const name = compiled.nodeTypes[key];
      const node = createNode(context, name);
      if (!node) {
        throw new Error(`Unsupported node type: ${name}`);
      }

      this._node.set(key, node);
    }

    for (const key in compiled.paramTypes) {
      const [ type, value ] = compiled.paramTypes[key];
      if (type === 'float') {
        this._paramTypes.set(key, 'number');
        this._param.set(key, value || 0);
      } else {
        throw new Error(`Unsupported param type: ${type}`);
      }
    }

    for (const item of compiled.chains) {
      for (let i = 0, c = item.length - 1; i < c; ++i) {
        this._chain.push({
          from: item[i],
          to: item[i + 1]
        });
      }
    }

    for (const item of compiled.setup) {
      this._setup.push({
        node: item[0],
        param: item[1],
        value: item[2]
      });
    }

    this._valid = true;
  }

  dispose() {
    this.enabled = false;

    if (this._valid) {
      this._disconnect();
    }

    this._context = null;
    this._outputTypes = null;
    this._inputTypes = null;
    this._paramTypes = null;
    this._output = null;
    this._input = null;
    this._node = null;
    this._param = null;
    this._chain = null;
    this._setup = null;
    this._valid = false;
  }

  bindOutput(id, value) {
    if (!this._valid) {
      throw new Error('Waver is not valid!');
    }
    if (typeof id !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const { _outputTypes } = this;
    if (!_outputTypes.has(id)) {
      throw new Error(`Waver does not have output named: ${id}`);
    }
    if (!!value && !(value instanceof _outputTypes.get(id))) {
      throw new Error(
        `\`value\` is not type of ${_outputTypes.get(id).constructor.name}!`
      );
    }

    this._disconnect();
    this._output.set(id, value);
    this._connect();
  }

  bindInput(id, value) {
    if (!this._valid) {
      throw new Error('Waver is not valid!');
    }
    if (typeof id !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const { _inputTypes } = this;
    if (!_inputTypes.has(id)) {
      throw new Error(`Waver does not have input named: ${id}`);
    }
    if (!!value && !(value instanceof _inputTypes.get(id))) {
      throw new Error(
        `\`value\` is not type of ${_inputTypes.get(id).prototype.constructor.name}!`
      );
    }

    this._disconnect();
    this._input.set(id, value);
    this._connect();
  }

  setParam(id, value) {
    if (!this._valid) {
      throw new Error('Waver is not valid!');
    }
    if (typeof id !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const { _paramTypes } = this;
    if (!_paramTypes.has(id)) {
      throw new Error(`Waver does not have param named: ${id}`);
    }
    if (typeof value !== _paramTypes.get(id)) {
      throw new Error(
        `\`value\` is not type of ${_paramTypes.get(id)}!`
      );
    }

    this._param.set(id, value);
  }

  _process() {
    if (!this._valid) {
      throw new Error('Waver is not valid!');
    }

    const { _setup, _param } = this;
    for (const item of _setup) {
      const { node, param, value } = item;
      const n = this._findNode(node);
      if (!n || !(param in n)) {
        continue;
      }

      const v = this._getValue(value);
      if ('value' in n[param]) {
        n[param].value = v;
      } else {
        n[param] = v;
      }
    }

    this._request = requestAnimationFrame(() => this._process());
  }

  _findNode(id) {
    const { _output, _input, _node } = this;

    if (_output.has(id)) {
      return _output.get(id);
    } else if (_input.has(id)) {
      return _input.get(id);
    } else if (_node.has(id)) {
      return _node.get(id);
    }

    return null;
  }

  _getValue(value) {
    const { _param } = this;

    if (typeof value === 'string') {
      if (!_param.has(value)) {
        throw new Error(`Waver does not have param: ${value}`);
      }

      return _param.get(value);
    } else if (value instanceof Function) {
      const params = {};

      for (const [k, v] of _param) {
        params[k] = v;
      }

      return value.call(params);
    }

    return value;
  }

  _connect() {
    const { _chain } = this;

    for (const item of _chain) {
      const from = this._findNode(item.from);
      const to = this._findNode(item.to);

      if (!from || !to) {
        continue;
      }

      from.connect(to);
    }
  }

  _disconnect() {
    const { _chain } = this;

    for (const item of _chain) {
      const from = this._findNode(item.from);
      const to = this._findNode(item.to);

      if (!from || !to) {
        continue;
      }

      try {
        from.disconnect(to);
      } catch(e) {}
    }
  }

}
