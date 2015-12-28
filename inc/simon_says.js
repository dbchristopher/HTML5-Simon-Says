
(function() { "use strict";
	// disable mobile safari "bounce"
	document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);

	// REMOVE BLANK CHARS FROM BEGINNING AND END OF STRING
	String.prototype.trim = function () {
		return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
	};

	var Simon = function() {
		var SELF = this,
			INPUTS = document.getElementById('content').getElementsByTagName('a'),
			SPEED,
			SPACING,
			SCORE,
			PATTERN = [], // PATTERN TO PLAY
			NOTES = [70, 74, 75, 77, 82],
			LISTEN = true, // LINK EACH COLOR TO A NOTE
			RESPONSE = [], // USER PLAYBACK
			CTRL = document.getElementById('ctrl'),
			SCOREKEEPER = document.getElementById('scoreNumber'); // CONTROL BAR

		this.init = function() {
			var reset = document.getElementById('reset'),
				start = document.getElementById('start');
			// connect color to sound
			for (var i = 0; i < INPUTS.length; i++) {
				Event.add(INPUTS[i], 'mousedown', function(event) { SELF.inputSingle(event.target); } );
			}
			document.getElementById('intro').className = 'active';
			reset.onclick = function() { return false };
			start.onclick = function() { return false };
			Event.add(reset, 'click', this.reset() );
			Event.add(start, 'click', this.reset() );
			// add keypress events
			Event.add(window, 'keydown', function(event) {
				var code = event.keyCode - 49;
				if(code >= 48) code -= 48; // adjust for 10-key pad
				if(code >= 0 && code <= 4) {
					var el = INPUTS[ code ];
					SELF.inputSingle(el);
				}
				
			});
		}

		this.reset = function () { // start/restart game
 			return function() {
				document.getElementById('endScreen').className = '';
				document.getElementById('intro').className = '';
 				SELF.setDefault();
 				SELF.playPattern();
 			}
 		}

		this.setDefault = function() { // set default values
			LISTEN = false;
			PATTERN = [];
			SCORE = 0;
			RESPONSE = [];
			SPACING = 360;
			SPEED = 250;
		}

		this.inputSingle = function(el) {
			if(LISTEN === true ) { 
				SELF.playSingle(el);
				SELF.record(el);
			} 
		}

		this.playSingle = function (el) { // play a color/note
			var note = el.id.replace('col','') - 1;
			el.className = 'active';
			MIDI.noteOn(0, NOTES[note], 127, 0);
			setTimeout(function() { // turn off color
				MIDI.noteOff(0, note, 0);
				el.className = '';
			}, SPEED);
		}

 		this.record = function ( el ) {
 			if(PATTERN.length >= 1) {
	 			var note = el.id.replace('col','') - 1;
	 			RESPONSE[ RESPONSE.length ] = parseInt(note);
				this.evaluate();
 			}
 		}

		this.evaluate = function () { // how did the user do?
 			var response = RESPONSE.join(''),
 				pattern = PATTERN.slice(0, RESPONSE.length).join('');
 			if( response === pattern && RESPONSE.length === PATTERN.length) {
 				LISTEN = false;
 				RESPONSE = [];
 				this.success();
 			} else if ( response !== pattern ) {
 				this.fail();
 			}
 		}

 		this.success = function () { // reward
 			CTRL.className = 'active';
 			SCORE++;
 			SCOREKEEPER.innerHTML = SCORE;
 			setTimeout( function() { 
 				CTRL.className = '';
 				SELF.playPattern(); }, SPEED + ( SPACING * 2 ) 
 			);
 		}

 		this.fail = function () { // failure
 			var failPattern = [0,2,1,3,4],
 				i = 0;

 			// default simon says end game
 			document.getElementById('endScreen').className = 'active';
 			document.getElementById('finalScore').innerHTML = SCORE;

 			setTimeout(function() {
	 			(function play() { // recursive loop to play fail music
					setTimeout( function() {
						SELF.playSingle( INPUTS[ failPattern[i] ]);
						i++;
						if( i < failPattern.length ) {
							play();
						}
					},
					SPEED * .7 >> 0)
				})(); // end recursion
			}, SPACING);
 		}

		this.playPattern = function() { // playback a pattern
			var next = Math.random() * INPUTS.length >> 0,
				i = 0,
				local_spacing;
			PATTERN[PATTERN.length] = next;
			SPACING = SPACING - 30;
			SPACING = Math.max(SPACING, 60);
			(function play() { // recursive loop to play pattern
				setTimeout( function() {
					SELF.playSingle( INPUTS[ PATTERN[i] ]);
					i++;
					if( i < PATTERN.length ) {
						play();
					} else {
						setTimeout( function() { LISTEN = true; }, SPEED );
					}
				},
				SPEED + SPACING)
			})(); // end recursion
		}
	}

	MIDI.loadPlugin({
		soundfontUrl: "./inc/MIDI.js/soundfont/",
		instrument: "acoustic_grand_piano",
		callback: function() {
			var simonSays = new Simon;
			simonSays.init();
			MIDI.loader.stop();
		}
	});
	
	Event.add("body", "ready", function() {
		MIDI.loader = new widgets.Loader("Loading Simon Says");
	});

})();