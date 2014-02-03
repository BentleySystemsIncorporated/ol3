goog.provide('ol.interaction.Modify');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol.Collection');
goog.require('ol.CollectionEventType');
goog.require('ol.Feature');
goog.require('ol.MapBrowserEvent.EventType');
goog.require('ol.ViewHint');
goog.require('ol.coordinate');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.LineString');
goog.require('ol.geom.LinearRing');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPoint');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.interaction.Drag');
goog.require('ol.layer.Vector');
goog.require('ol.render.FeaturesOverlay');
goog.require('ol.structs.RBush');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * @typedef {{feature: ol.Feature,
 *            geometry: ol.geom.Geometry,
 *            index: (number|undefined),
 *            style: ol.style.Style,
 *            segment: Array.<ol.Extent>}}
 */
ol.interaction.SegmentDataType;



/**
 * @constructor
 * @extends {ol.interaction.Drag}
 * @param {ol.render.FeaturesOverlay} featuresOverlay FeaturesOverlay
 * @param {olx.interaction.ModifyOptions=} opt_options Options.
 */
ol.interaction.Modify = function(featuresOverlay, opt_options) {

  goog.base(this);

  var options = goog.isDef(opt_options) ? opt_options : {};


  /**
   * Editing vertex.
   * @type {ol.Feature}
   * @private
   */
  this.vertexFeature_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.modifiable_ = false;

  /**
   * Segment RTree for each layer
   * @type {Object.<*, ol.structs.RBush>}
   * @private
   */
  this.rBush_ = null;

  /**
   * @type {number}
   * @private
   */
  this.pixelTolerance_ = goog.isDef(options.pixelTolerance) ?
      options.pixelTolerance : 20;

  /**
   * @type {Array}
   * @private
   */
  this.dragSegments_ = null;

  /**
   * Draw overlay where are sketch features are drawn.
   * @type {ol.render.FeaturesOverlay}
   * @private
   */
  this.overlay_ = featuresOverlay;

  this.overlay_.getFeatures().listen(ol.CollectionEventType.ADD,
      this.addFeature_, false, this);
  this.overlay_.getFeatures().listen(ol.CollectionEventType.REMOVE,
      this.removeFeature_, false, this);

};
goog.inherits(ol.interaction.Modify, ol.interaction.Drag);


/**
 * @param {ol.Feature} feature Feature.
 * @param {number} resolution Resolution.
 * @return {Array.<ol.style.Style>} Styles.
 */
ol.interaction.Modify.defaultStyleFunction = (function() {
  /** @type {Object.<ol.geom.GeometryType, Array.<ol.style.Style>>} */
  var styles = {};
  styles[ol.geom.GeometryType.POLYGON] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  styles[ol.geom.GeometryType.MULTI_POLYGON] =
      styles[ol.geom.GeometryType.POLYGON];

  styles[ol.geom.GeometryType.LINE_STRING] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles[ol.geom.GeometryType.MULTI_LINE_STRING] =
      styles[ol.geom.GeometryType.LINE_STRING];

  styles[ol.geom.GeometryType.POINT] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: [0, 153, 255, 1]
        }),
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 0.75],
          width: 1.5
        })
      }),
      zIndex: 100000
    })
  ];
  styles[ol.geom.GeometryType.MULTI_POINT] =
      styles[ol.geom.GeometryType.POINT];

  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()];
  };
})();


/**
 * @inheritDoc
 */
ol.interaction.Modify.prototype.setMap = function(map) {
  if (!goog.isNull(map)) {
    if (goog.isNull(this.rBush_)) {
      this.rBush_ = new ol.structs.RBush();
    }
  } else {
    // removing from a map, clean up
    this.rBush_ = null;
  }

  this.overlay_.setMap(map);
  goog.base(this, 'setMap', map);
};


/**
 * @param {ol.CollectionEvent} evt Event.
 * @private
 */
