var map;
var currPosition;
var markers = [];
var to;
var infowindows = [];

cueApp.controller('DataCtrl', function($scope, $routeParams) {

	$scope.parPlaceId = $routeParams.placeId;
	$scope.parCatId = $routeParams.catId;
	$scope.parKeyword = $routeParams.keyword;

	$scope.noResultsText = 'No se encontaron resultados para la búsqueda';

	$scope.placeCat = '';
	$scope.placeName = '';
	$scope.placeAddress = '';
	$scope.placePhone = '';
	$scope.placeHistory = '';
	$scope.placeEmail = '';
	$scope.placeRating = '';
	$scope.placeLat = '';
	$scope.placeLon = '';

	$scope.placesResult = [];

	$scope.currLan = '1';

	$scope.sLoadHelp = function() {

		currPage = '2';

		if (localStorage.lan == '2') {
			changeLanguage('2');
			$scope.currLan = '2';
		}

	};

	$scope.sLoadHome = function() {

		currPage = '1';

		if (localStorage.lan == '2') {
			changeLanguage('2');
		}

		$scope.optionMap = 1;
		try {
			if (navigator.connection.type == Connection.NONE) {
				showCloseMessage('No tienes conexión a internet, para una mejor experiencia de uso te recomendamos acceder a Google Maps y descargar a Cuenca como una área sin conexión');
//				return;
			}
		} catch (e) {
			// TODO: handle exception
		}

		showLoading();

		if (map == undefined) {
			var script_tag = document.createElement('script');
			script_tag.setAttribute("type", "text/javascript");
			script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyCqOb4S3Xgw9iTtRV2EtAzstw6caUBptXg&callback=app.initMap");
			(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
		} else {
			app.initMap();
			hideLoading();
		}

	}

	$scope.sLoadSearch = function() {

		catToLoad = -1;
		currPage = '2';
		showLoading();

		ws.getPlacesByKeyword($scope.parKeyword).done(function(data) {
			$scope.$apply(function() {
				$scope.placesResult = data;
				if (localStorage.lan == '2') {
					$scope.noResultsText = 'No Results';
				}

			});
		}).fail(function(error) {

		}).always(function() {
			hideLoading();
		});

		if (localStorage.lan == '2') {
			changeLanguage('2');
		}

	};

	$scope.sLoadWelcome = function() {
		setTimeout(function() {
			window.location = "#/home"
		}, 5000);
	}

	$scope.sLoadDetail = function() {

		if (localStorage.lan == '2') {
			changeLanguage('2');
		}

		currPage = '3';
		catToLoad = -1;

		showLoading();

		ws.getPlaceByCatById($scope.parCatId, $scope.parPlaceId).done(function(data) {

			$scope.$apply(function() {
				$scope.placeName = data.name;
				$scope.placeAddress = data.address;
				$scope.placePhone = data.phones;
				$scope.placeEmail = data.email;
				$scope.placeHistory = data.desc;
				$scope.placeRating = data.rating;
				$scope.placeLat = data.lat;
				$scope.placeLon = data.lon;
				$scope.placeWeb = data.web;
				$scope.placeCat = $scope.parCatId;
				

				$('#carouselPlacePhotos').owlCarousel({
					loop : true,
					margin : 10,
					nav : true,
					items : 2,
					autoplay : 2000,
					nav : false,
				});

			});

		}).fail(function(error) {
		}).always(function() {
			hideLoading();
		});

	};

	$scope.positionSuccessForLocations = function() {
		showLoading('Cargando');
		ws.getAllPlaces().done(
				function(response) {

					$scope.$apply(function() {

						var catPlaces = response;
						if (catToLoad != -1) {
							catPlaces = [];
							$.each(response, function() {
								if (this.catId == catToLoad) {
									catPlaces.push(this);
								}
							})
							catToLoad = -1;
						}

						$scope.locations = catPlaces;
						// $scope.locations = locations;
						var bounds = new google.maps.LatLngBounds();

						var meMarker = new google.maps.Marker({
							position : {
								lat : currPosition.coords.latitude,
								lng : currPosition.coords.longitude
							},
							map : map,
						});

						bounds.extend(meMarker.getPosition());

						$.each($scope.locations, function() {
							var image = {
								url : this.catId == 1 ? 'img/mapMarkerFood.png' : this.catId == 2 ? 'img/mapMarkerBank.png' : this.catId == 3 ? 'img/mapMarkerMuseum.png' : this.catId == 4 ? 'img/mapMarkerBar.png' : 'img/mapMarkerHotel.png',
								scaledSize : new google.maps.Size(33, 50),
								origin : new google.maps.Point(0, 0),
								anchor : new google.maps.Point(0, 32)
							};

							var infoWindowCode = '<div id="content" class="infoLocation"> <div class="row"> <div class="col-xs-3 pad0 infoLocationImage"> <img class="w100" src="img/app/' + this.catId + '_1.jpg'
									+ '" /> </div> <div class="col-xs-9 pad0 infoLocationData"> <a href="javascript:void(0)" class="infoLocationName">' + this.name + '</a> <br> <span class="infoLocationAddress">' + this.shortDesc
									+ '</span></div> </div>	<div class="row bubbleButtons"> <div class="col-xs-6"><a href="#/detail/' + this.catId + '/' + this.id + '" class="bubbleButton">' + moreInformationText
									+ '</a></div><div class="col-xs-6"><a href="javascript:void(0)" class="bubbleButton" onclick="openRouteMap(' + this.lat + ',' + this.lon + ')">' + routeText + '</a></div></div>	</div>';

							var infowindow = new google.maps.InfoWindow({
								content : infoWindowCode
							});

							var etaMarker = new google.maps.Marker({
								position : {
									lat : this.lat,
									lng : this.lon
								},
								map : map,
								// shape:
								// shape,
								icon : image
							});
							infowindows.push(infowindow);
							etaMarker.addListener('click', function() {
								$.each(infowindows, function() {
									this.close();
								})
								infowindow.open(map, etaMarker);
							});

							bounds.extend(etaMarker.getPosition());
							markers.push(etaMarker);
						})
						map.fitBounds(bounds);

					});

				});

		hideLoading();
	};

	$scope.openRouteMapNg = function() {
		showLoading('Cargando');
		placeName = $scope.placeName;
		openRouteMap($scope.placeLat, $scope.placeLon);
	}

	$scope.filterMap = function(catId) {

		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers.length = 0;

	}

	$scope.shareOnFb = function() {
		showLoading('Cargando');
		window.plugins.socialsharing.shareViaFacebook($scope.placeName, null /* img */, $scope.placeWeb /* url */, function() {
			hideLoading();
		}, function(errormsg) {
			hideLoading();
		})

	};

	$scope.shareOnTw = function() {

		window.plugins.socialsharing.shareViaTwitter($scope.placeName + ' ' + $scope.placeHistory);

	};

});
