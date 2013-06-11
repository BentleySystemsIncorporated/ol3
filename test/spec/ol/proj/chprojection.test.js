goog.provide('ol.test.proj.CH');
goog.provide('ol.test.proj.EPSG2056');
goog.provide('ol.test.proj.EPSG21781');


describe('ol.proj.CH', function() {

  beforeEach(function() {
    ol.proj.CH.add();
  });

  it('can transform from EPSG:2056 to EPSG:21781', function() {
    var output = ol.proj.transform(
        [2660389.515487, 1185731.630396], 'EPSG:2056', 'EPSG:21781');
    expect(output).to.be.an(Array);
    expect(output).to.have.length(2);
    expect(output[0]).to.roughlyEqual(660389.515487, 1e-9);
    expect(output[1]).to.roughlyEqual(185731.630396, 1e-9);
  });

  it('can transform from EPSG:21781 to EPSG:2056', function() {
    var output = ol.proj.transform(
        [660389.515487, 185731.630396], 'EPSG:21781', 'EPSG:2056');
    expect(output).to.be.an(Array);
    expect(output).to.have.length(2);
    expect(output[0]).to.roughlyEqual(2660389.515487, 1e-10);
    expect(output[1]).to.roughlyEqual(1185731.630396, 1e-10);
  });

});


describe('ol.proj.EPSG2056', function() {

  var epsg2056;
  beforeEach(function() {
    ol.proj.EPSG2056.add();
    epsg2056 = ol.proj.get('EPSG:2056');
    expect(epsg2056).to.be.an(ol.Projection);
  });

  it('transforms from EPSG:2056 to EPSG:4326', function() {
    var wgs84 = ol.proj.transform(
        [2660389.515487, 1185731.630396], 'EPSG:2056', 'EPSG:4326');
    expect(wgs84).to.be.an(Array);
    expect(wgs84).to.have.length(2);
    expect(wgs84[0]).to.roughlyEqual(8.23, 1e-3);
    expect(wgs84[1]).to.roughlyEqual(46.82, 1e-3);
  });

  it('transforms from EPSG:4326 to EPSG:2056', function() {
    var ch1903 = ol.proj.transform([8.23, 46.82], 'EPSG:4326', 'EPSG:2056');
    expect(ch1903).to.be.an(Array);
    expect(ch1903).to.have.length(2);
    expect(ch1903[0]).to.roughlyEqual(2660389.515487, 1);
    expect(ch1903[1]).to.roughlyEqual(1185731.630396, 1);
  });

});



describe('ol.proj.EPSG21781', function() {

  var epsg21781;
  beforeEach(function() {
    ol.proj.EPSG21781.add();
    epsg21781 = ol.proj.get('EPSG:21781');
    expect(epsg21781).to.be.an(ol.Projection);
  });

  it('does not lose too much accuracy when round-tripping', function() {
    var extent = epsg21781.getExtent();
    var fromEPSG4326 = ol.proj.getTransform('EPSG:4326', 'EPSG:21781');
    var toEPSG4326 = ol.proj.getTransform('EPSG:21781', 'EPSG:4326');
    var roundTripped, x, y;
    for (x = extent[0]; x < extent[1]; x += 50000) {
      for (y = extent[2]; y < extent[3]; y += 50000) {
        roundTripped = fromEPSG4326(toEPSG4326([x, y]));
        expect(roundTripped).to.be.an(Array);
        expect(roundTripped).to.have.length(2);
        expect(roundTripped[0]).to.roughlyEqual(x, 1e1);
        expect(roundTripped[1]).to.roughlyEqual(y, 1e1);
      }
    }
  });

  it('transforms from EPSG:21781 to EPSG:4326', function() {
    var wgs84 = ol.proj.transform(
        [660389.515487, 185731.630396], 'EPSG:21781', 'EPSG:4326');
    expect(wgs84).to.be.an(Array);
    expect(wgs84).to.have.length(2);
    expect(wgs84[0]).to.roughlyEqual(8.23, 1e-3);
    expect(wgs84[1]).to.roughlyEqual(46.82, 1e-3);
  });

  it('transforms from EPSG:4326 to EPSG:21781', function() {
    var ch1903 = ol.proj.transform([8.23, 46.82], 'EPSG:4326', 'EPSG:21781');
    expect(ch1903).to.be.an(Array);
    expect(ch1903).to.have.length(2);
    expect(ch1903[0]).to.roughlyEqual(660389.515487, 1);
    expect(ch1903[1]).to.roughlyEqual(185731.630396, 1);
  });

});


goog.require('ol.Projection');
goog.require('ol.proj');
goog.require('ol.proj.CH');
goog.require('ol.proj.EPSG2056');
goog.require('ol.proj.EPSG21781');