ol.interaction.Modify.prototype.addFeature_ = function(evt) {
  var feature = evt.element;
  var geometry = feature.getGeometry();
  var rBush = this.rBush_;
  var segment, segmentData, coordinates;
  var i, ii;
  if (geometry instanceof ol.geom.Point) {
    coordinates = geometry.getCoordinates();
    segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
      feature: feature,
      geometry: geometry,
      segment: [coordinates, coordinates],
      style: this.overlay_.getStyleFunction()
    });
    rBush.insert(geometry.getExtent(), segmentData);
  } else if (geometry instanceof ol.geom.MultiPoint) {
    var points = geometry.getCoordinates();
    for (i = 0, ii = points.length - 1; i < ii; ++i) {
      coordinates = points[i];
      segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
        feature: feature,
        geometry: geometry,
        depth: [i],
        segment: [coordinates, coordinates],
        style: this.overlay_.getStyleFunction()
      });
      rBush.insert(geometry.getExtent(), segmentData);
    }
  } else if (geometry instanceof ol.geom.LineString ||
      geometry instanceof ol.geom.LinearRing) {
    coordinates = geometry.getCoordinates();
    for (i = 0, ii = coordinates.length - 1; i < ii; ++i) {
      segment = coordinates.slice(i, i + 2);
      segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
        feature: feature,
        geometry: geometry,
        index: i,
        style: this.overlay_.getStyleFunction(),
        segment: segment
      });
      rBush.insert(ol.extent.boundingExtent(segment), segmentData);
    }
  } else if (geometry instanceof ol.geom.MultiLineString) {
    var lines = geometry.getCoordinates();
    for (var j = 0, jj = lines.length; j < jj; ++j) {
      coordinates = lines[j];
      for (i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        segment = coordinates.slice(i, i + 2);
        segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
          feature: feature,
          geometry: geometry,
          depth: [j],
          index: i,
          style: this.overlay_.getStyleFunction(),
          segment: segment
        });
        rBush.insert(ol.extent.boundingExtent(segment), segmentData);
      }
    }
  } else if (geometry instanceof ol.geom.Polygon) {
    var rings = geometry.getCoordinates();
    coordinates = rings[0];
    for (i = 0, ii = coordinates.length - 1; i < ii; ++i) {
      segment = coordinates.slice(i, i + 2);
      segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
        feature: feature,
        geometry: geometry,
        index: i,
        style: this.overlay_.getStyleFunction(),
        segment: segment
      });
      rBush.insert(ol.extent.boundingExtent(segment), segmentData);
    }

  } else if (geometry instanceof ol.geom.MultiPolygon) {
    var polygons = geometry.getCoordinates();
    for (var j = 0, jj = polygons.length; j < jj; ++j) {
      coordinates = polygons[j][0];
      for (i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        segment = coordinates.slice(i, i + 2);
        segmentData = /** @type {ol.interaction.SegmentDataType} */ ({
          feature: feature,
          geometry: geometry,
          depth: [j],
          index: i,
          style: this.overlay_.getStyleFunction(),
          segment: segment
        });
        rBush.insert(ol.extent.boundingExtent(segment), segmentData);
      }
    }
  }
};


/**
 * @param {ol.CollectionEvent} evt Event.
 * @private
 */
ol.interaction.Modify.prototype.removeFeature_ = function(evt) {
  var feature = evt.element;
  var rBush = this.rBush_;
  var i, nodesToRemove = [];
  rBush.forEachInExtent(feature.getGeometry().getExtent(), function(node) {
    if (feature === node.feature) {
      nodesToRemove.push(node);
    }
  });
  for (i = nodesToRemove.length - 1; i >= 0; --i) {
    rBush.remove(nodesToRemove[i]);
  }
};


/**
 * @param {ol.style.Style} style Style of the layer that the feature being
 *     modified belongs to.
 * @param {ol.Coordinate} coordinates Coordinates.
 * @return {ol.Feature} Vertex feature.
 * @private
 */
ol.interaction.Modify.prototype.createOrUpdateVertexFeature_ =
    function(style, coordinates) {
  var vertexFeature = this.vertexFeature_;
  if (goog.isNull(vertexFeature)) {
    vertexFeature = new ol.Feature(new ol.geom.Point(coordinates));
    this.vertexFeature_ = vertexFeature;
    this.overlay_.addFeature(vertexFeature);
  } else {
    var geometry = /** @type {ol.geom.Point} */ (vertexFeature.getGeometry());
    geometry.setCoordinates(coordinates);
  }
  return vertexFeature;
};


/**
 * @inheritDoc
 */
