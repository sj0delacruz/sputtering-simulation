/*Ajustes de diseño y escala*/
const gw=Math.min( Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight,document.documentElement.clientHeight), Math.max(document.body.scrollWidth,document.documentElement.scrollWidth,document.body.offsetWidth,document.documentElement.offsetWidth,document.documentElement.clientWidth) )/120.;
	
const l=gw*120; //120mm
const h=gw*60; //60mm
const r=0.5*gw; //1.5mm == radio de circulo que representa los argones, el radio del electron es la mitad

const g1=3*gw; //3mm == grosor de las paredes del anodo (rojo)
const l3=15*gw; //15mm == largo de las patas del catodo (naranja)
const h3=10*gw;  //10mm == alto de las patas del catodo (naranja)
const l2=10*gw; //10mm == largo de la pared neutra (negro)
const h2=6*gw; //6mm == alto de la pared neutra (negro)
const h4=7.5*gw; //7.5mm ==
const h5=3*gw; //3mm ==
const hr1=1.7*gw;
const hr2=2.76*gw;

const mediumSpeed=0.35*gw; //350 mm/(\mu s)== rapidez media de los atomos de argon entrantes
const const1=-3742.17*gw; //[mm/(mu s)]==e/(m_e L)
const const2=0.051*gw; //[mm/(mu s)]==e/(m_argon L)
const const3=1/(182); //==q_argon/m_argon
const fx=0.005;	//factor de escala

/* */
var ctx;
var zones;
var numZones,numParticleTypes;
var V_D, V_A, V_B, V_C, V_N;

/* */
const timeInterval=41; //numero de cuadros entre los cuales se constituye un ciclo (actualiza valores)
const dt=1; //\mu s delta de tiempo en que se va avanzando durante un ciclo
var reps=0;
var t=0.;
var flow=0.;
var contador=0;
var argonTimes,argonYs,argonThetas;
var electronCTimes,electronCThetas,electronCThetas2;
var electronNTimes,electronNYs,electronNThetas;

