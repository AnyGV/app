cueApp.controller('TemplateCtrl', function($scope) {

	$scope.textSearch = '';

	$scope.lan = localStorage.lan;

	$scope.setLan = function(lan) {
		$scope.lan = lan + '';
		localStorage.setItem('lan', lan);

		if (lan == '2') {
			fileName = 'poisEn';
		} else {
			fileName = 'poisEs';
		}

		// window.location = '#/home';

		changeLanguage(lan);
		location.reload()

		$scope.toggleSidebar();

	};

	$scope.toggleSidebar = function() {
		$('#wrapper').toggleClass('toggled');
	};

	$scope.toHome = function() {
		$('#wrapper').removeClass('toggled');
	};

	$scope.goToSearch = function() {
		window.location = '#/search/' + $scope.textSearch;
		$scope.toggleSidebar();
	}

	$scope.filterMap = function(catId) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers.length = 0;
		catToLoad = catId;

		if (currPage != 1) {
			window.location = '#/home';
		} else {

			ws.getAllPlaces().done(
					function(response) {

						$scope.$apply(function() {

							var catPlaces = [];

							$.each(response, function() {
								if (this.catId == catId) {
									catPlaces.push(this);
								}
							})

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

								etaMarker.addListener('click', function() {
									infowindow.open(map, etaMarker);
								});

								bounds.extend(etaMarker.getPosition());
								markers.push(etaMarker);
							})
							map.fitBounds(bounds);

						});

					});
		}

		$scope.toggleSidebar();

	}

});
