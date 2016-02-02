goog.provide('ol.test.events');


describe('ol.events', function() {
  var add, remove, target;

  beforeEach(function() {
    add = sinon.spy();
    remove = sinon.spy();
    target = {
      addEventListener: add,
      removeEventListener: remove
    };
  });

  describe('bindListener_()', function() {
    it('binds a listener and returns a bound listener function', function() {
      var listenerObj = {
        listener: sinon.spy(),
        bindTo: {id: 1}
      };
      var boundListener = ol.events.bindListener_(listenerObj);
      expect(listenerObj.boundListener).to.equal(boundListener);
      boundListener();
      expect(listenerObj.listener.thisValues[0]).to.equal(listenerObj.bindTo);
    });
    it('binds a self-unregistering listener when callOnce is true', function() {
      var bindTo = {id: 1};
      var listener = sinon.spy();
      target.removeEventListener = function() {};
      var listenerObj = {
        type: 'foo',
        target: target,
        listener: listener,
        bindTo: bindTo,
        callOnce: true
      };
      var boundListener = ol.events.bindListener_(listenerObj);
      expect(listenerObj.boundListener).to.equal(boundListener);
      var spy = sinon.spy(ol.events, 'unlistenByKey');
      boundListener();
      expect(listener.thisValues[0]).to.equal(bindTo);
      expect(spy.firstCall.args[0]).to.eql(listenerObj);
      ol.events.unlistenByKey.restore();
    });
  });

  describe('findListener_()', function() {
    it('searches a listener array for a specific listener', function() {
      var bindTo = {id: 1};
      var listener = function() {};
      var listenerObj = {
        type: 'foo',
        target: target,
        listener: listener
      };
      var listenerArray = [listenerObj];
      var result = ol.events.findListener_(listenerArray, listener);
      expect(result).to.be(listenerObj);
      result = ol.events.findListener_(listenerArray, listener, bindTo);
      expect(result).to.be(undefined);
      listenerObj.bindTo = bindTo;
      result = ol.events.findListener_(listenerArray, listener);
      expect(result).to.be(undefined);
      result = ol.events.findListener_(listenerArray, listener, bindTo);
      expect(result).to.be(listenerObj);
    });
  });

  describe('getListeners()', function() {
    it('returns listeners for a target and type', function() {
      var foo = ol.events.listen(target, 'foo', function() {});
      var bar = ol.events.listen(target, 'bar', function() {});
      expect (ol.events.getListeners(target, 'foo')).to.eql([foo]);
      expect (ol.events.getListeners(target, 'bar')).to.eql([bar]);
    });
    it('returns undefined when no listeners are registered', function() {
      expect (ol.events.getListeners(target, 'foo')).to.be(undefined);
    });
  });

  describe('listen()', function() {
    it('calls addEventListener on the target', function() {
      ol.events.listen(target, 'foo', function() {});
      expect(add.callCount).to.be(1);
    });
    it('adds listeners for multiple types with a single call', function() {
      ol.events.listen(target, ['foo', 'bar'], function() {});
      expect(add.getCall(0).args[0]).to.be('foo');
      expect(add.getCall(1).args[0]).to.be('bar');
    });
    it('returns a key', function() {
      var key = ol.events.listen(target, 'foo', function() {});
      expect(key).to.be.a(Object);
      key = ol.events.listen(target, ['foo', 'bar'], function() {});
      expect(key).to.be.a(Array);
    });
    it('does not add the same listener twice', function() {
      var listener = function() {};
      var key1 = ol.events.listen(target, 'foo', listener);
      var key2 = ol.events.listen(target, 'foo', listener);
      expect(key1).to.equal(key2);
      expect(add.callCount).to.be(1);
    });
    it('only treats listeners as same when all args are equal', function() {
      var listener = function() {};
      ol.events.listen(target, 'foo', listener, {});
      ol.events.listen(target, 'foo', listener, {});
      ol.events.listen(target, 'foo', listener, undefined);
      expect(add.callCount).to.be(3);
    });
  });

  describe('listenOnce()', function() {
    it('creates a one-off listener', function() {
      var listener = sinon.spy();
      var key = ol.events.listenOnce(target, 'foo', listener);
      expect(add.callCount).to.be(1);
      expect(key.callOnce).to.be(true);
      key.boundListener();
      expect(listener.callCount).to.be(1);
      expect(remove.callCount).to.be(1);
    });
    it('does not add the same listener twice', function() {
      var listener = function() {};
      var key1 = ol.events.listenOnce(target, 'foo', listener);
      var key2 = ol.events.listenOnce(target, 'foo', listener);
      expect(key1).to.equal(key2);
      expect(add.callCount).to.be(1);
      expect(key1.callOnce).to.be(true);
    });
    it('listen() can turn a one-off listener into a permanent one', function() {
      var listener = sinon.spy();
      var key = ol.events.listenOnce(target, 'foo', listener);
      expect(key.callOnce).to.be(true);
      key = ol.events.listen(target, 'foo', listener);
      expect(add.callCount).to.be(1);
      expect(key.callOnce).to.be(false);
      key.boundListener();
      expect(remove.callCount).to.be(0);
    });
  });

  describe('unlisten()', function() {
    it('unregisters previously registered listeners', function() {
      var listener = function() {};
      ol.events.listen(target, 'foo', listener);
      ol.events.unlisten(target, 'foo', listener);
      expect(ol.events.getListeners(target, 'foo')).to.be(undefined);
    });
    it('works with multiple types', function() {
      var listener = function() {};
      ol.events.listen(target, ['foo', 'bar'], listener);
      ol.events.unlisten(target, ['bar', 'foo'], listener);
      expect(ol.events.getListeners(target, 'foo')).to.be(undefined);
      expect(ol.events.getListeners(target, 'bar')).to.be(undefined);
    });
  });

  describe('unlistenByKey()', function() {
    it('unregisters previously registered listeners', function() {
      var key = ol.events.listen(target, 'foo', function() {});
      ol.events.unlistenByKey(key);
      expect(ol.events.getListeners(target, 'foo')).to.be(undefined);
    });
    it('works with multiple types', function() {
      var key = ol.events.listen(target, ['foo', 'bar'], function() {});
      ol.events.unlistenByKey(key);
      expect(ol.events.getListeners(target, 'foo')).to.be(undefined);
      expect(ol.events.getListeners(target, 'bar')).to.be(undefined);
    });
  });

  describe('unlistenAll()', function() {
    it('unregisters all listeners registered for a target', function() {
      var key = ol.events.listen(target, ['foo', 'bar'], function() {});
      ol.events.unlistenAll(target);
      expect(ol.events.getListeners(target, 'foo')).to.be(undefined);
      expect(ol.events.getListeners(target, 'bar')).to.be(undefined);
      expect(ol.events.LISTENER_MAP_PROP_ in target).to.be(false);
      expect(key).to.eql([{}, {}]);
    });
  });

  describe('Compatibility with ol.events.EventTarget', function() {
    it('does not register duplicated listeners', function() {
      var target = new ol.events.EventTarget();
      var listener = function() {};
      var key1 = ol.events.listen(target, 'foo', listener);
      expect(target.getListeners('foo')).to.eql([key1.boundListener]);
      var key2 = ol.events.listen(target, 'foo', listener);
      expect(key2.boundListener).to.equal(key1.boundListener);
      expect(target.getListeners('foo')).to.eql([key1.boundListener]);
    });
    it('registers multiple listeners if this object is different', function() {
      var target = new ol.events.EventTarget();
      var listener = function() {};
      var key1 = ol.events.listen(target, 'foo', listener, {});
      var key2 = ol.events.listen(target, 'foo', listener, {});
      expect(key1.boundListener).to.not.equal(key2.boundListener);
      expect(target.getListeners('foo')).to.eql(
          [key2.boundListener, key1.boundListener]);
    });
  });

});


goog.require('ol.events');
goog.require('ol.events.EventTarget');
