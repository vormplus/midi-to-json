# midi-to-json

A small tool to create files to make the process of syncing animation to audio a bit easier. 

### midi_to_json

A Processing sketch that converts MIDI files into JSON. This JSON format will make it easier to sync animations to audio.

The JSON format looks like this:

	{
	  "PPQN": 96,
	  "messages": [
		{
		  "octave": 2,
		  "noteName": "C2",
		  "tick": 0,
		  "velocity": 100,
		  "noteNumber": 36,
		  "timestamp": 0
		},
		{
		  "octave": 3,
		  "noteName": "D#3",
		  "tick": 0,
		  "velocity": 103,
		  "noteNumber": 51,
		  "timestamp": 0
		},
		{
		  "octave": 2,
		  "noteName": "C2",
		  "tick": 96,
		  "velocity": 101,
		  "noteNumber": 36,
		  "timestamp": 455
		},
		{
		  ...
		}
	  ],
	  "BPM": 132
	}

### ableton_live_set

The Ableton Live project that was used to create the MIDI and audio files used in this small project. The project uses the standard TR-808 drum rack. There are three different clips with drum patterns. The arrangement has been consolidated into a new clip.

### babylonjs_music_video

This folder contains a small WebGL Music Video created with BabylonJS. The converted MIDI is used to sync some basic animations to the audio that is playing in the background. You’ll need to run a web server in this directory for everything to work. Open a terminal, navigate to this directory, and run `python -m SimpleHTTPServer` to start a basic web server. Point your browser to http://0.0.0.0:8000/ to see the result.