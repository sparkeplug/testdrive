import "./GuitarAmp.scss";

import React, { Component } from "react";

export class GuitarAmp extends Component {
  state: any;
  context: AudioContext;
  analyserNode: AnalyserNode;
  gainNode: GainNode;
  bassEq: BiquadFilterNode;
  midEq: BiquadFilterNode;
  trebleEq: BiquadFilterNode;
  visualizer: any;
  constructor(props: any) {
    super(props);
    this.state = this.getInitialState();
    this.visualizer = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.generateHTMLRangeFields = this.generateHTMLRangeFields.bind(this);
    this.initAmplifier = this.initAmplifier.bind(this);
    this.getGuitar = this.getGuitar.bind(this);
    this.startAmplifier = this.startAmplifier.bind(this);
    this.drawVisualizer = this.drawVisualizer.bind(this);
    this.resize = this.resize.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }
  componentDidMount() {
    console.log(this.visualizer);
  }
  getInitialState() {
    return {
      volume: {
        value: 5,
        name: "volume",
        min: 0,
        max: 10,
        callback: () => {
          this.gainNode.gain.setTargetAtTime(
            this.state.volume.value,
            this.gainNode.context.currentTime,
            0.01
          );
        },
      },
      bass: {
        value: 0,
        name: "bass",
        min: -10,
        max: 10,
        callback: () => {
          this.bassEq.gain.setTargetAtTime(
            this.state.bass.value,
            this.bassEq.context.currentTime,
            0.01
          );
        },
      },
      mid: {
        value: 0,
        name: "mid",
        min: -10,
        max: 10,
        callback: () => {
          this.gainNode.gain.setTargetAtTime(
            this.state.mid.value,
            this.gainNode.context.currentTime,
            0.01
          );
        },
      },
      treble: {
        value: 0,
        name: "treble",
        min: -10,
        max: 10,
        callback: () => {
          this.gainNode.gain.setTargetAtTime(
            this.state.treble.value,
            this.gainNode.context.currentTime,
            0.01
          );
        },
      },
    };
  }

  startAmplifier() {
    this.initAmplifier();
    this.setupContext();
    this.resize();
    this.drawVisualizer();
  }

  async initAmplifier() {
    this.context = await new AudioContext();
    this.analyserNode = new AnalyserNode(this.context, { fftSize: 256 });
    this.gainNode = new GainNode(this.context, {
      gain: this.state.volume.value,
    });
    this.bassEq = new BiquadFilterNode(this.context, {
      type: "lowshelf",
      frequency: 500,
      gain: this.state.bass.value,
    });
    this.midEq = new BiquadFilterNode(this.context, {
      type: "peaking",
      Q: Math.SQRT1_2,
      frequency: 1500,
      gain: this.state.mid.value,
    });
    this.trebleEq = new BiquadFilterNode(this.context, {
      type: "highshelf",
      frequency: 3000,
      gain: this.state.treble.value,
    });
  }

  async setupContext() {
    debugger;
    const guitar = await this.getGuitar();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    const source = this.context.createMediaStreamSource(guitar);
    source
      .connect(this.bassEq)
      .connect(this.midEq)
      .connect(this.trebleEq)
      .connect(this.gainNode)
      .connect(this.analyserNode)
      .connect(this.context.destination);
  }

  getGuitar() {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
        latency: 2.5,
      },
    });
  }

  drawVisualizer() {
    requestAnimationFrame(this.drawVisualizer);
    if (this.analyserNode) {
      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyserNode.getByteFrequencyData(dataArray);
      const width = this.visualizer.current.width;
      const height = this.visualizer.current.height;
      const barWidth = width / bufferLength;

      const canvasContext = this.visualizer.current.getContext("2d");
      canvasContext.clearRect(0, 0, width, height);

      dataArray.forEach((item, index) => {
        const y = ((item / 255) * height) / 2;
        const x = barWidth * index;

        canvasContext.fillStyle = `hsl(${(y / height) * 200},100%,50%)`;
        canvasContext.fillRect(x, height - y, barWidth, y);
      });
    }
  }

  resize() {
    this.visualizer.current.width =
      this.visualizer.current.clientWidth * window.devicePixelRatio;
    this.visualizer.current.height =
      this.visualizer.current.clientHeight * window.devicePixelRatio;
  }

  setupEventListeners() {
    window.addEventListener("resize", this.resize);
  }

  generateHTMLRangeFields() {
    return Object.keys(this.state).map((key: string, index: number) => {
      return (
        <span key={index}>
          <label htmlFor={key}>{key}</label>
          <input
            type="range"
            min={this.state[key]["min"]}
            max={this.state[key]["max"]}
            step=".01"
            value={this.state[key]["value"]}
            onChange={(event) => {
              this.handleChange(event, key);
            }}
            name={key}
            id={key}
          />
        </span>
      );
    });
  }
  handleChange(event: any, key: string) {
    const state = { ...this.state };
    state[key]["value"] =
      key === "volume"
        ? parseFloat(event.target.value)
        : parseInt(event.target.value);
    this.setState(state);
    this.state[key]["callback"]();
  }

  render() {
    return (
      <div>
        <canvas id="visualizer" ref={this.visualizer}></canvas>
        <div className="grid">{this.generateHTMLRangeFields()}</div>
        <button
          className="start"
          type="button"
          onClick={(e) => {
            this.startAmplifier();
          }}
        >
          Start
        </button>
      </div>
    );
  }
}

export default GuitarAmp;
