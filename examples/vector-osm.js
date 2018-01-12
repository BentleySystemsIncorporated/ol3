import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import OSMXML from '../src/ol/format/OSMXML.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import _ol_loadingstrategy_ from '../src/ol/loadingstrategy.js';
import {transformExtent} from '../src/ol/proj.js';
import BingMaps from '../src/ol/source/BingMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

var map;

var styles = {
  'amenity': {
    'parking': new Style({
      stroke: new Stroke({
        color: 'rgba(170, 170, 170, 1.0)',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(170, 170, 170, 0.3)'
      })
    })
  },
  'building': {
    '.*': new Style({
      zIndex: 100,
      stroke: new Stroke({
        color: 'rgba(246, 99, 79, 1.0)',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(246, 99, 79, 0.3)'
      })
    })
  },
  'highway': {
    'service': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 2
      })
    }),
    '.*': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 3
      })
    })
  },
  'landuse': {
    'forest|grass|allotments': new Style({
      stroke: new Stroke({
        color: 'rgba(140, 208, 95, 1.0)',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(140, 208, 95, 0.3)'
      })
    })
  },
  'natural': {
    'tree': new Style({
      image: new CircleStyle({
        radius: 2,
        fill: new Fill({
          color: 'rgba(140, 208, 95, 1.0)'
        }),
        stroke: null
      })
    })
  }
};

var vectorSource = new VectorSource({
  format: new OSMXML(),
  loader: function(extent, resolution, projection) {
    var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
    var client = new XMLHttpRequest();
    client.open('POST', 'https://overpass-api.de/api/interpreter');
    client.addEventListener('load', function() {
      var features = new OSMXML().readFeatures(client.responseText, {
        featureProjection: map.getView().getProjection()
      });
      vectorSource.addFeatures(features);
    });
    var query = '(node(' +
        epsg4326Extent[1] + ',' + epsg4326Extent[0] + ',' +
        epsg4326Extent[3] + ',' + epsg4326Extent[2] +
        ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out meta;';
    client.send(query);
  },
  strategy: _ol_loadingstrategy_.bbox
});

var vector = new VectorLayer({
  source: vectorSource,
  style: function(feature) {
    for (var key in styles) {
      var value = feature.get(key);
      if (value !== undefined) {
        for (var regexp in styles[key]) {
          if (new RegExp(regexp).test(value)) {
            return styles[key][regexp];
          }
        }
      }
    }
    return null;
  }
});

var raster = new TileLayer({
  source: new BingMaps({
    imagerySet: 'Aerial',
    key: 'As1HiMj1PvLPlqc_gtM7AqZfBL8ZL3VrjaS3zIb22Uvb9WKhuJObROC-qUpa81U5'
  })
});

map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  controls: defaultControls({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: new View({
    center: [739218, 5906096],
    maxZoom: 19,
    zoom: 17
  })
});
