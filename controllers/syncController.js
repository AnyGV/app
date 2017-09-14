var map;
var currPosition;
var markers = [];
var to;

impApp.controller('SyncCtrl', function($scope, $routeParams) {

	$scope.clientsState = 1;

	$scope.providersState = 1;

	$scope.productsState = 1;

	$scope.clientsSize = 0;

	$scope.providersSize = 0;

	$scope.productsSize = 0;

	$scope.lastSyncDate = 'Nunca';

	$scope.showSyncData = false;

	$scope.isClientsSync = false;

	$scope.isProductsSync = false;

	$scope.isProvidersSync = false;

	$scope.isDataUploaded = false;

	$scope.sLoadSyncData = function() {

//		var arrNumbers = [];
//
//		while (arrNumbers.length < 10) {
//			var newNumber = Math.floor(Math.random() * 10);
//			var exists = false;
//			for (var i = 0; i < arrNumbers.length; i++) {
//				if (newNumber == arrNumbers[i]) {
//					exists = true;
//					break;
//				}
//			}
//			if(!exists){
//				arrNumbers.push(newNumber);
//			}
//		}
//		
//		for (var i = 0; i < arrNumbers.length; i++) {
//			var div='<div class="numKey col-xs-3 col-sm-3 col-md-3 col-lg-3"><a onclick="">'+arrNumbers[i]+'</a></div>';
//			$('.numKeyboard').append(div);
//		}
//		
//		var div='<div class="numKey col-xs-6 col-sm-6 col-md-6 col-lg-6"><a onclick="">Borrar</a></div>';
//		$('.numKeyboard').append(div);
//		
//		console.log(arrNumbers);

		if (localStorage.syncDate != undefined) {
			$scope.lastSyncDate = localStorage.syncDate;
		}

		db.Clients.count(function(c) {
			$scope.$apply(function() {
				$scope.clientsSize = c;
				$scope.clientsState = 0;
			});
		});

		var currCount = 0;
		db.Farms.count(function(c) {
			currCount = c;
			db.Cargos.count(function(c) {
				currCount += c;
				$scope.$apply(function() {
					$scope.providersSize = currCount;
					$scope.providersState = 0;
				});
			});
		});

		db.Products.count(function(c) {
			$scope.$apply(function() {
				$scope.productsSize = c;
				$scope.productsState = 0;
			});
		});

	}

	$scope.startSync = function() {

		try {
			if (navigator.connection.type == Connection.NONE) {
				showCloseMessage('No tienes conexión a internet');
				return;
			}
		} catch (e) {
			// TODO: handle exception
		}

		$scope.clientsState = 1;
		$scope.providersState = 1;
		$scope.productsState = 1;

		$scope.isDataUploaded = false;
		var date = new Date();
		$scope.lastSyncDate = (date.getYear() + 1900) + '-' + ((date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + ((date.getDate() < 10) ? '0' + (date.getDate()) : date.getDate()) + ' ' + date.getHours() + ':'
				+ date.getMinutes() + ':' + date.getSeconds();

		localStorage.setItem('syncDate', $scope.lastSyncDate);

		var thisClientsSize = 0;
		db.Clients.clear().then(function() {
			ws.getClients().done(function(data) {
				thisClientsSize = data.length;
				$.each(data, function() {
					db.Clients.put(this);
				});
			}).fail(function(error) {
			}).always(function() {
				$scope.$apply(function() {
					$scope.clientsSize = thisClientsSize;
					$scope.clientsState = 2;
				});

				setTimeout(function() {
					$scope.$apply(function() {
						$scope.clientsState = 0;
					});
				}, 2000);
			});
		});

		var thisProvidersSize = 0;
		db.Farms.clear().then(function() {
			db.Cargos.clear().then(function() {
				ws.getProviders().done(function(data) {

					thisProvidersSize = data.farms.length + data.cargos.length;

					$.each(data.farms, function() {
						db.Farms.put(this);
					});
					$.each(data.cargos, function() {
						db.Cargos.put(this);
					});
				}).fail(function(error) {
				}).always(function() {
					$scope.$apply(function() {
						$scope.providersSize = thisProvidersSize;
						$scope.providersState = 2;
					});
					setTimeout(function() {
						$scope.$apply(function() {
							$scope.providersState = 0;
						});
					}, 2000);
				});
			});
		});

		var thisProductsSize = 0;
		db.Products.clear().then(function() {

			ws.getProducts().done(function(data) {
				thisProductsSize = data.length;
				$.each(data, function() {
					db.Products.put(this);
				});
			}).fail(function(error) {
			}).always(function() {
				$scope.$apply(function() {
					$scope.productsState = 2;
					$scope.productsSize = thisProductsSize;
				});
				setTimeout(function() {
					$scope.$apply(function() {
						$scope.productsState = 0;
					});
				}, 2000);
			})

		});

	}

});