function start() {
    /*  */
    var draw = document.getElementById('canvas');
    draw.width=l;
    draw.height=h+10.5*gw;
    draw.context = draw.getContext("2d");
    draw.interval = setInterval(update, 25);
    ctx=draw.context;
    
    var zoneNames=["right","mediumRight","mediumLeft","left"];numZones=zoneNames.length;zones= new Array(numZones);
    var particleTypesFeatures=[["Electron",'yellow',0.5*r],["Ion de Argon",'red',0.7*r],["Argon",'black',0.7*r]];numParticleTypes=particleTypesFeatures.length;var zoneParticleTypes = new Array(numZones);
    
    var updateFunctions= [
        function(MediumZone) {
            var electronT, ionArgonT, argonT;
            var newPosition = new Array(2);
            var numParticles=this.particleTypes[0].particles.length;
            for (i=0; i<numParticles; i++){
                electronT=this.particleTypes[0].particles[i];
                newPosition[0]=electronT.position[0]+electronT.speed[0]*dt;
                newPosition[1]=electronT.position[1]+electronT.speed[1]*dt;
                if (newPosition[1]<g1 | newPosition[1]>h-g1 | newPosition[0]<g1){
                    this.particleTypes[0].particles.splice(i, 1);
                    i--;numParticles--;
                }
                else if (newPosition[0]>l/2-l2 ){
                    if (newPosition[1]>g1+h2 && newPosition[1]<h-g1-h2){
                        this.particleTypes[0].particles.splice(i, 1);
                        i--;numParticles--;
                        MediumZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0]+fx*const1*V_D*dt,electronT.speed[1]+fx*const1*(h-newPosition[1]-electronT.position[1])/2*V_D*dt]));
                    }
                    else {
                        electronT.position=[l-2*l2-newPosition[0],newPosition[1]];
                        electronT.speed=[-electronT.speed[0]+const1*V_D*dt, electronT.speed[1]+fx*const1*(h-newPosition[1]-electronT.position[1])/2*V_D*dt];
                    }
                }
                else {
                    electronT.position=[newPosition[0],newPosition[1]];
                    electronT.speed=[electronT.speed[0]+const1*V_D*dt, electronT.speed[1]+fx*const1*(h- newPosition[1]-electronT.position[1])/2*V_D*dt];
                }
            }
            numParticles=this.particleTypes[1].particles.length;
            for (i=0; i<numParticles; i++){
                ionArgonT=this.particleTypes[1].particles[i];
                newPosition[0]=ionArgonT.position[0]+ionArgonT.speed[0]*dt;
                newPosition[1]=ionArgonT.position[1]+ionArgonT.speed[1]*dt;
                if (newPosition[1]<g1 | newPosition[1]>h-g1 | newPosition[0]<g1 | newPosition[0]>0.5*l-l2){
                    if (newPosition[1]<g1){
                        newPosition[1]=2*g1-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    else if(newPosition[1]>h-g1){
                        newPosition[1]=2*h-2*g1-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    if (newPosition[0]<g1){
                        ionArgonT.position=[2*g1-newPosition[0],newPosition[1]];
                        ionArgonT.speed[0]=-ionArgonT.speed[0];
                    }
                    else if (newPosition[0]>l/2-l2){
                        if (newPosition[1]<g1+h2 | newPosition[1]>h-g1-h2){
                            ionArgonT.position=[l-2*l2-newPosition[0],newPosition[1]];
                            ionArgonT.speed=[-ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]+fx*const2*(h-newPosition[1]-ionArgonT.position[1])/2*V_B*dt];
                        }
                        else {
                            this.particleTypes[1].particles.splice(i, 1);
                            i--;numParticles--; 
                            MediumZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]+fx*const2*(h-newPosition[1]-ionArgonT.position[1])/2*V_B*dt]));
                        }
                    }
                    else {
                        ionArgonT.position=[newPosition[0],newPosition[1]];
                        ionArgonT.speed=[ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]+fx*const2*(h-newPosition[1]-ionArgonT.position[1])/2*V_B*dt];
                    }
                }
                else {
                    ionArgonT.position=[newPosition[0],newPosition[1]];
                    ionArgonT.speed=[ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]+fx*const2*(h-newPosition[1]-ionArgonT.position[1])/2*V_B*dt];
                }
            }
            numParticles=this.particleTypes[2].particles.length;
            for (i=0; i<numParticles; i++){
                argonT=this.particleTypes[2].particles[i];
                newPosition[0]=argonT.position[0]+argonT.speed[0]*dt;
                newPosition[1]=argonT.position[1]+argonT.speed[1]*dt;
                if (newPosition[1]<g1 | newPosition[1]>h-g1 | newPosition[0]<g1 | newPosition[0]>0.5*l-l2){
                    if (newPosition[1]<g1){
                        newPosition[1]=2*g1-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    else if(newPosition[1]>h-g1){
                        newPosition[1]=2*h-2*g1-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    if (newPosition[0]<g1){
                        argonT.position=[2*g1-newPosition[0],newPosition[1]];
                        argonT.speed[0]=-argonT.speed[0];
                    }
                    else if (newPosition[0]>l/2-l2){
                        if (newPosition[1]<g1+h2 | newPosition[1]>h-g1-h2){
                            argonT.position=[l-2*l2-newPosition[0],newPosition[1]];
                            argonT.speed=[-argonT.speed[0],argonT.speed[1]];
                        }
                        else {
                            this.particleTypes[2].particles.splice(i, 1);
                            i--;numParticles--;
                            MediumZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                        }
                    }
                    else {
                        argonT.position=[newPosition[0],newPosition[1]];
                        argonT.speed=[argonT.speed[0],argonT.speed[1]];
                    }
                }
                else {
                    argonT.position=[newPosition[0],newPosition[1]];
                    argonT.speed=[argonT.speed[0],argonT.speed[1]];
                }
            }
        },
        function(rightZone, leftZone) {
            var electronT, ionArgonT, argonT;
            var newPosition = new Array(2);
            var numParticles=this.particleTypes[0].particles.length;
            for (i=0; i<numParticles; i++){
                electronT=this.particleTypes[0].particles[i];
                newPosition[0]=electronT.position[0]+electronT.speed[0]*dt;
                newPosition[1]=electronT.position[1]+electronT.speed[1]*dt;
                if (newPosition[1]<g1+h2 | newPosition[1]>h-h2-g1 | newPosition[0]<l/2-l2 | newPosition[0]> l/2-2*h5){
                    if (newPosition[1]<g1+h2){
                        newPosition[1]=2*h2+2*g1-newPosition[1];
                        electronT.speed[1]=-electronT.speed[1];
                    }
                    else if (newPosition[1]>h-h2-g1){
                        newPosition[1]=2*h-2*h2-2*g1-newPosition[1];
                        electronT.speed[1]=-electronT.speed[1];
                    }
                    if(newPosition[0]<l/2-l2){
                        this.particleTypes[0].particles.splice(i, 1);
                        i--;numParticles--;
                        rightZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0]+const1*V_D*dt,electronT.speed[1]]));
                    }
                    else if(newPosition[0]> l/2-2*h5){
                        if(Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[0].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0]+const1*V_D*dt,electronT.speed[1]]));
                        }
                        else {
                            electronT.position=[l-4*h5 - newPosition[0], newPosition[1]]
                            electronT.speed[0]=-electronT.speed[0]+const1*V_D*dt;
                        }
                    }
                    else {
                        electronT.position=[newPosition[0], newPosition[1]]
                        electronT.speed[0]=electronT.speed[0]+const1*V_D*dt;
                    }
                }
                else {
                    electronT.position=[newPosition[0], newPosition[1]];
                    electronT.speed[0]=electronT.speed[0]+const1*V_D*dt;
                }
            }
            numParticles=this.particleTypes[1].particles.length;
            for (i=0; i<numParticles; i++){
                ionArgonT=this.particleTypes[1].particles[i];
                newPosition[0]=ionArgonT.position[0]+ionArgonT.speed[0]*dt;
                newPosition[1]=ionArgonT.position[1]+ionArgonT.speed[1]*dt;
                if (newPosition[1]<g1+h2 | newPosition[1]>h-h2-g1 | newPosition[0]<l/2-l2 | newPosition[0]> l/2-2*h5){
                    if (newPosition[1]<g1+h2){
                        newPosition[1]=2*h2+2*g1-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    else if (newPosition[1]>h-h2-g1){
                        newPosition[1]=2*h-2*h2-2*g1-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    if(newPosition[0]<l/2-l2){
                        this.particleTypes[1].particles.splice(i, 1);
                        i--;numParticles--;
                        rightZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]]));
                    }
                    else if(newPosition[0]> l/2 -2*h5){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[1].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0]+const2*V_B*dt,ionArgonT.speed[1]]));
                        }
                        else {
                            ionArgonT.position=[l-4*h5-newPosition[0], newPosition[1]]
                            ionArgonT.speed[0]=-ionArgonT.speed[0]+const2*V_B*dt;
                        }
                    }
                    else {
                        ionArgonT.position=[newPosition[0], newPosition[1]]
                        ionArgonT.speed[0]=ionArgonT.speed[0]+const2*V_B*dt;
                    }
                }
                else {
                    ionArgonT.position=[newPosition[0], newPosition[1]];
                    ionArgonT.speed[0]=ionArgonT.speed[0]+const2*V_B*dt;
                }
            }
            numParticles=this.particleTypes[2].particles.length;
            for (i=0; i<numParticles; i++){
                argonT=this.particleTypes[2].particles[i];
                newPosition[0]=argonT.position[0]+argonT.speed[0]*dt;
                newPosition[1]=argonT.position[1]+argonT.speed[1]*dt;
                if (newPosition[1]<g1+h2 | newPosition[1]>h-h2-g1 | newPosition[0]<l/2-l2 | newPosition[0]> l/2- 2*h5){
                    if (newPosition[1]<g1+h2){
                        newPosition[1]=2*h2+2*g1-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    else if (newPosition[1]>h-h2-g1){
                        newPosition[1]=2*h-2*h2-2*g1-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    if(newPosition[0]<l/2-l2){
                        this.particleTypes[2].particles.splice(i, 1);
                        i--;numParticles--;
                        rightZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                    }
                    else if(newPosition[0]> l/2-2*h5){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[2].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                        }
                        else {
                            argonT.position=[l-4*h5-newPosition[0], newPosition[1]]
                            argonT.speed[0]=-argonT.speed[0];
                        }
                    }
                    else {
                        argonT.position=[newPosition[0], newPosition[1]]
                    }
                }
                else {
                    argonT.position=[newPosition[0], newPosition[1]];
                }
            }
        },
        function(rightZone, leftZone) {
            var electronT, ionArgonT, argonT;
            var newPosition = new Array(2);
            var numParticles=this.particleTypes[0].particles.length;
            for (i=0; i<numParticles; i++){
                electronT=this.particleTypes[0].particles[i];
                newPosition[0]=electronT.position[0]+electronT.speed[0]*dt;
                newPosition[1]=electronT.position[1]+electronT.speed[1]*dt;
                if (newPosition[1]<6*h5 | newPosition[1]>h-6*h5 | newPosition[0]<l/2-2*h5 | newPosition[0]> l/2){
                    if (newPosition[1]<6*h5){
                        newPosition[1]=12*h5-newPosition[1];
                        electronT.speed[1]=-electronT.speed[1];
                    }
                    else if (newPosition[1]>h-6*h5){
                        newPosition[1]=2*h-12*h5-newPosition[1];
                        electronT.speed[1]=-electronT.speed[1];
                    }
                    if(newPosition[0]<l/2-2*h5){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[0].particles.splice(i, 1);
                            i--;numParticles--;
                            rightZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0]+const1*(V_D+V_A)*dt,electronT.speed[1]]));
                        }else{
                            electronT.position=[l-4*h5- newPosition[0], newPosition[1]]
                            electronT.speed[0]=-electronT.speed[0]+const1*V_A*dt;
                        }
                    }
                    else if(newPosition[0]> l/2){
                        if(Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[0].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0]+const1*(V_D+V_A)*dt,electronT.speed[1]]));
                        }
                        else {
                            electronT.position=[l- newPosition[0], newPosition[1]]
                            electronT.speed[0]=-electronT.speed[0]+const1*(V_D+V_A)*dt;
                        }
                    }
                    else {
                        electronT.position=[newPosition[0], newPosition[1]]
                        electronT.speed[0]=electronT.speed[0]+const1*(-V_A)*dt;
                    }
                }
                else {
                    electronT.position=[newPosition[0], newPosition[1]];
                    electronT.speed[0]=electronT.speed[0]+const1*(V_D+V_A)*dt;
                }
            }
            numParticles=this.particleTypes[1].particles.length;
            for (i=0; i<numParticles; i++){
                ionArgonT=this.particleTypes[1].particles[i];
                newPosition[0]=ionArgonT.position[0]+ionArgonT.speed[0]*dt;
                newPosition[1]=ionArgonT.position[1]+ionArgonT.speed[1]*dt;
                if (newPosition[1]<6*h5 | newPosition[1]>h-6*h5 | newPosition[0]<l/2-2*h5 | newPosition[0]> l/2){
                    if (newPosition[1]<6*h5){
                        newPosition[1]=2*6*h5-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    else if (newPosition[1]>h-6*h5){
                        newPosition[1]=2*h-2*6*h5-newPosition[1];
                        ionArgonT.speed[1]=-ionArgonT.speed[1];
                    }
                    if(newPosition[0]<l/2-2*h5){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[1].particles.splice(i, 1);
                            i--;numParticles--;
                            rightZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0]+const2*V_A*dt,ionArgonT.speed[1]]));
                        }
                        else{
                            ionArgonT.position=[l-4*h5-newPosition[0], newPosition[1]]
                            ionArgonT.speed[0]=-ionArgonT.speed[0]+const2*V_A*dt;
                        }
                    }
                    else if(newPosition[0]> l/2){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[1].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0]+const2*V_A*dt,ionArgonT.speed[1]]));
                        }
                        else {
                            ionArgonT.position=[l-newPosition[0], newPosition[1]]
                            ionArgonT.speed[0]=-ionArgonT.speed[0]+const2*V_A*dt;
                        }
                    }
                    else {
                        ionArgonT.position=[newPosition[0], newPosition[1]]
                        ionArgonT.speed[0]=ionArgonT.speed[0]+const2*V_A*dt;
                    }
                }
                else {
                    ionArgonT.position=[newPosition[0], newPosition[1]];
                    ionArgonT.speed[0]=ionArgonT.speed[0]+const2*V_A*dt;
                }
            }
            numParticles=this.particleTypes[2].particles.length;
            for (i=0; i<numParticles; i++){
                argonT=this.particleTypes[2].particles[i];
                newPosition[0]=argonT.position[0]+argonT.speed[0]*dt;
                newPosition[1]=argonT.position[1]+argonT.speed[1]*dt;
                if (newPosition[1]<6*h5 | newPosition[1]>h-6*h5 | newPosition[0]<l/2-2*h5 | newPosition[0]> l/2){
                    if (newPosition[1]<6*h5){
                        newPosition[1]=2*6*h5-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    else if (newPosition[1]>h-6*h5){
                        newPosition[1]=2*h-2*6*h5-newPosition[1];
                        argonT.speed[1]=-argonT.speed[1];
                    }
                    if(newPosition[0]<l/2-2*h5){
                        if(Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[2].particles.splice(i, 1);
                            i--;numParticles--;
                            rightZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                        }
                        else {
                            argonT.position=[l-4*h5-newPosition[0], newPosition[1]]
                            argonT.speed[0]=-argonT.speed[0];
                        }
                    }
                    else if(newPosition[0]> l/2){
                        if (Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                            this.particleTypes[2].particles.splice(i, 1);
                            i--;numParticles--;
                            leftZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                        }
                        else {
                            argonT.position=[l-newPosition[0], newPosition[1]]
                            argonT.speed[0]=-argonT.speed[0];
                        }
                    }
                    else {
                        argonT.position=[newPosition[0], newPosition[1]]
                    }
                }
                else {
                    argonT.position=[newPosition[0], newPosition[1]];
                }
            }
        },
        function(MediumZone) {
            var electronT, ionArgonT, argonT;
            var newPosition = new Array(2);
            var numParticles=this.particleTypes[0].particles.length;
            for (i=0; i<numParticles; i++){
                electronT=this.particleTypes[0].particles[i];
                newPosition[0]=electronT.position[0]+electronT.speed[0]*dt;
                newPosition[1]=electronT.position[1]+electronT.speed[1]*dt;
                if (newPosition[1]>3*g1 & newPosition[1]<h-3*g1 & newPosition[0]>l-2*g1){
                    this.particleTypes[0].particles.splice(i, 1);
                    i--;numParticles--;
                }
                else if (newPosition[1]<0 | newPosition[1]>h | newPosition[0]>l){
                    this.particleTypes[0].particles.splice(i, 1);
                    i--;numParticles--;
                }
                else if (newPosition[0]<l/2){
                    if( Math.abs(newPosition[1]-6*h5-hr1-0.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-2*hr1-1.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-3*hr1-2.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-4*hr1-3.5*hr2)<0.5*hr2 | Math.abs(newPosition[1]-6*h5-5*hr1-4.5*hr2)<0.5*hr2 ){
                        this.particleTypes[0].particles.splice(i, 1);
                        i--;numParticles--;
                        MediumZone.particleTypes[0].particles.push(new Particle([newPosition[0],newPosition[1]],[electronT.speed[0],electronT.speed[1]]));
                    }
                    else {
                        electronT.position=[l-newPosition[0],newPosition[1]];
                        electronT.speed=[-electronT.speed[0], electronT.speed[1]];
                    }
                }
                else {
                    electronT.position=[newPosition[0],newPosition[1]];
                    electronT.speed=[electronT.speed[0], electronT.speed[1]];
                }
            }
            numParticles=this.particleTypes[1].particles.length;
            for (i=0; i<numParticles; i++){
                ionArgonT=this.particleTypes[1].particles[i];
                newPosition[0]=ionArgonT.position[0]+ionArgonT.speed[0]*dt;
                newPosition[1]=ionArgonT.position[1]+ionArgonT.speed[1]*dt;
                if (newPosition[1]>3*g1 & newPosition[1]<h-3*g1 & newPosition[0]>l-2*g1){
                    this.particleTypes[1].particles.splice(i, 1);
                    i--;numParticles--;
                    contador++;
                }
                else if (newPosition[1]<0 | newPosition[1]>h | newPosition[0]>l){
                    this.particleTypes[1].particles.splice(i, 1);
                    i--;numParticles--;
                }
                else if (newPosition[0]<l/2 & false){
                    if (newPosition[1]>g1+h2 && newPosition[1]<h-g1-h2){
                        if( false/* */ ){
                        
                        }
                        else{
                            this.particleTypes[1].particles.splice(i, 1);
                            i--;numParticles--;
                            MediumZone.particleTypes[1].particles.push(new Particle([newPosition[0],newPosition[1]],[ionArgonT.speed[0],ionArgonT.speed[1]]));
                        }
                    }
                    else {
                        ionArgonT.position=[l-2*l2-newPosition[0],newPosition[1]];
                        ionArgonT.speed=[-ionArgonT.speed[0], ionArgonT.speed[1]];
                    }
                }
                else {
                    ionArgonT.position=[newPosition[0],newPosition[1]];
                    ionArgonT.speed=[ionArgonT.speed[0], ionArgonT.speed[1]];
                }
            }
            numParticles=this.particleTypes[2].particles.length;
            for (i=0; i<numParticles; i++){
                argonT=this.particleTypes[2].particles[i];
                newPosition[0]=argonT.position[0]+argonT.speed[0]*dt;
                newPosition[1]=argonT.position[1]+argonT.speed[1]*dt;
                if (newPosition[1]>3*g1 & newPosition[1]<h-3*g1 & newPosition[0]>l-2*g1){
                    this.particleTypes[2].particles.splice(i, 1);
                    i--;numParticles--;contador++;
                }
                else if (newPosition[1]<0 | newPosition[1]>h | newPosition[0]>l){
                    this.particleTypes[2].particles.splice(i, 1);
                    i--;numParticles--;
                }
                else if (newPosition[0]<l/2 & false){
                    if (newPosition[1]>g1+h2 && newPosition[1]<h-g1-h2){
                        if( false/* */ ){
                        
                        }
                        else{
                            this.particleTypes[2].particles.splice(i, 1);
                            i--;numParticles--;
                            MediumZone.particleTypes[2].particles.push(new Particle([newPosition[0],newPosition[1]],[argonT.speed[0],argonT.speed[1]]));
                        }
                    }
                    else {
                        argonT.position=[l-2*l2-newPosition[0],newPosition[1]];
                        argonT.speed=[-argonT.speed[0], argonT.speed[1]];
                    }
                }
                else {
                    argonT.position=[newPosition[0],newPosition[1]];
                    argonT.speed=[argonT.speed[0], argonT.speed[1]];
                }
            }
        }
    ];
    for (i=0; i<numZones; i++){
        zoneParticleTypes[i]=new Array(numParticleTypes);
        for (j=0; j<numParticleTypes; j++){
            zoneParticleTypes[i][j]= new ParticleType(particleTypesFeatures[j])
        }
        zones[i] = new Zone(zoneNames[i], updateFunctions[i], zoneParticleTypes[i]);
    }
}
/*  */
function update() {
    /* Actualiza los parametros ingresados */ //[volt]==[kg·m2·s−3·A−1]
    V_D = document.getElementById("VOLTDESCA").value;V_A = document.getElementById("VOLTACER").value;V_B = document.getElementById("VOLTHAZ").value;V_C = document.getElementById("VOLTCATH").value;V_N = document.getElementById("VOLTNEU").value;
    
    /*  */
    if(V_C<10){V_C*=0;} 
    else{V_C=(V_C-10)*50;} 
    I_C=V_C*13/500;document.getElementById('I_C').innerHTML = I_C + " mA";
    
    
    if(V_N<10){V_N*=0;}
    else{V_N=(V_N-10)*50;}
    I_N=V_N*15/500;document.getElementById('I_N').innerHTML = I_N + " mA";

    I_D=V_D*2/100;document.getElementById('I_D').innerHTML = I_D+ " A";
    V_D*=1e-9*gw; //[kg·m2·(\mu s)−2·C−1]
    
    I_B=V_B*5/10;document.getElementById('I_B').innerHTML = I_B+ " mA";
    V_B*=1e-4*gw; //[kg·m2·(\mu s)−2·C−1]
    I_A=V_A;document.getElementById('I_A').innerHTML = I_A+ " mA";
    V_A*=1e-2*gw; //[kg·m2·(\mu s)−2·C−1]
    
    updateZones();
    
    /* Crear nuevas particulas */ Math.random() 
    
    if (reps==0){
        numArgonsPerSecond=5000-zones[0].particleTypes[1].particles.length-zones[0].particleTypes[2].particles.length-zones[1].particleTypes[1].particles.length-zones[1].particleTypes[2].particles.length-zones[2].particleTypes[1].particles.length-zones[2].particleTypes[2].particles.length;
        argonTimes=new Array(numArgonsPerSecond);
        argonYs=new Array(numArgonsPerSecond);
        argonThetas=new Array(numArgonsPerSecond);
        var y;
        for (i=0;i<numArgonsPerSecond;i++){
            argonTimes[i]=-parseInt(timeInterval*Math.random());
            y=(Math.random()-1/2)*5*h3/2;
            if (y<0){
                y=h/2 +y-3*h3/4;
            }else{
                y=h/2+y+3*h3/4;
            }
            argonYs[i]=y;
            argonThetas[i]=(Math.random()-1/2)*Math.PI;
        }
        numElectronsCPerSecond=parseInt(V_C);
        electronCTimes=new Array(numElectronsCPerSecond);
        electronCThetas=new Array(numElectronsCPerSecond);
        electronCThetas2=new Array(numElectronsCPerSecond);
        for (i=0;i<numElectronsCPerSecond;i++){
            electronCTimes[i]=-parseInt(timeInterval*Math.random());
            electronCThetas[i]=(Math.random()-1/2)*Math.PI;
            electronCThetas2[i]=2*(Math.random()-1/2)*Math.PI;
        }
        numElectronsNPerSecond=parseInt(V_N);
        electronNTimes=new Array(numElectronsNPerSecond);
        electronNYs=new Array(numElectronsNPerSecond);
        electronNThetas=new Array(numElectronsNPerSecond);
        for (i=0;i<numElectronsNPerSecond;i++){
            electronNTimes[i]=-parseInt(timeInterval*Math.random());
            electronNYs[i]=(h-12*h5-2*hr2)*Math.random()+6*h5+hr2;
            electronNThetas[i]=2*(Math.random()-1/2)*Math.PI;
        }
        flow=contador;
        contador=0;
        reps=-timeInterval;
    }else {
        reps++;
        for (i=0;i<numArgonsPerSecond; i++){
            if (reps==argonTimes[i]){
                zones[0].particleTypes[2].particles.push(new Particle([g1+1,argonYs[i]],[mediumSpeed*Math.cos(argonThetas[i]),mediumSpeed*Math.sin(argonThetas[i])]));
                argonTimes.splice(i, 1);argonYs.splice(i, 1);numArgonsPerSecond--;i--;
                }
        }
        for (i=0;i<numElectronsCPerSecond; i++){
            if (reps==electronCTimes[i]){
                zones[0].particleTypes[0].particles.push(new Particle([7*l3/8 +7*l3/8*Math.cos(electronCThetas[i]), h/2 -7*l3/8*Math.sin(electronCThetas[i])],[const3*V_C*mediumSpeed*Math.cos(electronCThetas2[i]),const3*V_C*mediumSpeed*Math.sin(electronCThetas2[i])]));
                electronCTimes.splice(i, 1);electronCThetas.splice(i, 1);numElectronsCPerSecond--;i--;
            }
        }
        for (i=0;i<numElectronsNPerSecond; i++){
            if (reps==electronNTimes[i]){
                zones[3].particleTypes[0].particles.push(new Particle([l/2+3*h4/4, electronNYs[i]],[const3*V_N*mediumSpeed*Math.cos(electronNThetas[i])/10,const3*V_N*mediumSpeed*Math.sin(electronNThetas[i])/10]));
                electronNTimes.splice(i, 1);electronNThetas.splice(i, 1);numElectronsNPerSecond--;i--;
            }
        }
    }
    t+=dt;
    
    /* Preparar el dibujo */
    ctx.clearRect( 0, 0, l, h+10.5*gw);
    drawWalls();
    drawParticles();
    drawData();
}
/*  */
function Zone(name, updateFunction, particleTypes){
    this.name=name;
    this.updateZone=updateFunction;
    this.particleTypes=particleTypes;
}
function ParticleType(Features){
    this.type=Features[0];
    this.color=Features[1];
    this.radio=Features[2];
    this.particles=new Array(0);
}
function Particle(position, speed){
    this.position=position;
    this.speed=speed;
}

