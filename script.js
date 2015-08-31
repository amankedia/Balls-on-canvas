var check = document.getElementById("check");
var check_ctx = check.getContext("2d");
var colors = ["red", "green", "yellow", "cyan", "orange", "white", "pink"];
starttoanimate();
balls = [];
function init() {
	check_ctx.fillStyle = "#FF0000";
	check_ctx.fillRect(0, 0, check.width, check.height);
}

function createBall(x, y) {
	var col = colors[parseInt(colors.length*Math.random())];
	var ball = new Ball(check_ctx, col, x, y, 15);
	ball.vel.x = Math.pow(-1, parseInt(Math.random()*1))*40*Math.random();
	ball.vel.y = -120*Math.random();
	return ball;
}

var gravity = {
	x: 0,
	y: 2*9.8
};

function draw() {
	init();
	for (var i=0; i<balls.length; ++i) {
		balls[i].draw();
	}
}

function withinBoundary(ball, x, y) {
	var res = {x:false, y:false};
	if ((x+ball.radius < check.width) && 
		(x-ball.radius > 0)) {
		res.x = true;
	}
	if ((y+ball.radius < check.height) &&
		(y-ball.radius > 0)) {
		res.y = true;
	}
	return res;
}

function starttoanimate() {
	start = window.performance.now();
	function callback(timestamp) {
		var timesofar = timestamp - start;
		for (var i = 0; i < balls.length; ++i) {
			var ball = balls[i];
			var wall = withinBoundary(ball, ball.get_next_pos().x, ball.get_next_pos().y);
			if (wall.x === false) {
				ball.vel.x *= -0.6;
			}
			if (wall.y === false) {
				ball.vel.y *= -0.6;
			}
			for (var j=0; j < balls.length; ++j) {
				if (i == j) continue;
				var other = balls[j];
				if (ball.isCollidingWith(other)) {
					var theta = Math.atan((ball.y - other.y)/(ball.x - other.x));
					var v_x = -0.5*(ball.vel.x+other.vel.x)*0.6*Math.cos(theta);
					var v_y = -0.5*(ball.vel.y+other.vel.y)*0.6*Math.sin(theta);
					ball.vel.x = v_x;
					ball.vel.y = v_y;
				}
			}
			if (withinBoundary(ball, ball.get_next_pos().x, ball.get_next_pos().y).y == false) {
				ball.vel.y = 0;
				ball.vel.x = ball.vel.x/1.01;
				ball.y = check.height - ball.radius;
			}
		}
		for (var i=0; i < balls.length; ++i)
			balls[i].move();
		draw();
		if (true||timesofar < 6000) {
			window.requestAnimationFrame(callback);
		}
	}
	window.requestAnimationFrame(callback);
}
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
check.addEventListener('click', function(evt) {
	var mousePos = getMousePos(check, evt);
	balls.push(createBall(mousePos.x, mousePos.y));
}, false);
var Ball = function(ctx, color, x, y, r) {
	this.x = x;
	this.y = y;
	this.radius = r;
	this.ctx = ctx;
	this.color = color;
	this.vel = {
		x: 0,
		y: 0
	};
	this.move = function() {
		var t = 5/60;
		this.x = this.x + t*this.vel.x + 1/2*t*t*(gravity.x);
		this.y = this.y + t*this.vel.y + 1/2*t*t*(gravity.y);
		this.vel.x = this.vel.x + gravity.x*t;
		this.vel.y = this.vel.y + gravity.y*t;
	}
	this.draw = function() {
		var circle = new Path2D();
		circle.moveTo(this.x, this.y);
		this.ctx.fillStyle = this.color;
		circle.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		this.ctx.fill(circle);
	}
	this.get_next_pos = function() {
		var t = 5/60;
		res = {x:0, y:0};
		res.x = this.x + t*this.vel.x + 1/2*t*t*(gravity.x);
		res.y = this.y + t*this.vel.y + 1/2*t*t*(gravity.y);
		return res;
	}
	this.isCollidingWith = function(other) {
		var pos = this.get_next_pos();
		return (Math.sqrt(Math.pow((pos.x - other.x), 2.0) + Math.pow((pos.y - other.y), 2.0)) < 2*this.radius);
	}
};