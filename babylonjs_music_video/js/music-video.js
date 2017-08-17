document.addEventListener( "DOMContentLoaded", run, false );

function run()
{
	// Setup canvas, engine, scene and camera
	// --------------------------------------------------------------------------------

    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine( canvas, false );

    window.addEventListener( "resize", function() {
        engine.resize();
    });

    var scene = new BABYLON.Scene( engine );
    scene.clearColor = new BABYLON.Color3( 1.0, 1.0, 1.0 );
    scene.ambientColor = new BABYLON.Color3( 1.0, 1.0, 1.0 );
    
    var camera = new BABYLON.ArcRotateCamera( "Camera", 0, Math.PI / 2, 20, new BABYLON.Vector3( 0, 0, 0 ), scene );
    camera.attachControl( canvas );

	// Create a skybox
	// --------------------------------------------------------------------------------

	var skybox = BABYLON.Mesh.CreateBox("skyBox", 200.0, scene);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skybox.material = skyboxMaterial;
	skybox.infiniteDistance = true;
	skyboxMaterial.disableLighting = true;

	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture( "textures/skybox/lines", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png", "_ny.png", "_nz.png"] ); // Use blackwhite or TropicalSunnyDay
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	// Create the hemispheric light
	// --------------------------------------------------------------------------------
	
	var hemiLight = new BABYLON.HemisphericLight("hemilight", new BABYLON.Vector3( 0, 1, 0 ), scene);
	hemiLight.diffuse = new BABYLON.Color3( 1, 1, 1 );
	hemiLight.specular = new BABYLON.Color3( 1, 1, 1 );
	hemiLight.groundColor = new BABYLON.Color3( 1.0, 1.0, 1.0 );
	hemiLight.intensity = 1.0;

    // Create materials
	// --------------------------------------------------------------------------------

    var kickMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene );
    kickMaterial.diffuseColor = new BABYLON.Color3( 1.0, 1.0, 1.0 );
    kickMaterial.specularColor = new BABYLON.Color3( 0.2, 0.2, 0.2 );
    kickMaterial.alpha = 0.8;

    var snareMaterial = new BABYLON.StandardMaterial("snareMaterial", scene );
	snareMaterial.diffuseColor = new BABYLON.Color3( 1.0, 1.0, 1.0 );
    snareMaterial.specularColor = new BABYLON.Color3( 0.3, 0.3, 0.3 );
    snareMaterial.alpha = 0.8;
    
    var hihatMaterial = new BABYLON.StandardMaterial("snareMaterial", scene );
	hihatMaterial.diffuseColor = new BABYLON.Color3( 255/255.0, 78/255.0, 0 );
    hihatMaterial.specularColor = new BABYLON.Color3( 0.3, 0.3, 0.3 );
    hihatMaterial.alpha = 0.5;
    
    // Create some meshes
	// --------------------------------------------------------------------------------
	
	var kickSphere = BABYLON.Mesh.CreateSphere("kickSphere", 32, 20, scene );
    kickSphere.material = kickMaterial;
    
    var snareSphere = BABYLON.Mesh.CreateSphere("snareSphere", 32, 10, scene );
    snareSphere.position = new BABYLON.Vector3( -30, 0, 0 );
    snareSphere.material = snareMaterial;

    var hihatSphere = BABYLON.Mesh.CreateSphere("hihatSphere", 32, 6, scene );
    hihatSphere.position = new BABYLON.Vector3( 0, 0, 0 );
    hihatSphere.material = hihatMaterial;

    hihatSphere.parent = kickSphere;
    
    // Asset Manager, tasks and callback functions
	// --------------------------------------------------------------------------------

    var assetsManager = new BABYLON.AssetsManager( scene );

    var midiJSON;
    var textTask = assetsManager.addTextFileTask("text task", "files/midi-track.json");
    textTask.onSuccess = function( task ) {
        midiJSON = JSON.parse( task.text );
        parseMidiJSON();
    }

    var audioFile;
    var audioTask = assetsManager.addBinaryFileTask("audioFile", "audio/music.mp3");
    audioTask.onSuccess = function( task ) {
        audioFile = new BABYLON.Sound("Music", task.data, scene, soundReady, { autoplay: false, loop: false } );
    }

    var textureTask = assetsManager.addTextureTask("textureFile1", "textures/angled-line-32.png");
    textureTask.onSuccess = function( task ) {
        kickMaterial.diffuseTexture = task.texture;
    }

    var textureTask = assetsManager.addTextureTask("textureFile2", "textures/triangle-texture-4.png");
    textureTask.onSuccess = function( task ) {
        snareMaterial.diffuseTexture = task.texture;
    }

    var textureTask = assetsManager.addTextureTask("textureFile3", "textures/horizontal-lines-32.png");
    textureTask.onSuccess = function( task ) {
        hihatMaterial.diffuseTexture = task.texture;
    }

    var startTime = 0;
    var currentBeat36 = 0; // KICK
    var currentBeat38 = 0; // SNARE

    var currentBeat42 = 0; // Hihats
    var currentBeat46 = 0; // Hihats
    
    var currentBeat51 = 0; // COWBELL

    var beatTimeStamps = {};

    // Convert incoming MIDI JSON file into event arrays so we can animate different things based
    // on different notes.
    function parseMidiJSON()
    {
        for ( var i = 0; i < midiJSON.messages.length; i++ ) {

            var key = midiJSON.messages[ i ].noteNumber;

            if ( key in beatTimeStamps ) {
                beatTimeStamps[ key ].push( midiJSON.messages[ i ].timestamp );                
            } else {
                beatTimeStamps[ key ] = [];
                beatTimeStamps[ key ].push( midiJSON.messages[ i ].timestamp );                
            }

        }
        
    }

    function soundReady()
    {
        // Start playing the audio file.
        audioFile.play();

        // Start time, needed to do some calculations to sync the animations
        startTime = Date.now();
    }

    assetsManager.onFinish = function( tasks ) {

        engine.runRenderLoop( function() {

            kickSphere.rotation.x += 0.005;
            kickSphere.rotation.y += 0.01;
            
            snareSphere.rotation.z -= 0.01;

            hihatSphere.rotation.x += 0.005;
            hihatSphere.rotation.z -= 0.02;
            
            // Calculate the number of milliseconds since the audio started.
            var newTime = Date.now();
            var deltaTime = newTime - startTime;        

            // Animations: compare the number of milliseconds since the audio started to the timestamps in the array.

            // Note 36: Kick
            if ( deltaTime > beatTimeStamps["36"][ currentBeat36 ] && currentBeat36 <= beatTimeStamps["36"].length ) {

                if ( currentBeat36 % 2 === 0 ) {
                    kickMaterial.diffuseColor = new BABYLON.Color3( 105/255.0, 210/255.0, 231/255.0 );
                } else {
                    kickMaterial.diffuseColor = new BABYLON.Color3( 224/255.0, 228/255.0, 204/255.0 );
                }

                currentBeat36++;
            }

            // Note 38: Snare
            if ( deltaTime > beatTimeStamps["38"][ currentBeat38 ] && currentBeat38 <= beatTimeStamps["38"].length ) {

                snareSphere.position = randomLocation( -20, 20 );

                if ( currentBeat38 % 2 === 0 ) {
                    snareMaterial.diffuseColor = new BABYLON.Color3( 4/255.0, 111/255.0, 100/255.0 );
                } else {
                    snareMaterial.diffuseColor = new BABYLON.Color3( 232/255.0, 221/255.0, 203/255.0 );
                }

                currentBeat38++;
            }

            // Note 42 & 46: Hihats
            if ( deltaTime > beatTimeStamps["42"][ currentBeat42 ] && currentBeat42 <= beatTimeStamps["42"].length ) {
                hihatSphere.position = new BABYLON.Vector3( 10, 0, 0 );
                currentBeat42++;
            }

            if ( deltaTime > beatTimeStamps["46"][ currentBeat46 ] && currentBeat46 <= beatTimeStamps["46"].length ) {
                hihatSphere.position = new BABYLON.Vector3( -10, 0, 0 );
                currentBeat46++;
            }

            // Note 51: COWBELL : change camera angles
            if ( deltaTime > beatTimeStamps["51"][ currentBeat51 ] && currentBeat51 <= beatTimeStamps["51"].length ) {

                scene.activeCamera.alpha = Math.random() * Math.PI * 2;
                scene.activeCamera.beta = Math.random() * Math.PI * 2;
                scene.activeCamera.radius = Math.random() * 20 + 40;
                scene.activeCamera.target = new BABYLON.Vector3( 0, 0, 0 );

                currentBeat51++;
            }                

            scene.render();
        });
    };

    function randomLocation( min, max )
    {
        return new BABYLON.Vector3( randomNumber( min, max ), randomNumber( min, max ), randomNumber( min, max ) );
    }
    
    function randomNumber( min, max )
    {
        return Math.random() * ( max - min + 1 ) + min;
    }

    engine.loadingUIBackgroundColor = "Black";
    engine.loadingUIText = "Loading";

    assetsManager.load();

}