import _ol_Map_ from '../../../src/ol/Map.js';
import _ol_Overlay_ from '../../../src/ol/Overlay.js';
import _ol_View_ from '../../../src/ol/View.js';


describe('ol.Overlay', function() {
  var target, map;

  var width = 360;
  var height = 180;

  beforeEach(function() {
    target = document.createElement('div');

    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);

    map = new _ol_Map_({
      target: target,
      view: new _ol_View_({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  });

  afterEach(function() {
    map.dispose();
    document.body.removeChild(target);
  });

  describe('constructor', function() {

    it('can be constructed with minimal arguments', function() {
      var instance = new _ol_Overlay_({});
      expect(instance).to.be.an(_ol_Overlay_);
    });

    it('can be constructed with className', function() {
      var instance = new _ol_Overlay_({className: 'my-class'});
      expect(instance).to.be.an(_ol_Overlay_);
      expect(instance.element.className).to.be('my-class');
    });

  });

  describe('#getId()', function() {
    var overlay, target;

    beforeEach(function() {
      target = document.createElement('div');
    });
    afterEach(function() {
      map.removeOverlay(overlay);
    });

    it('returns the overlay identifier', function() {
      overlay = new _ol_Overlay_({
        element: target,
        position: [0, 0]
      });
      map.addOverlay(overlay);
      expect(overlay.getId()).to.be(undefined);
      map.removeOverlay(overlay);
      overlay = new _ol_Overlay_({
        id: 'foo',
        element: target,
        position: [0, 0]
      });
      map.addOverlay(overlay);
      expect(overlay.getId()).to.be('foo');
    });

  });

  describe('#setVisible()', function() {
    var overlay, target;

    beforeEach(function() {
      target = document.createElement('div');
    });
    afterEach(function() {
      map.removeOverlay(overlay);
    });

    it('changes the CSS display value', function() {
      overlay = new _ol_Overlay_({
        element: target,
        position: [0, 0]
      });
      map.addOverlay(overlay);
      map.renderSync();
      expect(overlay.element.style.display).not.to.be('none');
      overlay.setVisible(false);
      expect(overlay.element.style.display).to.be('none');
    });

  });

});
