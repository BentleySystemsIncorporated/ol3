/**
 * @license
 * Latitude/longitude spherical geodesy formulae taken from
 * http://www.movable-type.co.uk/scripts/latlong.html
 * Licensed under CC-BY-3.0.
 */

// FIXME add intersection of two paths given start points and bearings
// FIXME add rhumb lines

goog.provide('ol.Sphere');

goog.require('goog.math');



/**
 * @classdesc
 * Class to create objects that can be used with {@link
 * ol.geom.Polygon.circular}.
 *
 * For example to create a sphere whose radius is equal to the semi-major
 * axis of the WGS84 ellipsoid:
 *
 * ```js
 * var wgs84Sphere= new ol.Sphere(6378137);
 * ```
 *
 * @constructor
 * @param {number} radius Radius.
 * @api
 */
ol.Sphere = function(radius) {

  /**
   * @type {number}
   */
  this.radius = radius;

};


/**
 * Returns the geodesic area for a list of coordinates.
 *
 * [Reference](http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409)
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
 * Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
 * Laboratory, Pasadena, CA, June 2007
 *
 * @param {Array.<ol.Coordinate>} coordinates List of coordinates of a linear
 * ring. If the ring is oriented clockwise, the area will be positive,
 * otherwise it will be negative.
 * @return {number} Area.
 * @api
 */
ol.Sphere.prototype.geodesicArea = function(coordinates) {
  var area = 0, len = coordinates.length;
  var x1 = coordinates[len - 1][0];
  var y1 = coordinates[len - 1][1];
  for (var i = 0; i < len; i++) {
    var x2 = coordinates[i][0], y2 = coordinates[i][1];
    area += goog.math.toRadians(x2 - x1) *
        (2 + Math.sin(goog.math.toRadians(y1)) +
        Math.sin(goog.math.toRadians(y2)));
    x1 = x2;
    y1 = y2;
  }
  return area * this.radius * this.radius / 2.0;
};


/**
 * Returns the distance from c1 to c2 using the haversine formula.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 2.
 * @return {number} Haversine distance.
 * @api
 */
ol.Sphere.prototype.haversineDistance = function(c1, c2) {
  var lat1 = goog.math.toRadians(c1[1]);
  var lat2 = goog.math.toRadians(c2[1]);
  var deltaLatBy2 = (lat2 - lat1) / 2;
  var deltaLonBy2 = goog.math.toRadians(c2[0] - c1[0]) / 2;
  var a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
      Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
      Math.cos(lat1) * Math.cos(lat2);
  return 2 * this.radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


/**
 * Returns the point at `fraction` along the segment of the great circle passing
 * through c1 and c2.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 2.
 * @param {number} fraction Fraction.
 * @return {ol.Coordinate} Coordinate between c1 and c2.
 */
ol.Sphere.prototype.interpolate = function(c1, c2, fraction) {
  var lat1 = goog.math.toRadians(c1[1]);
  var lon1 = goog.math.toRadians(c1[0]);
  var lat2 = goog.math.toRadians(c2[1]);
  var lon2 = goog.math.toRadians(c2[0]);
  var cosLat1 = Math.cos(lat1);
  var sinLat1 = Math.sin(lat1);
  var cosLat2 = Math.cos(lat2);
  var sinLat2 = Math.sin(lat2);
  var cosDeltaLon = Math.cos(lon2 - lon1);
  var d = sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosDeltaLon;
  if (1 <= d) {
    return c2.slice();
  }
  d = fraction * Math.acos(d);
  var cosD = Math.cos(d);
  var sinD = Math.sin(d);
  var y = Math.sin(lon2 - lon1) * cosLat2;
  var x = cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosDeltaLon;
  var theta = Math.atan2(y, x);
  var lat = Math.asin(sinLat1 * cosD + cosLat1 * sinD * Math.cos(theta));
  var lon = lon1 + Math.atan2(Math.sin(theta) * sinD * cosLat1,
                              cosD - sinLat1 * Math.sin(lat));
  return [goog.math.toDegrees(lon), goog.math.toDegrees(lat)];
};


/**
 * Returns the maximum latitude of the great circle defined by bearing and
 * latitude.
 *
 * @param {number} bearing Bearing.
 * @param {number} latitude Latitude.
 * @return {number} Maximum latitude.
 */
ol.Sphere.prototype.maximumLatitude = function(bearing, latitude) {
  return Math.cos(Math.abs(Math.sin(goog.math.toRadians(bearing)) *
                           Math.cos(goog.math.toRadians(latitude))));
};


/**
 * Returns the midpoint between c1 and c2.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 2.
 * @return {ol.Coordinate} Midpoint.
 */
ol.Sphere.prototype.midpoint = function(c1, c2) {
  var lat1 = goog.math.toRadians(c1[1]);
  var lat2 = goog.math.toRadians(c2[1]);
  var lon1 = goog.math.toRadians(c1[0]);
  var deltaLon = goog.math.toRadians(c2[0] - c1[0]);
  var Bx = Math.cos(lat2) * Math.cos(deltaLon);
  var By = Math.cos(lat2) * Math.sin(deltaLon);
  var cosLat1PlusBx = Math.cos(lat1) + Bx;
  var lat = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
                       Math.sqrt(cosLat1PlusBx * cosLat1PlusBx + By * By));
  var lon = lon1 + Math.atan2(By, cosLat1PlusBx);
  return [goog.math.toDegrees(lon), goog.math.toDegrees(lat)];
};


/**
 * Returns the coordinate at the given distance and bearing from `c1`.
 *
 * @param {ol.Coordinate} c1 The origin point (`[lon, lat]` in degrees).
 * @param {number} distance The great-circle distance between the origin
 *     point and the target point.
 * @param {number} bearing The bearing (in radians).
 * @return {ol.Coordinate} The target point.
 */
ol.Sphere.prototype.offset = function(c1, distance, bearing) {
  var lat1 = goog.math.toRadians(c1[1]);
  var lon1 = goog.math.toRadians(c1[0]);
  var dByR = distance / this.radius;
  var lat = Math.asin(
      Math.sin(lat1) * Math.cos(dByR) +
      Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
  var lon = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
      Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat));
  return [goog.math.toDegrees(lon), goog.math.toDegrees(lat)];
};
