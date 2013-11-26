goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.format.GeoJSON');
goog.require('ol.geom.LineString');
goog.require('ol.geom.Point');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.shape');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


var image = ol.shape.renderCircle(5, null,
    new ol.style.Stroke({color: 'red', width: 1}));

var styles = {
  'Point': [new ol.style.Style({
    image: image
  })],
  'LineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  })],
  'MultiLineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  })],
  'MultiPoint': [new ol.style.Style({
    image: image
  })],
  'MultiPolygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  })],
  'Polygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })]
};

var styleFunction = function(feature, resolution) {
  return styles[feature.getGeometry().getType()];
};

var vectorSource = new ol.source.Vector();
new ol.format.GeoJSON().readObject({
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [0, 0]
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [[4e6, -2e6], [8e6, 2e6]]
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [[4e6, 2e6], [8e6, -2e6]]
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': [
          [[-1e6, -7.5e5], [-1e6, 7.5e5]],
          [[1e6, -7.5e5], [1e6, 7.5e5]],
          [[-7.5e5, -1e6], [7.5e5, -1e6]],
          [[-7.5e5, 1e6], [7.5e5, 1e6]]
        ]
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [
          [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
          [[[-2e6, 6e6], [-2e6, 8e6], [0e6, 8e6], [0e6, 6e6]]],
          [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
        ]
      }
    }
  ]
}, vectorSource.addFeature, vectorSource);

var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  styleFunction: styleFunction
});
var tmpLineFeature = new ol.Feature(
    new ol.geom.LineString([[-5e6, -5e6], [5e6, -5e6]]));
var tmpPointFeature = new ol.Feature(
    new ol.geom.Point([0, 3e6]));
var tmpStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'magenta',
    width: 5
  }),
  image: ol.shape.renderCircle(5,
      new ol.style.Fill({
        color: 'green'
      }),
      new ol.style.Stroke({
        color: 'blue'
      }))
});
vectorLayer.on('postcompose', function(event) {
  var render = event.getRender();
  render.drawFeature(tmpLineFeature, tmpStyle);
  render.drawFeature(tmpPointFeature, tmpStyle);
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    vectorLayer
  ],
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 2
  })
});
