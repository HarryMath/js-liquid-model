class Bubble {
	constructor(center, pointsAmount)	{
		this.center = center;
		this.radius = unirand(MIN_RADIUS, MAX_RADIUS) * Math.sqrt(DIAGONAL / 1200)
		this.amount = Math.round((this.radius + pointsAmount)/6)
		this.body = new Polygon([], [])
		this.speed_x = [];
		this.speed_y = [];

		for (let i = 0; i < this.amount; i++) {
			this.body.x.push( this.radius*0.99 * Math.cos(Math.PI/this.amount * 2*i) + center[0] )
			this.body.y.push( this.radius*0.99 * Math.sin(Math.PI/this.amount * 2*i) + center[1] )
			this.speed_x.push(0)
			this.speed_y.push(0)
		}
	}

	transX(i) {
		return this.radius * Math.cos(2*Math.PI/this.amount *i) + this.center[0] - this.body.x[i]
	}

	transY(i) {
		return this.radius * Math.sin(2*Math.PI/this.amount *i) + this.center[1] - this.body.y[i]
	}

	move() {
		this.center = this.body.findCenter()
		let distanceFromMidline = this.center[1] - HEIGHT/2
		const randX = unirand(-0.04, 0.04)
		const randY = unirand(-0.04, 0.04)
		if(randX > 2) console.log(randX)
		for(let i = 0; i < this.amount; i++) {
			const translateXold = this.transX(i);
			const translateYold = this.transY(i);
			let coefOld = 0.2; let coefNew = 0.8
			let translateX = this.center[0] - this.body.x[i]
			let translateY = this.center[1] - this.body.y[i]
			const distanceFromCenter = Math.sqrt(translateX*translateX + translateY*translateY)
			translateX = translateX*(distanceFromCenter - this.radius )/distanceFromCenter
			translateY = translateY*(distanceFromCenter - this.radius )/distanceFromCenter
			if(distanceFromCenter < this.radius*2) {
				let changeCoef = this.radius/distanceFromCenter/5
				coefOld += changeCoef
				coefNew -= changeCoef
				if(coefNew < 0) coefNew = 0
				if(coefOld > 1) coefOld = 1
				if(distanceFromCenter < this.radius*0.7) {
					this.body.x[i] += translateXold*0.1*(this.radius/(distanceFromCenter + 0.001))
					this.body.y[i] += translateYold*0.1*(this.radius/(distanceFromCenter + 0.001))
				}
			}
			this.speed_x[i] += F*(translateX*coefNew + translateXold*coefOld) + randX + G_x + unirand(-0.03, 0.03)
			this.speed_y[i] += F*(translateY*coefNew + translateYold*coefOld) + randY + G_y + unirand(-0.03, 0.03)
			if(this.speed_x[i]*this.speed_x[i] + this.speed_y[i]*this.speed_y[i] >= this.radius*this.radius/2) {
				this.speed_x[i] *= 0.98
				this.speed_y[i] *= 0.98
				this.body.x[i] += translateXold*0.2
				this.body.y[i] += translateYold*0.2
			}
			this.body.x[i] += this.speed_x[i]/1.4 + translateXold/110
			this.body.y[i] += this.speed_y[i]/1.4 + translateYold/110
			this.speed_x[i] *= 0.998
			this.speed_y[i] *= 0.998
		}
	}

	walls()	{
		for(let i = 0; i < this.amount; i++){
			if ((this.body.x[i] >= WIDTH - 10 - this.speed_x[i]) || (this.body.x[i] <= 10 - this.speed_x[i]))	{
				if (this.body.x[i] >= WIDTH - 10 - this.speed_x[i]) {
					this.body.x[i] = WIDTH - 10
				}else if (this.body.x[i] <= 10 - this.speed_x[i]) {
					this.body.x[i] = 10
				}
				this.speed_x[i] = -this.speed_x[i]
				this.speed_x[i] *= 0.9
				this.speed_y[i] *= 0.9
			}
			if ((this.body.y[i] >= HEIGHT - 10 - this.speed_y[i]) || (this.body.y[i] <= 10 - this.speed_y[i])) {
				if (this.body.y[i] >= HEIGHT - 10 - this.speed_y[i])	{
					this.body.y[i] = HEIGHT - 10
				} else if (this.body.y[i] <= 10 - this.speed_y[i]) {
					this.body.y[i] = 10
				}
				this.speed_y[i] = -this.speed_y[i]
				this.speed_x[i] *= 0.9
				this.speed_y[i] *= 0.9
			}
		}
	}
}