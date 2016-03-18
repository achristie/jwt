(function () {
	var app = angular.module('app', [], function config($httpProvider) {
		//invoke AuthInterceptor on every $http request
		$httpProvider.interceptors.push('AuthInterceptor');
	});
	
	app.constant('API_URL', 'http://localhost:3000');
	
	app.controller('MainCtrl', function (RandomUserFactory, UserFactory) {
		var vm = this;
		
		UserFactory.getUser().then(function (res) {
			vm.user = res.data.user;
		}, handleError);
		
		vm.getRandomUser = function () {
			RandomUserFactory.getUser().then(function (d) {
				vm.randomUser = d.data;
			});
		};
		
		vm.login = function (userId, password) {
			UserFactory.login(userId, password).then(function (res) {
				vm.user = res.data.user;
			}, handleError);
		};
		
		vm.logout = function () {
			UserFactory.logout();
			vm.user = null;
		};
		
		function handleError (err) {
			console.log('Error: ' + err.data);
		}
	});
	
	app.factory('UserFactory', function ($http, $q, API_URL, AuthTokenFactory) {
		return {
			login: function (userId, password) {
				return $http.post(API_URL + '/login', {
					userId: userId,
					password: password
				}).then(function (res) {
					AuthTokenFactory.setToken(res.data.token);
					return res;
				});
			},
			logout: function () {
				AuthTokenFactory.setToken();
			},
			getUser: function () {
				if (AuthTokenFactory.getToken()) {
					return $http.get(API_URL + '/me');
				} else {
					return $q.reject({data: 'client has no auth token'});
				}
			}
		};
	});
	
	app.factory('RandomUserFactory', function ($http, API_URL) {
		return {
			getUser: function () {
				return $http.get(API_URL + '/random-user');
			}
		};
	});
	
	//store auth token in local storage
	app.factory('AuthTokenFactory', function ($window) {
		var store = $window.localStorage;
		var key = 'auth-token';
		
		return {
			getToken: function () {
				return store.getItem(key);
			},
			setToken: function (token) {
				if (token) {
					store.setItem(key, token);
				} else {
					store.removeItem(key);
				}
			}
		};
	});
	
	//add auth token to authorization header
	app.factory('AuthInterceptor', function (AuthTokenFactory) {
		return {
			request: function addToken(config) {
				var token = AuthTokenFactory.getToken();
				if (token) {
					config.headers = config.headers || {};
					config.headers.Authorization = 'Bearer ' + token;
				}
				return config;
			}
		}
	});
})();