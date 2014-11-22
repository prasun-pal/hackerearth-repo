var API_KEY = 'b4e45bf3110dfad9827c397384915bd4b4950725';
var markers = [];
var loadMakers = function(callback){
	$.ajax({
	  type: 'GET',
	  async: 'false',
	  url: 'http://www.hackerearth.com/dataweave/v1/carPricesIndia/listUniqMakes/',
	  data: { api_key: API_KEY, page: '1', per_page: '20' },
	  jsonpCallback: 'jsonp',
	  dataType: 'jsonp',
	  success: function(results){
		var $makeSelect = $('#make');
		$.each(results.data, function(i, rec){
			$makeSelect.append('<option id="' + rec.make + '">' + rec.make + '</option>');
		});
		if(callback){
			callback.call(this);
		}
	   }
	});
};

var loadModel = function( makeName , callback ){
	var pageIndex = 1;
	var loadMore = function(results){
		var $models = $('#models');
		$.each(results.data, function(i, rec){
			$models.append('<option>' + rec.model + '</option>');
		});
		if(results.count - pageIndex * 10 > 0 ){
			pageIndex = pageIndex + 1;
			load(pageIndex);
		} else{
			if(callback){
				callback.call(this);
			}
		}
	};
	var load = function(pageIndex){
		$.ajax({
		  type: 'GET',
		  url: 'http://www.hackerearth.com/dataweave/v1/carPricesIndia/listUniqModels/',
		  data: { api_key: API_KEY, make: makeName, page: pageIndex, per_page: '10' },
		  jsonpCallback: 'jsonp',
		  dataType: 'jsonp',
		  success: loadMore 
		});
	};
	load(pageIndex);
};

var loadVariants = function(make, model , callback){
	var pageIndex = 1;
	var loadMoreVariants = function(results){
		var $variants = $('#variants');
		$.each(results.data, function(i, rec){
			$variants.append('<option>' + rec.variant + '</option>');
		});
		if(results.count - pageIndex * 10 > 0 ){
			pageIndex = pageIndex + 1;
			loadVariant(pageIndex);
		}else{
			if(callback)
				callback.call(this);
		}
	};
	var loadVariant = function(pageIndex){
		$.ajax({
		  type: 'GET',
		  url: 'http://www.hackerearth.com/dataweave/v1/carPricesIndia/listUniqVariants/',
		  data: { api_key: API_KEY, make: make, model: model, page: pageIndex, per_page: '10' },
		  jsonpCallback: 'jsonp',
		  dataType: 'jsonp',
		  success: loadMoreVariants 
		});
	};
	loadVariant(pageIndex);
};
var getGeocode = function(city, callback){
	$.ajax({
	  type: 'GET',
	  url: 'https://maps.googleapis.com/maps/api/geocode/json',
	  data: { address: city,
			  components:'country:IN',
			  key:'AIzaSyCuRUzrMW5LfH_woergNnow_O1NdsxBxmY' },
	  
	  success: function(data){
		if(callback){
			callback.call(this, data.results[0].geometry.location);
		}
	  } 
	});
}
var getPrice = function(city, make, callback){
	
	$.ajax({
	  type: 'GET',
	  url: 'http://www.hackerearth.com/dataweave/v1/carPricesIndia/findByMake/',
	  data: { api_key: API_KEY, make: make, city: city, page: '1', per_page: '200' },
	  jsonpCallback: 'jsonp',
	  dataType: 'jsonp',
	  success: function(data){
		if(callback)
			callback.call(this,data.data);
	  }
	});
}
var displayBallon = function(info){

	return function(data, status, xhr){
		var latlng =  new google.maps.LatLng(data.lat,data.lng);
		var marker = new google.maps.Marker({
			  position: latlng,
			  map: map
		  });
		markers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			info.open(map,marker);
		  });
	};
};
var bind = function(city, options, callback){
	getPrice(city, options.make, function(data){
		var obj = {};
		$.each(data, function(ind,val){
			if( val.make === options.make && val.model === options.model && val.variant === options.variant){
				obj.price = val.price;
			}
		});
		var info = new google.maps.InfoWindow({
			  content: '<div>' + city + '</div><div>' + obj.price + '</div>'
		  });
		
		getGeocode(city, displayBallon(info));
		if(callback){
			callback.call(this);
		}
	});
};
var displayInMap = function (options, callback){
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	bind(options.city1, options, function(){
		bind(options.city2, options, function(){
			bind(options.city3, options, function(){
				bind(options.city4, options, function(){
					if(callback)
						callback.call(this);
				});
			});
		});
	});
};