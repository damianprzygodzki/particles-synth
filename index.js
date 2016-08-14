window.onload = function() {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var audioContext = new AudioContext();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var notes = [
        130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08, 261.63
    ];

    var startX = canvas.width / 2;
    var startY = canvas.height / 2;
    var colorMed = 255;

    var particles = [],
    particleIndex = 0,
    activeVoices = [];

    var Voice = (function(context) {
        function Voice(frequency){
            this.frequency = frequency * 6;
            this.oscillators = [];
            this.gainLfo = null;
            this.gain = null;
        };

        Voice.prototype.start = function() {
            if(this.gainLfo === null){
                var lfo = audioContext.createOscillator();
                lfo.frequency.value = 1;

                var gain = audioContext.createGain();
                gain.gain.value = 5;

                gain.connect(lfo.frequency);
                this.gainLfo = lfo;
                this.gain = gain;
            }

            var vco = audioContext.createOscillator();
            vco.frequency.value = this.frequency;

            vco.connect(this.gain);
            this.gainLfo.connect(audioContext.destination);

            vco.start();
            lfo.start();
            this.oscillators.push(vco);
        };

        Voice.prototype.stop = function() {
            this.oscillators.forEach(function(oscillator, _) {
                oscillator.stop();
            });
        };

        return Voice;
    })(context);


    function Particle(x,y) {
        if(x && y) {
            this.x = x;
            this.y = y;
        }else{
            this.x = startX;
            this.y = startY;
        }


        particleIndex ++;
        particles[particleIndex] = this;
        this.id = particleIndex;
        this.life = 0;

        this.color = 'rgb('+ (colorMed ) + ',' + (colorMed) +','+ (colorMed) + ')';

        var voice = new Voice(notes[Math.floor(Math.random() * 8)]);
        activeVoices[this.id] = voice;
        voice.start();

        return this;
    }


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    Particle.prototype.draw = function() {
        this.x += Math.random() * 3 - 1.5;
        this.y += Math.random() * 3 - 1.5;

        this.life++;

        if (this.life >= 300) {
            delete particles[this.id];
            activeVoices[this.id].stop();
            delete activeVoices[this.id];
        }
        context.shadowColor = "#fff";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 20;
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y, 5, 0, Math.PI*2, true);
        context.closePath();
        context.fill();
    }

    canvas.addEventListener("click", (e) => {
        var ref = new Particle(e.clientX, e.clientY);
    });

    function drawLines(arr) {

        if(arr){
            context.strokeStyle = "rgb("+colorMed+","+colorMed+","+colorMed+")";
            context.shadowBlur = 0;
            context.beginPath();

            let start = arr[Object.keys(arr)[0]];
            context.moveTo(start.x, start.y);
            for(var i in Object.keys(arr)){
                context.lineTo(arr[Object.keys(arr)[i]].x,arr[Object.keys(arr)[i]].y);
            }
            context.closePath();
            context.stroke();
        }
    }

    setInterval(function() {
        var blur = 0.1;
        context.shadowBlur = 0;
        context.fillStyle = "rgba(0,0,0,"+ blur +")";
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (var i in particles) {
            particles[i].draw();
        }
        if(Object.keys(particles).length > 0){
            drawLines(particles);
        }
    }, 30);
};
