goog.provide('ol.test.Object');

describe('ol.Object', function() {

  var o;
  beforeEach(function() {
    o = new ol.Object();
  });

  describe('get and set', function() {

    describe('get an unset property', function() {
      var v;
      beforeEach(function() {
        v = o.get('k');
      });

      it('returns undefined', function() {
        expect(v).to.be(undefined);
      });

    });

    describe('get a set property', function() {
      var v;
      beforeEach(function() {
        o.set('k', 1);
        v = o.get('k');
      });

      it('returns expected value', function() {
        expect(v).to.eql(1);
      });
    });
  });

  describe('#get()', function() {

    it('does not return values that are not explicitly set', function() {
      var o = new ol.Object();
      expect(o.get('constructor')).to.be(undefined);
      expect(o.get('hasOwnProperty')).to.be(undefined);
      expect(o.get('isPrototypeOf')).to.be(undefined);
      expect(o.get('propertyIsEnumerable')).to.be(undefined);
      expect(o.get('toLocaleString')).to.be(undefined);
      expect(o.get('toString')).to.be(undefined);
      expect(o.get('valueOf')).to.be(undefined);
    });

  });

  describe('#set()', function() {
    it('can be used with arbitrary names', function() {
      var o = new ol.Object();

      o.set('set', 'sat');
      expect(o.get('set')).to.be('sat');

      o.set('get', 'got');
      expect(o.get('get')).to.be('got');

      o.set('toString', 'string');
      expect(o.get('toString')).to.be('string');
      expect(typeof o.toString).to.be('function');
    });
  });

  describe('#getKeys()', function() {

    it('returns property names set at construction', function() {
      var o = new ol.Object({
        prop1: 'val1',
        prop2: 'val2',
        toString: 'string',
        get: 'foo'
      });

      var keys = o.getKeys();
      expect(keys.length).to.be(4);
      expect(keys.sort()).to.eql(['get', 'prop1', 'prop2', 'toString']);
    });

  });

  describe('setValues', function() {

    it('sets multiple values at once', function() {
      o.setValues({
        k1: 1,
        k2: 2
      });
      expect(o.get('k1')).to.eql(1);
      expect(o.get('k2')).to.eql(2);

      var keys = o.getKeys().sort();
      expect(keys).to.eql(['k1', 'k2']);
    });
  });

  describe('notify', function() {

    var listener1, listener2, listener3;

    beforeEach(function() {
      listener1 = sinon.spy();
      goog.events.listen(o, 'k_changed', listener1);

      listener2 = sinon.spy();
      goog.events.listen(o, 'changed', listener2);

      var o2 = new ol.Object();
      o2.bindTo('k', o);
      listener3 = sinon.spy();
      goog.events.listen(o2, 'k_changed', listener3);
    });

    it('dispatches events', function() {
      o.notify('k');
      expect(listener1).to.be.called();
    });

    it('dispatches generic change events to bound objects', function() {
      o.notify('k');
      expect(listener2).to.be.called();
    });

    it('dispatches events to bound objects', function() {
      o.notify('k');
      expect(listener3).to.be.called();
    });
  });

  describe('set', function() {

    var listener1, o2, listener2, listener3;

    beforeEach(function() {
      listener1 = sinon.spy();
      goog.events.listen(o, 'k_changed', listener1);

      listener2 = sinon.spy();
      goog.events.listen(o, 'changed', listener2);

      o2 = new ol.Object();
      o2.bindTo('k', o);
      listener3 = sinon.spy();
      goog.events.listen(o2, 'k_changed', listener3);
    });

    it('dispatches events to object', function() {
      o.set('k', 1);
      expect(listener1).to.be.called();

      expect(o.getKeys()).to.eql(['k']);
      expect(o2.getKeys()).to.eql(['k']);
    });

    it('dispatches generic change events to object', function() {
      o.set('k', 1);
      expect(listener2).to.be.called();
    });

    it('dispatches events to bound object', function() {
      o.set('k', 1);
      expect(listener3).to.be.called();
    });

    it('dispatches events to object bound to', function() {
      o2.set('k', 2);
      expect(listener1).to.be.called();

      expect(o.getKeys()).to.eql(['k']);
      expect(o2.getKeys()).to.eql(['k']);
    });

    it('dispatches generic change events to object bound to', function() {
      o2.set('k', 2);
      expect(listener2).to.be.called();
    });
  });

  describe('bind', function() {

    var o2;

    beforeEach(function() {
      o2 = new ol.Object();
    });

    describe('bindTo after set', function() {

      it('gets expected value', function() {
        o.set('k', 1);
        o2.bindTo('k', o);
        expect(o.get('k')).to.eql(1);
        expect(o2.get('k')).to.eql(1);

        expect(o.getKeys()).to.eql(['k']);
        expect(o2.getKeys()).to.eql(['k']);
      });
    });

    describe('bindTo before set', function() {

      it('gets expected value', function() {
        o2.bindTo('k', o);
        o.set('k', 1);
        expect(o.get('k')).to.eql(1);
        expect(o2.get('k')).to.eql(1);

        expect(o.getKeys()).to.eql(['k']);
        expect(o2.getKeys()).to.eql(['k']);
      });
    });

    describe('backwards', function() {
      describe('bindTo after set', function() {

        it('gets expected value', function() {
          o2.set('k', 1);
          o2.bindTo('k', o);
          expect(o.get('k')).to.be(undefined);
          expect(o2.get('k')).to.be(undefined);
        });
      });

      describe('bindTo before set', function() {

        it('gets expected value', function() {
          o2.bindTo('k', o);
          o2.set('k', 1);
          expect(o.get('k')).to.eql(1);
          expect(o2.get('k')).to.eql(1);
        });
      });
    });
  });

  describe('unbind', function() {
    var o2;

    beforeEach(function() {
      o2 = new ol.Object();
      o2.bindTo('k', o);
      o2.set('k', 1);
    });

    it('makes changes to unbound object invisible to other object', function() {
      // initial state
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(1);
      o2.unbind('k');
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(1);
      o2.set('k', 2);
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(2);
    });
  });

  describe('unbindAll', function() {
    var o2;

    beforeEach(function() {
      o2 = new ol.Object();
      o2.bindTo('k', o);
      o2.set('k', 1);
    });

    it('makes changes to unbound object invisible to other object', function() {
      // initial state
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(1);
      o2.unbindAll();
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(1);
      o2.set('k', 2);
      expect(o.get('k')).to.eql(1);
      expect(o2.get('k')).to.eql(2);
    });
  });

  describe('bind rename', function() {
    var listener1, o2, listener2;

    beforeEach(function() {
      o2 = new ol.Object();
      o2.bindTo('k2', o, 'k1');

      listener1 = sinon.spy();
      goog.events.listen(o, 'k1_changed', listener1);

      listener2 = sinon.spy();
      goog.events.listen(o2, 'k2_changed', listener2);
    });

    it('sets the expected properties', function() {
      o.set('k1', 1);
      expect(o.get('k1')).to.eql(1);
      expect(o.get('k2')).to.be(undefined);
      expect(o2.get('k2')).to.eql(1);
      expect(o2.get('k1')).to.be(undefined);
      expect(listener1).to.be.called();
      expect(listener2).to.be.called();

      expect(o.getKeys()).to.eql(['k1']);
      expect(o2.getKeys()).to.eql(['k2']);
    });
  });

  describe('transitive bind', function() {
    var o2, o3;

    beforeEach(function() {
      o2 = new ol.Object();
      o3 = new ol.Object();
      o2.bindTo('k2', o, 'k1');
      o3.bindTo('k3', o2, 'k2');
    });

    it('sets the expected properties', function() {
      o.set('k1', 1);
      expect(o.get('k1')).to.eql(1);
      expect(o2.get('k2')).to.eql(1);
      expect(o3.get('k3')).to.eql(1);

      expect(o.getKeys()).to.eql(['k1']);
      expect(o2.getKeys()).to.eql(['k2']);
      expect(o3.getKeys()).to.eql(['k3']);
    });

    describe('backward', function() {

      it('sets the expected properties', function() {
        o3.set('k3', 1);
        expect(o.get('k1')).to.eql(1);
        expect(o2.get('k2')).to.eql(1);
        expect(o3.get('k3')).to.eql(1);

        expect(o.getKeys()).to.eql(['k1']);
        expect(o2.getKeys()).to.eql(['k2']);
        expect(o3.getKeys()).to.eql(['k3']);
      });
    });
  });

  describe('circular bind', function() {
    var o2;

    beforeEach(function() {
      o2 = new ol.Object();
      o.bindTo('k', o2);
    });

    it('throws an error', function() {
      expect(function() { o2.bindTo('k', o); }).to.throwException();
    });
  });

  describe('priority', function() {
    var o2;

    beforeEach(function() {
      o2 = new ol.Object();
    });

    it('respects set order', function() {
      o.set('k', 1);
      o2.set('k', 2);
      o.bindTo('k', o2);
      expect(o.get('k')).to.eql(2);
      expect(o2.get('k')).to.eql(2);
    });

    it('respects set order (undefined)', function() {
      o.set('k', 1);
      o.bindTo('k', o2);
      expect(o.get('k')).to.be(undefined);
      expect(o2.get('k')).to.be(undefined);
    });
  });

  describe('setter', function() {
    beforeEach(function() {
      o.setX = function(x) {
        this.set('x', x);
      };
      sinon.spy(o, 'setX');
    });

    describe('without bind', function() {
      it('does not call the setter', function() {
        o.set('x', 1);
        expect(o.get('x')).to.eql(1);
        expect(o.setX).to.not.be.called();

        expect(o.getKeys()).to.eql(['x']);
      });
    });

    describe('with bind', function() {
      it('does call the setter', function() {
        var o2 = new ol.Object();
        o2.bindTo('x', o);
        o2.set('x', 1);
        expect(o.setX).to.be.called();
        expect(o.get('x')).to.eql(1);

        expect(o.getKeys()).to.eql(['x']);
        expect(o2.getKeys()).to.eql(['x']);
      });
    });
  });

  describe('getter', function() {
    beforeEach(function() {
      o.getX = function() {
        return 1;
      };
      sinon.spy(o, 'getX');
    });

    describe('without bind', function() {
      it('does not call the getter', function() {
        expect(o.get('x')).to.be(undefined);
        expect(o.getX).to.not.be.called();
      });
    });

    describe('with bind', function() {
      it('does call the getter', function() {
        var o2 = new ol.Object();
        o2.bindTo('x', o);
        expect(o2.get('x')).to.eql(1);
        expect(o.getX).to.be.called();

        expect(o.getKeys()).to.eql([]);
        expect(o2.getKeys()).to.eql(['x']);
      });
    });
  });

  describe('bind self', function() {
    it('throws an error', function() {
      expect(function() { o.bindTo('k', o); }).to.throwException();
    });
  });

  describe('create with options', function() {
    it('sets the property', function() {
      var o = new ol.Object({k: 1});
      expect(o.get('k')).to.eql(1);

      expect(o.getKeys()).to.eql(['k']);
    });
  });

  describe('case sensitivity', function() {
    var listener1, listener2;

    beforeEach(function() {
      listener1 = sinon.spy();
      goog.events.listen(o, 'k_changed', listener1);
      listener2 = sinon.spy();
      goog.events.listen(o, 'K_changed', listener2);
    });

    it('dispatches the expected event', function() {
      o.set('K', 1);
      expect(listener1).to.be.called();
      expect(listener2).to.not.be.called();

      expect(o.getKeys()).to.eql(['K']);
    });
  });
});

goog.require('ol.Object');
