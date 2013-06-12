goog.provide('ol.test.expression');


describe('ol.expression.parse', function() {

  it('parses a string and returns an expression', function() {
    var expr = ol.expression.parse('foo');
    expect(expr).to.be.a(ol.expression.Expression);
  });

  describe('primary expressions', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.1

    it('parses identifier expressions', function() {
      var expr = ol.expression.parse('foo');
      expect(expr).to.be.a(ol.expression.Identifier);
      expect(expr.evaluate({foo: 'bar'})).to.be('bar');
    });

    it('consumes whitespace as expected', function() {
      var expr = ol.expression.parse('  foo  ');
      expect(expr).to.be.a(ol.expression.Identifier);
      expect(expr.evaluate({foo: 'bar'})).to.be('bar');
    });

    it('throws on invalid identifier expressions', function() {
      expect(function() {
        ol.expression.parse('3foo');
      }).throwException();
    });

    it('parses string literal expressions', function() {
      var expr = ol.expression.parse('"foo"');
      expect(expr).to.be.a(ol.expression.Literal);
      expect(expr.evaluate()).to.be('foo');
    });

    it('throws on unterminated string', function() {
      expect(function() {
        ol.expression.parse('"foo');
      }).throwException();
    });

    it('parses numeric literal expressions', function() {
      var expr = ol.expression.parse('.42e+2');
      expect(expr).to.be.a(ol.expression.Literal);
      expect(expr.evaluate()).to.be(42);
    });

    it('throws on invalid number', function() {
      expect(function() {
        ol.expression.parse('.42eX');
      }).throwException();
    });

    it('parses boolean literal expressions', function() {
      var expr = ol.expression.parse('false');
      expect(expr).to.be.a(ol.expression.Literal);
      expect(expr.evaluate()).to.be(false);
    });

    it('parses null literal expressions', function() {
      var expr = ol.expression.parse('null');
      expect(expr).to.be.a(ol.expression.Literal);
      expect(expr.evaluate()).to.be(null);
    });

  });

  describe('left-hand-side expressions', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.2

    it('parses member expressions with dot notation', function() {
      var expr = ol.expression.parse('foo.bar.baz');
      expect(expr).to.be.a(ol.expression.Member);
      var scope = {foo: {bar: {baz: 42}}};
      expect(expr.evaluate(scope)).to.be(42);
    });

    it('consumes whitespace as expected', function() {
      var expr = ol.expression.parse(' foo . bar . baz ');
      expect(expr).to.be.a(ol.expression.Member);
      var scope = {foo: {bar: {baz: 42}}};
      expect(expr.evaluate(scope)).to.be(42);
    });

    it('throws on invalid member expression', function() {
      expect(function() {
        ol.expression.parse('foo.4bar');
      }).throwException();
    });

    it('parses call expressions with literal arguments', function() {
      var expr = ol.expression.parse('foo(42, "bar")');
      expect(expr).to.be.a(ol.expression.Call);
      var scope = {
        foo: function(num, str) {
          expect(num).to.be(42);
          expect(str).to.be('bar');
          return str + num;
        }
      };
      expect(expr.evaluate(scope)).to.be('bar42');
    });

    it('throws on calls with unterminated arguments', function() {
      expect(function() {
        ol.expression.parse('foo(42,)');
      }).throwException();
    });

  });

  describe('unary operators', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.4

    it('parses logical not operator', function() {
      var expr = ol.expression.parse('!foo');
      expect(expr).to.be.a(ol.expression.Not);
      expect(expr.evaluate({foo: true})).to.be(false);
      expect(expr.evaluate({foo: false})).to.be(true);
      expect(expr.evaluate({foo: ''})).to.be(true);
      expect(expr.evaluate({foo: 'foo'})).to.be(false);
    });

    it('consumes whitespace as expected', function() {
      var expr = ol.expression.parse(' ! foo');
      expect(expr).to.be.a(ol.expression.Not);
      expect(expr.evaluate({foo: true})).to.be(false);
      expect(expr.evaluate({foo: false})).to.be(true);
    });

  });

  describe('multiplicitave operators', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.5

    it('parses * operator', function() {
      var expr = ol.expression.parse('foo*bar');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(200);
    });

    it('consumes whitespace as expected with *', function() {
      var expr = ol.expression.parse(' foo * bar ');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 15, bar: 2})).to.be(30);
    });

    it('parses / operator', function() {
      var expr = ol.expression.parse('foo/12');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 10})).to.be(10 / 12);
    });

    it('consumes whitespace as expected with /', function() {
      var expr = ol.expression.parse(' 4 / bar ');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({bar: 3})).to.be(4 / 3);
    });

    it('parses % operator', function() {
      var expr = ol.expression.parse('12%foo');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 10})).to.be(2);
    });

    it('consumes whitespace as expected with %', function() {
      var expr = ol.expression.parse(' 4 %bar ');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({bar: 3})).to.be(1);
    });

  });

  describe('additive operators', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.6

    it('parses + operator', function() {
      var expr = ol.expression.parse('foo+bar');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(30);
    });

    it('consumes whitespace as expected with +', function() {
      var expr = ol.expression.parse(' foo +10 ');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 15})).to.be(25);
    });

    it('parses - operator', function() {
      var expr = ol.expression.parse('foo-bar');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(-10);
    });

    it('consumes whitespace as expected with -', function() {
      var expr = ol.expression.parse(' foo- 10 ');
      expect(expr).to.be.a(ol.expression.Math);
      expect(expr.evaluate({foo: 15})).to.be(5);
    });

  });

  describe('relational operators', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.8

    it('parses < operator', function() {
      var expr = ol.expression.parse('foo<bar');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(true);
      expect(expr.evaluate({foo: 100, bar: 20})).to.be(false);
    });

    it('consumes whitespace as expected with <', function() {
      var expr = ol.expression.parse(' foo <10 ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 15})).to.be(false);
      expect(expr.evaluate({foo: 5})).to.be(true);
    });

    it('parses > operator', function() {
      var expr = ol.expression.parse('foo>bar');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(false);
      expect(expr.evaluate({foo: 100, bar: 20})).to.be(true);
    });

    it('consumes whitespace as expected with >', function() {
      var expr = ol.expression.parse(' foo> 10 ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 15})).to.be(true);
      expect(expr.evaluate({foo: 5})).to.be(false);
    });

    it('parses <= operator', function() {
      var expr = ol.expression.parse('foo<=bar');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(true);
      expect(expr.evaluate({foo: 100, bar: 20})).to.be(false);
      expect(expr.evaluate({foo: 20, bar: 20})).to.be(true);
    });

    it('consumes whitespace as expected with <=', function() {
      var expr = ol.expression.parse(' foo<= 10 ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 15})).to.be(false);
      expect(expr.evaluate({foo: 5})).to.be(true);
      expect(expr.evaluate({foo: 10})).to.be(true);
    });

    it('throws for invalid spacing with <=', function() {
      expect(function() {
        ol.expression.parse(' foo< = 10 ');
      }).throwException();
    });

    it('parses >= operator', function() {
      var expr = ol.expression.parse('foo>=bar');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 10, bar: 20})).to.be(false);
      expect(expr.evaluate({foo: 100, bar: 20})).to.be(true);
      expect(expr.evaluate({foo: 20, bar: 20})).to.be(true);
    });

    it('consumes whitespace as expected with >=', function() {
      var expr = ol.expression.parse(' foo >=10 ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 15})).to.be(true);
      expect(expr.evaluate({foo: 5})).to.be(false);
      expect(expr.evaluate({foo: 10})).to.be(true);
    });

    it('throws for invalid spacing with >=', function() {
      expect(function() {
        ol.expression.parse(' 10 > =foo ');
      }).throwException();
    });

  });

  describe('equality operators', function() {
    // http://www.ecma-international.org/ecma-262/5.1/#sec-11.9

    it('parses == operator', function() {
      var expr = ol.expression.parse('foo==42');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(true);
      expect(expr.evaluate({foo: 41})).to.be(false);
      expect(expr.evaluate({foo: '42'})).to.be(true);
    });

    it('consumes whitespace as expected with ==', function() {
      var expr = ol.expression.parse(' 42 ==foo ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(true);
      expect(expr.evaluate({foo: 41})).to.be(false);
      expect(expr.evaluate({foo: '42'})).to.be(true);
    });

    it('throws for invalid spacing with ==', function() {
      expect(function() {
        ol.expression.parse(' 10 = =foo ');
      }).throwException();
    });

    it('parses != operator', function() {
      var expr = ol.expression.parse('foo!=42');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(false);
      expect(expr.evaluate({foo: 41})).to.be(true);
      expect(expr.evaluate({foo: '42'})).to.be(false);
    });

    it('consumes whitespace as expected with !=', function() {
      var expr = ol.expression.parse(' 42 !=foo ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(false);
      expect(expr.evaluate({foo: 41})).to.be(true);
      expect(expr.evaluate({foo: '42'})).to.be(false);
    });

    it('throws for invalid spacing with !=', function() {
      expect(function() {
        ol.expression.parse(' 10! =foo ');
      }).throwException();
    });

    it('parses === operator', function() {
      var expr = ol.expression.parse('42===foo');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(true);
      expect(expr.evaluate({foo: 41})).to.be(false);
      expect(expr.evaluate({foo: '42'})).to.be(false);
    });

    it('consumes whitespace as expected with ===', function() {
      var expr = ol.expression.parse(' foo ===42 ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(true);
      expect(expr.evaluate({foo: 41})).to.be(false);
      expect(expr.evaluate({foo: '42'})).to.be(false);
    });

    it('throws for invalid spacing with ===', function() {
      expect(function() {
        ol.expression.parse(' 10 = == foo ');
      }).throwException();
    });

    it('parses !== operator', function() {
      var expr = ol.expression.parse('foo!==42');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(false);
      expect(expr.evaluate({foo: 41})).to.be(true);
      expect(expr.evaluate({foo: '42'})).to.be(true);
    });

    it('consumes whitespace as expected with !==', function() {
      var expr = ol.expression.parse(' 42 !== foo ');
      expect(expr).to.be.a(ol.expression.Comparison);
      expect(expr.evaluate({foo: 42})).to.be(false);
      expect(expr.evaluate({foo: 41})).to.be(true);
      expect(expr.evaluate({foo: '42'})).to.be(true);
    });

    it('throws for invalid spacing with !==', function() {
      expect(function() {
        ol.expression.parse(' 10 != = foo ');
      }).throwException();
    });
  });

});


goog.require('ol.expression');
goog.require('ol.expression.Call');
goog.require('ol.expression.Comparison');
goog.require('ol.expression.Expression');
goog.require('ol.expression.Identifier');
goog.require('ol.expression.Literal');
goog.require('ol.expression.Math');
goog.require('ol.expression.Member');
goog.require('ol.expression.Not');
