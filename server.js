var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var jwtSecret = 'abcdefghijklmnopqrstuvwxyz';

var user = {
	userId: 'awc',
	password: 'p1'
};

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/random-user', function (req, res) {
	var user = faker.helpers.userCard();
	user.avatar = faker.image.avatar();
	res.json(user);
});

app.post('/login', authenticate, function (req, res) {
	var token = jwt.sign({
		userId: user.userId
	}, jwtSecret);
	res.send({
		token: token,
		user: user
	});
});

app.listen(3000, function () {
	console.log('App listening on port 3000');
});


function authenticate(req, res, next) {
	var body = req.body;
	if (!body.userId || !body.password) {
		res.status(400).end('You must provide a user id and password');
	}
	if (body.userId !== user.userId || body.password !== user.password) {
		res.status(401).end('The user id or password is incorrect');
	}
	
	next();
};