function updateZones(){
    updateStates();
    zones[0].updateZone(zones[1]);zones[1].updateZone(zones[0],zones[2]);zones[2].updateZone(zones[1],zones[3]);zones[3].updateZone(zones[2]);
}
function updateStates(){
var del, zone, particleType, electron, argon;
    for (i=0; i<numZones-1;i++){
        zone=zones[i];
        for (j=0; j<zone.particleTypes[0].particles.length;j++){
            electron=zone.particleTypes[0].particles[j];
            del=false;
            for (k=0; k<zone.particleTypes[2].particles.length;k++){
                argon=zone.particleTypes[2].particles[k];
                if ((argon.position[0]-electron.position[0])**2+(argon.position[1]-electron.position[1])**2<r**2 & (electron.speed[0]-argon.speed[0])**2+(electron.speed[1]-argon.speed[1])**2>mediumSpeed){
                    zone.particleTypes[2].particles.splice(k, 1);
                    zone.particleTypes[1].particles.push(new Particle(argon.position,argon.speed ));				
                    k--;
                }
            }
            
        }
    }
    zone=zones[3];
    for (j=0; j<zone.particleTypes[0].particles.length;j++){
        electron=zone.particleTypes[0].particles[j];
        del=false;
        for (k=0; k<zone.particleTypes[1].particles.length & !del;k++){
            argon=zone.particleTypes[1].particles[k];
            
            if ((argon.position[0]-electron.position[0])**2+(argon.position[1]-electron.position[1])**2<9/4*r**2 ){
                zone.particleTypes[1].particles.splice(k, 1);
                zone.particleTypes[0].particles.splice(j, 1);
                zone.particleTypes[2].particles.push(new Particle(argon.position,argon.speed ));
                del=true;k--;j--;
            }
        }
    }
}	

