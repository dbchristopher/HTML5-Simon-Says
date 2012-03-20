var loader = new widgets.Loader({ message: "Downloading: 0%" });

/*
	NEXT: 
		make it log keystroke
		add instructions to use keys 1-5
*/

(function() { "use strict";
	// REMOVE BLANK CHARS FROM BEGINNING AND END OF STRING
	String.prototype.trim = function () {
		return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
	};

	var Simon = function() {
		var INPUTS = document.getElementById('content').getElementsByTagName('a'),
			SPEED = 250,
			SPACING = 250,
			PATTERN = [], // PATTERN TO PLAY
			NOTES = [70, 74, 75, 77, 82],
			LISTEN = false, // LINK EACH COLOR TO A NOTE
			RESPONSE = [], // USER PLAYBACK
			CTRL = document.getElementById('ctrl'),
			SCORE = 0,
			SCOREKEEPER = document.getElementById('scoreNumber'); // CONTROL BAR

		this.init = function() {
			var self = this,
				reset = document.getElementById('reset'),
				start = document.getElementById('start');
			// connect color to sound
			for (var i = 0; i < INPUTS.length; i++) {
				Event.add(INPUTS[i], 'mousedown', this.clickSingle(INPUTS[i]) );
			}

			document.getElementById('intro').className = 'active';
			reset.onclick = function() { return false };
			start.onclick = function() { return false };
			Event.add(reset, 'click', this.reset() );
			Event.add(start, 'click', this.reset() );
			this.setDefault();
			Event.add(window, 'keydown', function(event) {

				var code = event.keyCode - 49;
				if(code >= 48) code -= 48;
				if(code >= 0 && code <= 4) {
					self.playSingle(INPUTS[ code ]);
				}
			} )
		},

		this.setDefault = function() { // set default values
			PATTERN = [];
			SCORE = 0;
			RESPONSE = [];
		}

		this.clickSingle = function(el) {
			var self = this;
			return function() { 
				if(LISTEN === true ) { 
					self.playSingle(el);
					self.record(el);
				} 
			}
		}

 		this.record = function ( el ) {
 			var note = el.id.replace('col','') - 1;
 			RESPONSE[ RESPONSE.length ] = parseInt(note);
			this.evaluate();
 		}

		this.evaluate = function () { // how did the user do?
 			var response = RESPONSE.join(''),
 				pattern = PATTERN.slice(0, RESPONSE.length).join(''),
 				self = this;
 			
 			if( response === pattern && RESPONSE.length === PATTERN.length) {
 				LISTEN = false;
 				RESPONSE = [];
 				this.success();
 			} else if ( response !== pattern ) {
 				this.fail();
 			}
 		}

 		this.success = function () { // reward
 			var self = this;
 			CTRL.className = 'active';
 			SCORE++;
 			SCOREKEEPER.innerHTML = SCORE;
 			setTimeout( function() { 
 				CTRL.className = '';
 				self.playPattern(); }, SPEED + ( SPACING * 2 ) 
 			);
 		}

 		this.fail = function () { // failure
 			document.getElementById('endScreen').className = 'active';
 			document.getElementById('finalScore').innerHTML = SCORE;
 		}

 		this.reset = function () { // restart game
 			var self = this;
 			return function() {
				document.getElementById('endScreen').className = '';
				document.getElementById('intro').className = '';
 				self.setDefault();
 				self.playPattern();
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
		},

		this.playPattern = function() { // playback a pattern
			var next = Math.random() * INPUTS.length >> 0,
				self = this,
				i = 0;
			PATTERN[PATTERN.length] = next;
			(function play() { // recursive loop to play pattern
				setTimeout( function() {
					self.playSingle( INPUTS[ PATTERN[i] ]);
					i++;
					if( i < PATTERN.length ) {
						play();
					} else {
						setTimeout( function() { LISTEN = true; }, SPEED + SPACING );
					}
				},
				SPEED + SPACING)
			})(); // end recursion
		}
	}

	MIDI.loadPlugin(function() {
		var simonSays = new Simon;
		loader.stop();
		simonSays.init();
	}, "piano", "./inc/MIDI.js/"); // specifying a path doesn't work


})();