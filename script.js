const cvsFront = document.getElementById('canvasFront');
const cvsBack = document.getElementById('canvasBack')
let ctxFront = cvsFront.getContext('2d');
let ctxBack = cvsBack.getContext('2d');
// ctxBack.filter = 'blur(6px) contrast(1500%) saturate(1%) brightness(950%)'
// ctxFront.filter = 'blur(7px) contrast(15)'

let WIDTH = Math.round(window.innerWidth) 
let HEIGHT = Math.round(window.innerHeight)
let DIAGONAL = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight)
let prevDiagonal = DIAGONAL

let G_x = 0 // (m/s^2)
let G_y = 0
var gravity = false
const F_stop = 0.0011 // (H)
const F_stop_kick = 0.00031 // (H)
let F_dist = 3 // 1000
let F = 0.05

const MIN_RADIUS = 19 // (pixel)
const MAX_RADIUS = 100 //pixel
const POINTS_IN_BUBBLE = 50 // (amount)
const BUBBLES = 15
let smoothing = WIDTH * HEIGHT < 400 * 700 && !isIOS();

cvsFront.height = HEIGHT
cvsFront.width = WIDTH
cvsBack.height = HEIGHT
cvsBack.width = WIDTH

let Bubbles = []
let polygonsToDraw = []
let exceptions = {}

setUpSmoothing()
generate()
process()

function isIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

if ('ondevicemotion' in window && window.innerWidth < 700) {
    gravity = true;
    window.addEventListener('devicemotion', function(event) {
        G_x = -event.accelerationIncludingGravity.x * 0.015
        G_y = event.accelerationIncludingGravity.y * 0.015
    });
}

window.addEventListener('resize', function(event) {
	let m;
	WIDTH = Math.round(window.innerWidth)
	HEIGHT = Math.round(window.innerHeight)
	DIAGONAL = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight)
	cvsFront.height = HEIGHT
	cvsFront.width = WIDTH
	cvsBack.height = HEIGHT
	cvsBack.width = WIDTH
	smoothing = WIDTH * HEIGHT < 400 * 700 && !isIOS();
	setUpSmoothing()
	Bubbles.forEach(b => {
		b.radius = b.radius * Math.sqrt(DIAGONAL / prevDiagonal)
	})
	prevDiagonal = DIAGONAL
});


function generate(){
	for(let m = 0; m < BUBBLES; m++)	{
		Bubbles.push(new Bubble
			(
				[
					MAX_RADIUS+m*(WIDTH-MAX_RADIUS*2)/BUBBLES,
					unirand(MAX_RADIUS+5, HEIGHT-MAX_RADIUS-5)
				],
				POINTS_IN_BUBBLE
			)
		)
	}
}

function debugCurve(ctx, polygons, color) {
	ctx.strokeStyle = color
	ctx.lineWidth = 1;
	polygons.forEach(p => {
		if(p) {
			ctx.beginPath()
			ctx.moveTo(p.x[0], p.y[0]);
			for(let i = 1; i < p.x.length; i++) {
				//ctxFront.lineTo(p.x[i], p.y[i])
				const xc = (p.x[i] + p.x[i + 1]) / 2;
				const yc = (p.y[i] + p.y[i + 1]) / 2;
				ctx.quadraticCurveTo(p.x[i], p.y[i], xc, yc);
			}
			ctx.lineTo(p.x[0], p.y[0])
			ctx.stroke();
			ctx.closePath()
		}	
	})
}

function fillBubbles(ctx, polygons, color) {
	ctx.fillStyle = color
	polygons.forEach(p => {
		if(p) {
			ctx.beginPath()
			ctx.moveTo(p.x[0], p.y[0]);
			for(let i = 1; i < p.x.length - 1; i++) {
				const xc = (p.x[i] + p.x[i + 1]) / 2;
				const yc = (p.y[i] + p.y[i + 1]) / 2;
				ctx.quadraticCurveTo(p.x[i], p.y[i], xc, yc);
			}
			ctx.fill()
			ctx.closePath()
		}	
	})
}

function drawBubbles(polygons, colorBack, colorFront) {
	ctxBack.fillStyle = colorBack[0]
	ctxBack.fillRect(0, 0, WIDTH, HEIGHT)
	ctxBack.fillStyle = colorBack[1]
	ctxBack.strokeStyle = colorBack[1]
	ctxBack.lineWidth = smoothing ? 1 : Math.round(3 + (WIDTH + HEIGHT) / 1000);
	ctxFront.fillStyle = colorFront[0]
	ctxFront.fillRect(0, 0, WIDTH, HEIGHT)
	ctxFront.fillStyle = colorFront[1]
	polygons.forEach(bubble => {
		p = bubble.body
		if(p) {
			ctxBack.beginPath()
			ctxBack.moveTo(p.x[p.x.length - 1], p.y[p.x.length - 1])
			ctxFront.beginPath()
			ctxFront.moveTo(p.x[p.x.length - 1], p.y[p.x.length - 1])
			for(let i = 0; i < p.x.length - 1; i++) {
				const xc = (p.x[i] + p.x[i + 1]) / 2;
				const yc = (p.y[i] + p.y[i + 1]) / 2;
				ctxBack.quadraticCurveTo(p.x[i], p.y[i], xc, yc);
				ctxFront.quadraticCurveTo(p.x[i], p.y[i], xc, yc);
			}
			const xc = (p.x[p.x.length - 1] + p.x[0]) / 2;
			const yc = (p.y[p.x.length - 1] + p.y[0]) / 2;
			ctxBack.quadraticCurveTo(p.x[p.x.length - 1], p.y[p.x.length - 1], xc, yc);
			ctxFront.quadraticCurveTo(p.x[p.x.length - 1], p.y[p.x.length - 1], xc, yc);

			ctxBack.stroke();
			ctxBack.fill();
			ctxBack.closePath()
			ctxFront.fill();
			ctxFront.closePath()
		}	
	})
}