ol.interaction.Modify.prototype.handleDragStart = function(evt) {
  this.dragSegments_ = [];
  var vertexFeature = this.vertexFeature_;
  if (!goog.isNull(vertexFeature)) {
    var insertVertices = [];
    var geometry =  /** @type {ol.geom.Point} */ (vertexFeature.getGeometry());
    var vertex = geometry.getCoordinates();
    var vertexExtent = ol.extent.boundingExtent([vertex]);
    var segmentDataMatches = [];
    this.rBush_.forEachInExtent(vertexExtent,
        function(segmentData) {
          segmentDataMatches.push(segmentData);
        });
    var distinctFeatures = {};
    for (var i = 0, ii = segmentDataMatches.length; i < ii; ++i) {
      var segmentDataMatch = segmentDataMatches[i];
      var segment = segmentDataMatch.segment;
      if (!(goog.getUid(segmentDataMatch.feature) in distinctFeatures)) {
        var feature = segmentDataMatch.feature;
        distinctFeatures[goog.getUid(feature)] = true;
      }
      if (ol.coordinate.equals(segment[0], vertex)) {
        this.dragSegments_.push([segmentDataMatch, 0]);
      } else if (ol.coordinate.equals(segment[1], vertex)) {
        this.dragSegments_.push([segmentDataMatch, 1]);
      } else if (
          ol.coordinate.squaredDistanceToSegment(vertex, segment) === 0) {
        insertVertices.push([segmentDataMatch, vertex]);
      }
    }
    for (i = insertVertices.length - 1; i >= 0; --i) {
      this.insertVertex_.apply(this, insertVertices[i]);
    }
  }
  return this.modifiable_;
};


/**
 * @inheritDoc
 */
ol.interaction.Modify.prototype.handleDrag = function(evt) {
  var vertex = evt.coordinate;
  for (var i = 0, ii = this.dragSegments_.length; i < ii; ++i) {
    var dragSegment = this.dragSegments_[i];
    var segmentData = dragSegment[0];
    var depth = segmentData.depth;
    var geometry = segmentData.geometry;
    var coordinates = geometry.getCoordinates();
    var segment = segmentData.segment;
    var index = dragSegment[1];


    if (geometry instanceof ol.geom.Point) {
      coordinates = vertex;
      segment[0] = segment[1] = vertex;
    } else if (geometry instanceof ol.geom.MultiPoint) {
      coordinates[depth[0]][segmentData.index + index] = vertex;
      segment[0] = segment[1] = vertex;
    } else if (geometry instanceof ol.geom.LineString) {
      coordinates[segmentData.index + index] = vertex;
      segment[index] = vertex;
    } else if (geometry instanceof ol.geom.MultiLineString) {
      coordinates[depth[0]][segmentData.index + index] = vertex;
      segment[index] = vertex;
    } else if (geometry instanceof ol.geom.Polygon) {
      coordinates[0][segmentData.index + index] = vertex;
      segment[index] = vertex;
    } else if (geometry instanceof ol.geom.MultiPolygon) {
      coordinates[depth[0]][0][segmentData.index + index] = vertex;
      segment[index] = vertex;
    }

    geometry.setCoordinates(coordinates);
    var newBounds = ol.extent.boundingExtent(segment);
    this.createOrUpdateVertexFeature_(segmentData.style, vertex);
    this.rBush_.remove(segmentData);
    this.rBush_.insert(newBounds, segmentData);
  }
};


/**
 * @inheritDoc
 */
ol.interaction.Modify.prototype.handleDragEnd = function(evt) {
  var segmentData;
  for (var i = this.dragSegments_.length - 1; i >= 0; --i) {
    segmentData = this.dragSegments_[i][0];
    this.rBush_.update(ol.extent.boundingExtent(segmentData.segment),
        segmentData);
  }
};


/**
 * @inheritDoc
 */
