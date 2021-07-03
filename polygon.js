class Polygon {
	constructor(x, y) {
		this.x = x
		this.y = y
	}

	findCenter() {
		let result = [0, 0];
		for(let i = 0; i < this.x.length; i++) {
			result[0] += this.x[i]
			result[1] += this.y[i]
		}
		result[0] /= this.x.length
		result[1] /= this.x.length
		return result;
	}

	insideQ(x, y) {
		let parity = 0;
		for (let i = 0; i < this.x.length - 1; i++) {
			let v = {
				'x1': this.x[i],
				'y1': this.y[i],
				'x2': this.x[i + 1],
				'y2': this.y[i + 1]
			}
			switch (edgeType(v, x, y)) {
				case 0:
					return true
					break
				case 1:
					parity = 1 - parity
					break
			}
		}
		let v = {
			'x1': this.x[this.x.length - 1],
			'y1': this.y[this.y.length - 1],
			'x2': this.x[0],
			'y2': this.y[0]
		}
		switch (edgeType(v, x, y)) {
			case 0:
				return true
				break;
			case 1:
				parity = 1 - parity;
				break;
		}
		return parity !== 0;
	}

	intersectQ(x1, x2, y1, y2) {
		let inside1 = this.insideQ(x1, y1)
		let inside2 = this.insideQ(x2, y2)
		return inside1 !== inside2
	}

	findNearestPoint(x, y) {
		let res = 0;
		let minDistance = distance(x, y, this.x[0], this.y[0])
		for(let i = 1; i < this.x.length; i++) {
			let dist = distance(x, y, this.x[i], this.y[i])
			if(dist < minDistance) {
				res = i
				minDistance = dist
			}
		}
		return res
	}

	findFarthestPoint(x, y) {
		let res = 0;
		let maxDistance = distance(x, y, this.x[0], this.y[0])
		for(let i = 1; i < this.x.length; i++) {
			let dist = distance(x, y, this.x[i], this.y[i])
			if(dist > maxDistance) {
				res = i
				maxDistance = dist
			}
		}
		return res
	}

	intersectWith(polygon) {
		for(let i = 0; i < polygon.x.length - 1; i++) {
			if(this.intersectQ(
				polygon.x[i], polygon.x[i+1],
				polygon.y[i], polygon.y[i+1]
			)) return true
		}
		return this.intersectQ(
			polygon.x[0], polygon.x[polygon.x.length - 1],
			polygon.y[0], polygon.x[polygon.y.length - 1]
		)
	}

	uniteWith(polygon) {
		let newX = [[[],[]],[[],[]]]
		let newY = [[[],[]],[[],[]]]
		let thisCenter = this.findCenter()
		let anotherCenter = polygon.findCenter()
		const thisFarthest = this.findFarthestPoint(anotherCenter[0], anotherCenter[1])
		const anotherFarthest = polygon.findFarthestPoint(thisCenter[0], thisCenter[1])
		let anotherX = regroupArray(polygon.x, anotherFarthest)
		let anotherY = regroupArray(polygon.y, anotherFarthest)

		for(let i = 0; i < anotherX.length; i++) {
			if(!this.insideQ(anotherX[i], anotherY[i])) {
				newX[0][0].push(anotherX[i])
				newY[0][0].push(anotherY[i])
			} else {
				break
			}
		}
		anotherX = anotherX.reverse()
		anotherY = anotherY.reverse()
		for(let i = 0; i < anotherX.length; i++) {
			if(!this.insideQ(anotherX[i], anotherY[i])) {
				newX[0][1].push(anotherX[i])
				newY[0][1].push(anotherY[i])
			} else {
				anotherX = null; anotherY = null;
				break
			}
		}
		newX[0] = newX[0][1].reverse().concat(newX[0][0])
		newY[0] = newY[0][1].reverse().concat(newY[0][0])

		let thisX = regroupArray(this.x, thisFarthest)
		let thisY = regroupArray(this.y, thisFarthest)
		for(let i = 0; i < thisX.length; i++) {
			if(!polygon.insideQ(thisX[i], thisY[i])) {
				newX[1][0].push(thisX[i])
				newY[1][0].push(thisY[i])
			} else {
				break
			}
		}
		thisX = thisX.reverse()
		thisY = thisY.reverse()
		for(let i = 0; i < thisX.length; i++) {
			if(!polygon.insideQ(thisX[i], thisY[i])) {
				newX[1][1].push(thisX[i])
				newY[1][1].push(thisY[i])
			} else {
				thisX = null; thisY = null;
				break
			}
		}
		newX[1] = newX[1][1].reverse().concat(newX[1][0])
		newY[1] = newY[1][1].reverse().concat(newY[1][0])
		if(	distance(
				newX[0][newX[0].length - 1], newY[0][newY[0].length - 1],
				newX[1][newX[1].length - 1], newY[1][newY[1].length - 1],
			) < distance(
				newX[0][newX[0].length - 1], newY[0][newY[0].length - 1],
				newX[1][0], newY[1][0],
			)
		) {
			newX = newX[0].concat(newX[1].reverse())
			newY = newY[0].concat(newY[1].reverse())
		} else {
			newX = newX[0].concat(newX[1])
			newY = newY[0].concat(newY[1])
		}
		return new Polygon(newX, newY)
	}
}
 
