import Fill from '../../../../src/ol/style/Fill.js';
import Stroke from '../../../../src/ol/style/Stroke.js';
import Text from '../../../../src/ol/style/Text.js';


describe('ol.style.Text', function() {

  describe('#constructor', function() {

    it('uses a default fill style if none passed', function() {
      var style = new Text();
      expect(style.getFill().getColor()).to.be('#333');
    });

    it('uses a provided fill style if one passed', function() {
      var style = new Text({
        fill: new Fill({color: '#123456'})
      });
      expect(style.getFill().getColor()).to.be('#123456');
    });

    it('can always be resetted to no color', function() {
      var style = new Text();
      style.getFill().setColor();
      expect(style.getFill().getColor()).to.be(undefined);
    });

  });

  describe('#clone', function() {

    it('creates a new ol.style.Text', function() {
      var original = new Text();
      var clone = original.clone();
      expect(clone).to.be.an(Text);
      expect(clone).to.not.be(original);
    });

    it('copies all values', function() {
      var original = new Text({
        font: '12px serif',
        offsetX: 4,
        offsetY: 10,
        scale: 2,
        rotateWithView: true,
        rotation: 1.5,
        text: 'test',
        textAlign: 'center',
        textBaseline: 'top',
        fill: new Fill({
          color: '#319FD3'
        }),
        stroke: new Stroke({
          color: '#319FD3'
        }),
        backgroundFill: new Fill({
          color: 'white'
        }),
        backgroundStroke: new Stroke({
          color: 'black'
        })
      });
      var clone = original.clone();
      expect(original.getFont()).to.eql(clone.getFont());
      expect(original.getOffsetX()).to.eql(clone.getOffsetX());
      expect(original.getOffsetY()).to.eql(clone.getOffsetY());
      expect(original.getScale()).to.eql(clone.getScale());
      expect(original.getRotateWithView()).to.eql(clone.getRotateWithView());
      expect(original.getRotation()).to.eql(clone.getRotation());
      expect(original.getText()).to.eql(clone.getText());
      expect(original.getTextAlign()).to.eql(clone.getTextAlign());
      expect(original.getTextBaseline()).to.eql(clone.getTextBaseline());
      expect(original.getStroke().getColor()).to.eql(clone.getStroke().getColor());
      expect(original.getFill().getColor()).to.eql(clone.getFill().getColor());
      expect(original.getBackgroundStroke().getColor()).to.eql(clone.getBackgroundStroke().getColor());
      expect(original.getBackgroundFill().getColor()).to.eql(clone.getBackgroundFill().getColor());
    });

    it('the clone does not reference the same objects as the original', function() {
      var original = new Text({
        fill: new Fill({
          color: '#319FD3'
        }),
        stroke: new Stroke({
          color: '#319FD3'
        })
      });
      var clone = original.clone();
      expect(original.getFill()).to.not.be(clone.getFill());
      expect(original.getStroke()).to.not.be(clone.getStroke());

      clone.getFill().setColor('#012345');
      clone.getStroke().setColor('#012345');
      expect(original.getFill().getColor()).to.not.eql(clone.getFill().getColor());
      expect(original.getStroke().getColor()).to.not.eql(clone.getStroke().getColor());
    });

  });

});
