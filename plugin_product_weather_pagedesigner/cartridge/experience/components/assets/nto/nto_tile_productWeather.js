'use strict';

const HttpClient = require('dw/net/HTTPClient');

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');





/**
 * Render logic for the assets.producttile.
 */
module.exports.render = function(context) {
  var model = new HashMap();
  var content = context.content;

  /*
  Get the geolocation data from the request object
  */
  var lat = request.geolocation.latitude;
  var long = request.geolocation.longitude;
  var city = request.geolocation.city;
  var state = request.geolocation.regionName;

/*
Call getWeather to retrieve the weather using the geolocation data
*/
  var results = getWeather(request, lat, long);
  var location = "";

  var product = null;
  var message = null;
  var debugMessage = "";

  /*
  parse the temperature from the web service response
  */
  var currentTemp = results.properties.periods[0].temperature;

  if(content.isDebug){
    debugMessage = "DEBUG: It's " + currentTemp + " in " + city + ", " + state + " :  " + request.geolocation.latitude + ", " + request.geolocation.longitude;
  }

  if(currentTemp < content.controlTemp)
  {
    product = content.productCold;
    message = content.productColdMessage;
    message = message.replace("<CITY>", city);
    message = message.replace("<STATE>", state)
  }
  else {
    product = content.productHot;
    message = content.productHotMessage;
    message = message.replace("<CITY>", city);
    message = message.replace("<STATE>", state)
  }


  if (product) {
    var images = product.getImages('large'); // make the product image type configurable by the component?
    var productImage = images.iterator().next();
    if (productImage) {
      model.image = {
        src: productImage.getAbsURL(),
        alt: productImage.getAlt()
      };
    }
  }




  model.product = product;
  model.bla="lalalal";
  model.message = message;
  model.debugMessage = debugMessage;
  model.loc = location;
  
  return new Template('experience/components/assets/nto/nto_tile_productWeather').render(model).text;
};


/**
 * Make REST call to NOAA weather service - this returns a week long weather forecast.. however,
 * it does NOT return the city / location the lat / long is based on so a separate call is
 * needed to get this info.
 * @param req
 * @param controlTemp
 * @param lat
 * @param long
 * @returns {string|any}
 */
function getWeather(req, lat, long) {

  var http = new HttpClient();

  http.open('GET', 'https://api.weather.gov/points/'+lat+','+long+'/forecast');
  http.setTimeout(7000);
  http.send();
  if (http.statusCode == 200)
  {
    var data = JSON.parse(http.text);
    return data;
  }
  else
  {
    // error handling
    message="An error occurred with status code "+http.statusCode;
    return "";
  }

  return "";
}


/**
 * Makes a GOOGLE GEOCODE REST call to get the users location info
 * @param req
 * @returns {string|*}
 */
function getLocationInfo(req, apiKey){

  var http2 = new HttpClient();
  var lat = req.geolocation.latitude;
  var long = req.geolocation.longitude;
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=' + apiKey
  http2.open('GET', url);
  http2.setTimeout(7000);
  http2.send();
  if (http2.statusCode == 200)
  {
    return JSON.parse(http2.text);
  }
  else
  {
    // error handling
    return "An error occurred with status code "+http2.statusCode;;
  }

  return "";

}