function drawParticles(){
    var numParticles;ctx.beginPath();
    for (i=0; i<numZones; i++){
        particleTypes=zones[i].particleTypes;
        for (j=0; j<numParticleTypes; j++){
            ctx.fillStyle = particleTypes[j].color;
            particles=particleTypes[j].particles;
            numParticles=particles.length;
            for (k=0; k<numParticles; k++){
                particle=particles[k];
                ctx.beginPath();
                ctx.arc(particle.position[0], particle.position[1], particleTypes[j].radio, 0, Math.PI*2);
                ctx.fill();//ctx.stroke();
            }
        }
    }
}
function drawWalls(){
    ctx.fillStyle = 'purple';ctx.fillRect(l-2*g1, 3*g1, 2*g1, h-6*g1 );
    ctx.fillStyle = 'red';ctx.fillRect(0, 0, l/2-l2, g1 );ctx.fillRect(0, 0, g1, h );ctx.fillRect(0, h-g1, l/2-l2, g1 );
    ctx.fillStyle = 'orange';ctx.fillRect(0, h/2-5*l3/4, l3 , l3/4);ctx.fillRect(0, h/2+l3, l3 , l3/4);
    ctx.strokeStyle = 'orange';ctx.lineWidth = 3;
    ctx.beginPath();ctx.moveTo(7*l3/8, h/2-11*l3/8);ctx.arc(7*l3/8, h/2, 7*l3/8, 3*Math.PI /2 , 5*Math.PI/2);ctx.lineTo(7*l3/8, h/2+11*l3/8);ctx.stroke();
    ctx.fillStyle = 'blue';ctx.fillRect(l/2-h5, 0, h5, 6*h5 );ctx.fillRect(l/2-h5, h-6*h5, h5, 6*h5 );
    ctx.strokeStyle = 'blue';ctx.lineWidth = 3;
    ctx.beginPath();ctx.moveTo(l/2, 6*h5);ctx.lineTo(l/2, 6*h5+hr1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2, 6*h5+hr1+hr2);ctx.lineTo(l/2, 6*h5+2*hr1+hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2, 6*h5+2*hr1+2*hr2);ctx.lineTo(l/2, 6*h5+3*hr1+2*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2, 6*h5+3*hr1+3*hr2);ctx.lineTo(l/2, 6*h5+4*hr1+3*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2, 6*h5+4*hr1+4*hr2);ctx.lineTo(l/2, 6*h5+5*hr1+4*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2, 6*h5+5*hr1+5*hr2);ctx.lineTo(l/2, 6*h5+6*hr1+5*hr2);ctx.stroke();
    ctx.fillStyle = 'black';ctx.fillRect(l/2-l2, 0, l2-2*h5, h2+g1 );ctx.fillRect(l/2-l2, h-h2-g1, l2-2*h5, h2+g1 );ctx.fillRect(l/2-2*h5, 0, h5, 6*h5 );ctx.fillRect(l/2-2*h5, h-6*h5, h5, 6*h5 );
    ctx.strokeStyle = 'black';ctx.lineWidth = 3;
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5);ctx.lineTo(l/2-2*h5, 6*h5+hr1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5+hr1+hr2);ctx.lineTo(l/2-2*h5, 6*h5+2*hr1+hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5+2*hr1+2*hr2);ctx.lineTo(l/2-2*h5, 6*h5+3*hr1+2*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5+3*hr1+3*hr2);ctx.lineTo(l/2-2*h5, 6*h5+4*hr1+3*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5+4*hr1+4*hr2);ctx.lineTo(l/2-2*h5, 6*h5+5*hr1+4*hr2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(l/2-2*h5, 6*h5+5*hr1+5*hr2);ctx.lineTo(l/2-2*h5, 6*h5+6*hr1+5*hr2);ctx.stroke();
    ctx.fillStyle = 'brown';ctx.fillRect(l/2+h4/2, 0, h4/2 , h4);ctx.fillRect(l/2+h4/2, h-h4, h4/2 , h4);
    ctx.strokeStyle = 'brown';ctx.lineWidth = 3;
    ctx.beginPath();ctx.moveTo(l/2+3*h4/4, h4);ctx.lineTo(l/2+3*h4/4, h-h4);ctx.stroke();
    ctx.strokeStyle = 'green';ctx.lineWidth = 2;
    ctx.beginPath();ctx.moveTo(g1,h/2-8*h3/4);ctx.lineTo(g1,h/2-3*h3/4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(g1,h/2+3*h3/4);ctx.lineTo(g1,h/2+8*h3/4);ctx.stroke();
}
function drawData(){
ctx.strokeStyle = 'black';ctx.lineWidth = 1;ctx.beginPath();ctx.moveTo(0, h);ctx.lineTo(l, h);ctx.stroke();ctx.beginPath();ctx.moveTo(4*gw, h+5*gw);ctx.lineTo(l-4*gw, h+5*gw);ctx.stroke();ctx.beginPath();ctx.moveTo(4*gw, h+5*gw);ctx.lineTo(4*gw, h+10.5*gw);ctx.stroke();ctx.beginPath();ctx.moveTo(l-4*gw, h+5*gw);ctx.lineTo(l-4*gw, h+10.5*gw);ctx.stroke();ctx.beginPath();ctx.moveTo(l/2, h+5*gw);ctx.lineTo(l/2, h+10.5*gw);ctx.stroke();
ctx.font = gw*5+"px Times New Roman";ctx.fillStyle = 'black';ctx.fillText("Data:", 4*gw, h+4*gw);ctx.fillText("Flow = "+(flow/(h-6*g1)*1000/timeInterval).toFixed(1), l/2+1.5*gw, h+9*gw);ctx.fillText("[1/mm^2·s]", l-28*gw, h+9*gw);ctx.fillText("Time = "+(t*0.001).toFixed(3), 3*g1/2, h+9*gw);ctx.fillText("[μs]", l/2-3*g1, h+9*gw);
}