// проверяем расположение точки 
// (слева от вектора, справа от вектора, или принадлежит вектору)
function classify(vector, x1, y1) {
	const pr = (vector.x2 - vector.x1) * (y1 - vector.y1) -
		(vector.y2 - vector.y1) * (x1 - vector.x1);
	if (pr > 0)
        return 1;
    if (pr < 0)
        return -1;
    return 0;
}
// классифицируем ребро (Касается, пересекает или безразлично)
function edgeType(vector, x, y) {
    switch (classify(vector, x, y)) {
        case 1:
            return ( (vector.y1 < y) && (y <= vector.y2) ) ? 1 : 2;
            break;
        case -1:
            return ((vector.y2 < y) && (y <= vector.y1)) ? 1 : 2;
			break;
        case 0:
            return 0;
			break;
    }
}

function regroupArray(array, index) {
	return array.slice(index, array.length).concat(array.slice(0, index))
}

function deleteFromArray(array, index) {
	return array.slice(0, index).concat(array.slice(index+1, array.length))
}



function distance(x1, y1, x2, y2){
	return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) )
}

function unirand(min, max){
	return Math.random() * (max-min) + min;
}

function defangle(sin, cos){
	let alpha;
	if(Math.abs(sin) > 1 || Math.abs(cos) > 1) {
		sin = sin/Math.sqrt(sin*sin + cos*cos)
	}
 	if(Math.asin(sin) >= 0 ) {
		alpha = Math.acos(cos);
 	}
	else if(Math.acos(cos) <= Math.PI/2 ) {
		alpha = Math.asin(sin);
	}
	else {
		alpha = Math.abs(Math.asin(sin)) + Math.PI;
	}
	return alpha;
} 

function graham(x, y) {
	let i;
	let minIndex = 0; //номер нижней левой точки
	let min = x[0];
	let sortIndexes = [0]
	// ищем нижнюю левую точку
	for (i = 1; i < x.length; i++) {
		sortIndexes.push(i)
		if (x[i] < min) {
			min = x[i];
			minIndex = i;
		}
	}
	// делаем нижнюю левую точку активной
	sortIndexes[0] = minIndex;
	sortIndexes[minIndex] = 0;
	// сортируем вершины в порядке "левизны"
	for (i = 1; i < sortIndexes.length - 1; i++) {
		for (let j = i + 1; j < ch.length; j++) {
			const cl = classify({
				'x1': x[sortIndexes[0]],
				'y1': y[sortIndexes[0]],
				'x2': x[sortIndexes[i]],
				'y2': y[sortIndexes[i]]
			}, x[sortIndexes[j]], y[sortIndexes[j]]);
			// если векторное произведение меньше 0, следовательно вершина j левее вершины i.Меняем их местами
			if (cl < 0) {
				const temp = sortIndexes[i];
				sortIndexes[i] = sortIndexes[j];
				sortIndexes[j] = temp;
			}
		}
	}
	//записываем в стек вершины, которые точно входят в оболочку
	let result = {
		"x": [x[sortIndexes[0]], x[sortIndexes[1]]],
		"y": [y[sortIndexes[0]], y[sortIndexes[1]]]
	};
	for (i = 2; i < sortIndexes.length; i++) {
		while (classify({
			'x1': result[result.length - 2].x,
			'y1': result[result.length - 2].y,
			'x2': result[result.length - 1].x,
			'y2': result[result.length - 1].y
		}, x[sortIndexes[i]], y[sortIndexes[i]]) < 0) {
			result.pop(); // пока встречается правый поворот, убираем точку из оболочки
		}
		result.x.push(x[sortIndexes[i]])
		result.y.push(y[sortIndexes[i]]) // добавляем новую точку в оболочку
	}
	return result
}