/**
 * MIDI to JSON converter
 * -------------------------------------------------------------------------
 * A Processing sketch that converts MIDI files to JSON so you can use the 
 * Note On MIDI events to trigger animations in sync with audio.
 * 
 * Some code that was very useful when creating this tool.
 * -------------------------------------------------------------------------
 * https://gist.github.com/indy/360540
 * https://stackoverflow.com/questions/3850688/reading-midi-files-in-java
 *
 **/

// Set this to the name of your MIDI file.
// Your file should be stored in the data directory of the Processing sketch.

String fileName = "midi-track.mid";

// Set this to the same tempo as your MIDI file. It will be used to calculate the
// number of milliseconds since the start of the track.

float tempo = 132;

// Pulses per quarter note (https://en.wikipedia.org/wiki/Pulses_per_quarter_note)
// I've exported my MIDI files from Ableton Live.

float ppqn = 96;



import javax.sound.midi.*;
import java.io.*;

int NOTE_ON = 0x90;
int NOTE_OFF = 0x80;
String[] NOTE_NAMES = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};

JSONObject output;


float millisecondsPerTick;

void setup()
{
    size( 200, 200 );
    background( #00ff00 );
    
    output = new JSONObject();
    
    output.setInt("BPM", int( tempo ) );
    output.setInt("PPQN", int( ppqn ) );
    
    millisecondsPerTick = 60000 / ( tempo * ppqn );
    
    JSONArray midiMessages = new JSONArray();
    
    File midiFile = new File( sketchPath() + "/data/" + fileName );

    try {
        
        // Uncomment sequencer.start(); to hear the MIDI file
        Sequencer sequencer = MidiSystem.getSequencer();
        sequencer.setSequence( MidiSystem.getSequence( midiFile ) );
        sequencer.open();
        // sequencer.start();

        Sequence sequence = MidiSystem.getSequence( midiFile );

        int trackNumber = 0;

        for (Track track : sequence.getTracks()) {

            trackNumber++;

            int messageCounter = 0;

            for ( int i = 0; i < track.size(); i++) {
                
                MidiEvent event = track.get( i );
                
                int timestamp = round( int( event.getTick() ) * millisecondsPerTick );
               
                MidiMessage message = event.getMessage();

                if ( message instanceof ShortMessage ) {
                    
                    ShortMessage sm = (ShortMessage) message;

                    if ( sm.getCommand() == NOTE_ON ) {

                        int noteNumber = sm.getData1();
                        int octave = ( noteNumber / 12 ) - 1;
                        int note = noteNumber % 12;
                        String noteName = NOTE_NAMES[ note ];
                        int velocity = sm.getData2();
                       
                        // Create a JSON object for each note-on message
                        // and store all values we need into the object
                        
                        JSONObject obj = new JSONObject();
                        obj.setInt( "tick", int( event.getTick() ) );
                        obj.setInt( "octave", octave );
                        obj.setString( "noteName", noteName + octave );
                        obj.setInt( "noteNumber", noteNumber );
                        obj.setInt( "velocity", velocity );
                        obj.setInt( "timestamp", timestamp );
                        
                        midiMessages.setJSONObject( messageCounter, obj );
                        
                        messageCounter++;
                        
                    }
                }
            }
        }

        output.setJSONArray( "messages", midiMessages );

        println( output );
        
        String originalFileName[] = split( fileName, '.' );
        String jsonFileName = originalFileName[ 0 ] + ".json";
        
        // Save the JSON file
        boolean fileWritten = saveJSONObject( output, "data/" + jsonFileName );

        if ( fileWritten ) {
            println( "JSON file saved as " + jsonFileName );
        }

        // play the midi file ...
        while ( true ) {
            if ( sequencer.isRunning() ) {
                try {
                    Thread.sleep( 1000 );
                } catch( InterruptedException ignore ) {
                    break;
                }
            } else {
                break;
            }
        }

        // Close the MidiDevice & free resources
        sequencer.stop();
        sequencer.close();


    } catch( MidiUnavailableException mue ) {
        println("Midi device unavailable!");
        background( #ff0000 );
    } catch( InvalidMidiDataException imde ) {
        println("Invalid Midi data!");
        background( #ff0000 );
    } catch( IOException ioe ) {
        println("I/O Error!");
        background( #ff0000 );
    }
    
}