ol.interaction.Modify.prototype.handleMapBrowserEvent =
    function(mapBrowserEvent) {
  if (!mapBrowserEvent.map.getView().getHints()[ol.ViewHint.INTERACTING] &&
      !this.getDragging() &&
      mapBrowserEvent.type == ol.MapBrowserEvent.EventType.MOUSEMOVE) {
    this.handleMouseMove_(mapBrowserEvent);
  }
  goog.base(this, 'handleMapBrowserEvent', mapBrowserEvent);
  return !this.modifiable_;
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @private
 */
ol.interaction.Modify.prototype.handleMouseMove_ = function(evt) {
  var map = evt.map;
  var pixel = evt.pixel;
  var pixelCoordinate = map.getCoordinateFromPixel(pixel);
  var sortByDistance = function(a, b) {
    return ol.coordinate.squaredDistanceToSegment(pixelCoordinate, a.segment) -
        ol.coordinate.squaredDistanceToSegment(pixelCoordinate, b.segment);
  };

  var lowerLeft = map.getCoordinateFromPixel(
      [pixel[0] - this.pixelTolerance_, pixel[1] + this.pixelTolerance_]);
  var upperRight = map.getCoordinateFromPixel(
      [pixel[0] + this.pixelTolerance_, pixel[1] - this.pixelTolerance_]);
  var box = ol.extent.boundingExtent([lowerLeft, upperRight]);

  this.modifiable_ = false;
  var rBush = this.rBush_;
  var nodes = rBush.getAllInExtent(box);
  //var renderIntent = ol.layer.VectorLayerRenderIntent.HIDDEN;
  if (nodes.length > 0) {
    nodes.sort(sortByDistance);
    var node = nodes[0];
    var segment = node.segment; // the closest segment
    var vertex = (ol.coordinate.closestOnSegment(pixelCoordinate, segment));
    var vertexPixel = map.getPixelFromCoordinate(vertex);
    if (Math.sqrt(ol.coordinate.squaredDistance(pixel, vertexPixel)) <=
        this.pixelTolerance_) {
      var pixel1 = map.getPixelFromCoordinate(segment[0]);
      var pixel2 = map.getPixelFromCoordinate(segment[1]);
      var squaredDist1 = ol.coordinate.squaredDistance(vertexPixel, pixel1);
      var squaredDist2 = ol.coordinate.squaredDistance(vertexPixel, pixel2);
      var dist = Math.sqrt(Math.min(squaredDist1, squaredDist2));
      //renderIntent = ol.layer.VectorLayerRenderIntent.FUTURE;
      if (dist <= 10) {
        vertex = squaredDist1 > squaredDist2 ? segment[1] : segment[0];
        //renderIntent = ol.layer.VectorLayerRenderIntent.TEMPORARY;
      }
      this.createOrUpdateVertexFeature_(node.style, vertex);
      this.modifiable_ = true;
      return;
    }
  }
  if (!goog.isNull(this.vertexFeature_)) {
    this.overlay_.removeFeature(this.vertexFeature_);
    this.vertexFeature_ = null;
  }
};


/**
 * @param {ol.interaction.SegmentDataType} segmentData Segment data.
 * @param {ol.Coordinate} vertex Vertex.
 * @private
 */
ol.interaction.Modify.prototype.insertVertex_ =
    function(segmentData, vertex) {
  var segment = segmentData.segment;
  var feature = segmentData.feature;
  var geometry = segmentData.geometry;
  var depth = segmentData.depth;
  var index = segmentData.index;
  geometry = /** @type {ol.geom.Point|ol.geom.LineString|ol.geom.Polygon|
      ol.geom.MultiPoint|ol.geom.MultiLineString|ol.geom.MultiPolygon} */
      (geometry);
  var coordinates = geometry.getCoordinates();

  if (geometry instanceof ol.geom.MultiPoint) {
    coordinates[depth[0]] = coordinates;
  } else if (geometry instanceof ol.geom.MultiLineString) {
    coordinates[depth[0]].splice(index + 1, 0, vertex);
  } else if (geometry instanceof ol.geom.Polygon) {
    coordinates[0].splice(index + 1, 0, vertex);
  } else if (geometry instanceof ol.geom.MultiPolygon) {
    coordinates[depth[0]][0].splice(index + 1, 0, vertex);
  } else {
    coordinates.splice(index + 1, 0, vertex);
  }
  geometry.setCoordinates(coordinates);
  var rTree = this.rBush_;
  goog.asserts.assert(goog.isDef(segment));
  rTree.remove(segmentData);
  var uid = goog.getUid(feature);
  var segmentDataMatches = [];
  this.rBush_.forEachInExtent(geometry.getExtent(),
      function(segmentData) {
        if (goog.getUid(segmentData.feature) === uid) {
          segmentDataMatches.push(segmentData);
        }
      });
  for (var i = 0, ii = segmentDataMatches.length; i < ii; ++i) {
    var segmentDataMatch = segmentDataMatches[i];
    if (segmentDataMatch.geometry === geometry &&
        segmentDataMatch.index > index) {
      ++segmentDataMatch.index;
    }
  }
  var newSegmentData = /** @type {ol.interaction.SegmentDataType} */ ({
    style: segmentData.style,
    segment: [segment[0], vertex],
    feature: feature,
    geometry: geometry,
    depth: depth,
    index: index
  });
  rTree.insert(ol.extent.boundingExtent(newSegmentData.segment),
      newSegmentData);
  this.dragSegments_.push([newSegmentData, 1]);

  var newSegmentData2 = /** @type {ol.interaction.SegmentDataType} */ ({
    style: segmentData.style,
    segment: [vertex, segment[1]],
    feature: feature,
    geometry: geometry,
    depth: depth,
    index: index + 1
  });
  rTree.insert(ol.extent.boundingExtent(newSegmentData2.segment),
      newSegmentData2);
  this.dragSegments_.push([newSegmentData2, 0]);
};