cvsFront.addEventListener('click', function(event) {
	Bubbles.forEach(bubble => {
		for(let i = 0; i < bubble.body.x.length; i++) {
			const distanceX = bubble.body.x[i] - event.clientX
			const distanceY = bubble.body.y[i] - event.clientY
			if(distanceX > 1) {
				bubble.speed_x[i] += F_dist * (( DIAGONAL - distanceX ) / DIAGONAL)**6
			} else if(distanceX < 1) {
				bubble.speed_x[i] -= F_dist * (( DIAGONAL + distanceX ) / DIAGONAL)**6
			}
			if(distanceY > 1) {
				bubble.speed_y[i] += F_dist * (( DIAGONAL - distanceY ) / DIAGONAL)**6
			} else if(distanceY < 1) {
				bubble.speed_y[i] -= F_dist * (( DIAGONAL + distanceY ) / DIAGONAL)**6
			}
		}
	})
})


function kicks(){
	polygonsToDraw = []
	exceptions = {}
	for(let i = 0; i < BUBBLES; i++)	{
		let hasIntersections = false
		for(let j = i + 1; j < BUBBLES; j++) {
			if(distance(Bubbles[i].center[0], Bubbles[i].center[1], Bubbles[j].center[0], Bubbles[j].center[1]) < 1.3*(Bubbles[i].radius + Bubbles[j].radius)) {
				if(Bubbles[i].body.intersectWith(Bubbles[j].body)) {
					if(i in exceptions) {
						if(j in exceptions) {
							if(exceptions[i] !== exceptions[j] && polygonsToDraw[exceptions[j]] && polygonsToDraw[exceptions[i]]) {
								polygonsToDraw[exceptions[i]] = polygonsToDraw[exceptions[i]]
									.uniteWith(polygonsToDraw[exceptions[j]])
								polygonsToDraw[exceptions[j]] = false
								exceptions[j] = exceptions[i]
							}
						} else {
							polygonsToDraw[exceptions[i]] = polygonsToDraw[exceptions[i]].uniteWith(Bubbles[j].body)
							exceptions[j] = exceptions[i]
						}
					} else if(j in exceptions) {
						if(i in exceptions) {
							if(exceptions[i] !== exceptions[j] && polygonsToDraw[exceptions[j]] && polygonsToDraw[exceptions[i]]) {
								polygonsToDraw[exceptions[j]] = polygonsToDraw[exceptions[j]]
									.uniteWith(polygonsToDraw[exceptions[i]])
								polygonsToDraw[exceptions[i]] = false
								exceptions[i] = exceptions[j]
							}
						} else {
							polygonsToDraw[exceptions[j]] = polygonsToDraw[exceptions[j]].uniteWith(Bubbles[i].body)
							exceptions[i] = exceptions[j]
						}
					} else {
						polygonsToDraw.push(Bubbles[i].body.uniteWith(Bubbles[j].body))
						exceptions[i] = polygonsToDraw.length-1
						exceptions[j] = polygonsToDraw.length-1
					}
					hasIntersections = true
					break
				}
			}
		}
		//if(!hasIntersections) {
			polygonsToDraw.push(Bubbles[i].body)
		//}
	}
	let falseIndex = polygonsToDraw.indexOf(false)
	let counter = 0
	while (falseIndex != -1) {
		polygonsToDraw =  deleteFromArray(polygonsToDraw, falseIndex)
		falseIndex = polygonsToDraw.indexOf(false)
		counter ++
		if(counter > 10) break;
	}
	return polygonsToDraw
}

function process() {
	// polygonsToDraw = kicks()
	Bubbles.forEach(bubble => {
		bubble.move()
		bubble.move()
		bubble.walls()
	})
	if (smoothing) {
		drawBubbles(
			Bubbles,
			['rgba(0, 0, 200, 1)', 'rgba(0, 0, 0, 1)'],
			['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)']
		)
	} else {
		drawBubbles(
			Bubbles,
			['rgba(140, 150, 170, 0.7)', 'rgba(0, 0, 0, 1)'],
			['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)']
		)
	}
	requestAnimationFrame(process);
}

function toggleSmoothing() {
	smoothing = !smoothing
	setUpSmoothing()
}

function setUpSmoothing() {
	if (smoothing) {
		cvsFront.className = 'front front-smooth'
		cvsBack.className = 'back back-smooth'
	} else {
		cvsFront.className = 'front'
		cvsBack.className = 'back'
	}
}
