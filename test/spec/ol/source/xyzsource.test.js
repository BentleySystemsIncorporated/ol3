goog.provide('ol.test.source.XYZ');


describe('ol.source.XYZ', function() {

  describe('constructor', function() {

    it('can be constructed with a custom tile size', function() {
      var tileSource = new ol.source.XYZ({
        tileSize: 512
      });
      expect(tileSource.getTileGrid().getTileSize(0)).to.be(512);
    });

  });

  describe('tileUrlFunction', function() {

    var xyzTileSource, tileGrid;

    beforeEach(function() {
      xyzTileSource = new ol.source.XYZ({
        maxZoom: 6,
        url: '{z}/{x}/{y}'
      });
      tileGrid = xyzTileSource.getTileGrid();
    });

    it('returns the expected URL', function() {

      var coordinate = [829330.2064098881, 5933916.615134273];
      var tileUrl;

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 0));
      expect(tileUrl).to.eql('0/0/0');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 1));
      expect(tileUrl).to.eql('1/1/0');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 2));
      expect(tileUrl).to.eql('2/2/1');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 3));
      expect(tileUrl).to.eql('3/4/2');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 4));
      expect(tileUrl).to.eql('4/8/5');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 5));
      expect(tileUrl).to.eql('5/16/11');

      tileUrl = xyzTileSource.tileUrlFunction(
          tileGrid.getTileCoordForCoordAndZ(coordinate, 6));
      expect(tileUrl).to.eql('6/33/22');

    });

    describe('wrap x', function() {

      it('returns the expected URL', function() {
        var projection = xyzTileSource.getProjection();
        var tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, -31, 41], projection));
        expect(tileUrl).to.eql('6/33/22');

        tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, 33, 41], projection));
        expect(tileUrl).to.eql('6/33/22');

        tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, 97, 41], projection));
        expect(tileUrl).to.eql('6/33/22');
      });

    });

    describe('crop y', function() {

      it('returns the expected URL', function() {
        var projection = xyzTileSource.getProjection();
        var tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, 33, 150], projection));
        expect(tileUrl).to.be(undefined);

        tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, 33, 41], projection));
        expect(tileUrl).to.eql('6/33/22');

        tileUrl = xyzTileSource.tileUrlFunction(
            xyzTileSource.getTileCoordForTileUrlFunction(
                [6, 33, -23], projection));
        expect(tileUrl).to.be(undefined);
      });

    });

  });

});

goog.require('ol.TileCoord');
goog.require('ol.source.XYZ');
