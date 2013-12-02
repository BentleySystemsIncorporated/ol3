goog.provide('ol.renderer.vector');

goog.require('goog.asserts');
goog.require('ol.geom.LineString');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPoint');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.render.IReplayGroup');
goog.require('ol.style.Style');


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.Feature} feature Feature.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 */
ol.renderer.vector.renderFeature = function(replayGroup, feature, style, data) {
  var geometry = feature.getGeometry();
  var geometryRenderer =
      ol.renderer.vector.GEOMETRY_RENDERERS_[geometry.getType()];
  goog.asserts.assert(goog.isDef(geometryRenderer));
  geometryRenderer(replayGroup, geometry, style, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderLineStringGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.stroke)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.LineString);
  var lineStringGeometry = /** @type {ol.geom.LineString} */ (geometry);
  var replay = replayGroup.getReplay(
      style.zIndex, ol.render.ReplayType.LINE_STRING);
  replay.setFillStrokeStyle(null, style.stroke);
  replay.drawLineStringGeometry(lineStringGeometry, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderMultiLineStringGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.stroke)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.MultiLineString);
  var multiLineStringGeometry = /** @type {ol.geom.MultiLineString} */
      (geometry);
  var replay = replayGroup.getReplay(
      style.zIndex, ol.render.ReplayType.LINE_STRING);
  replay.setFillStrokeStyle(null, style.stroke);
  replay.drawMultiLineStringGeometry(multiLineStringGeometry, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderMultiPolygonGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.stroke) && goog.isNull(style.fill)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.MultiPolygon);
  var multiPolygonGeometry = /** @type {ol.geom.MultiPolygon} */
      (geometry);
  var replay = replayGroup.getReplay(
      style.zIndex, ol.render.ReplayType.POLYGON);
  replay.setFillStrokeStyle(style.fill, style.stroke);
  replay.drawMultiPolygonGeometry(multiPolygonGeometry, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderPointGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.image)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.Point);
  var pointGeometry = /** @type {ol.geom.Point} */ (geometry);
  var replay = replayGroup.getReplay(style.zIndex, ol.render.ReplayType.IMAGE);
  replay.setImageStyle(style.image);
  replay.drawPointGeometry(pointGeometry, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderMultiPointGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.image)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.MultiPoint);
  var multiPointGeometry = /** @type {ol.geom.MultiPoint} */ (geometry);
  var replay = replayGroup.getReplay(style.zIndex, ol.render.ReplayType.IMAGE);
  replay.setImageStyle(style.image);
  replay.drawMultiPointGeometry(multiPointGeometry, data);
};


/**
 * @param {ol.render.IReplayGroup} replayGroup Replay group.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.style.Style} style Style.
 * @param {Object} data Opaque data object.
 * @private
 */
ol.renderer.vector.renderPolygonGeometry_ =
    function(replayGroup, geometry, style, data) {
  if (goog.isNull(style.fill) && goog.isNull(style.stroke)) {
    return;
  }
  goog.asserts.assertInstanceof(geometry, ol.geom.Polygon);
  var polygonGeometry = /** @type {ol.geom.Polygon} */ (geometry);
  var replay = replayGroup.getReplay(
      style.zIndex, ol.render.ReplayType.POLYGON);
  replay.setFillStrokeStyle(style.fill, style.stroke);
  replay.drawPolygonGeometry(polygonGeometry, data);
};


/**
 * @const
 * @private
 * @type {Object.<ol.geom.Type,
 *                function(ol.render.IReplayGroup, ol.geom.Geometry,
 *                         ol.style.Style, Object)>}
 */
ol.renderer.vector.GEOMETRY_RENDERERS_ = {
  'Point': ol.renderer.vector.renderPointGeometry_,
  'LineString': ol.renderer.vector.renderLineStringGeometry_,
  'Polygon': ol.renderer.vector.renderPolygonGeometry_,
  'MultiPoint': ol.renderer.vector.renderMultiPointGeometry_,
  'MultiLineString': ol.renderer.vector.renderMultiLineStringGeometry_,
  'MultiPolygon': ol.renderer.vector.renderMultiPolygonGeometry_
};
