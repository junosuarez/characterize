var c = require('../characterize');
require('should');

describe('characterize', function () {

  it('should have some functions', function () {
    //c.should.have.keys(['quartiles']);
  });


  it('should take an array and optional options object', function () {

    c.quartiles([1,2,3]);


  });

});

describe('linearInterpolate', function () {
  it('should calculate a linear interpolation', function () {

    var x0 = 2, y0 = 0.9093,
        x1 = 3, y1 = 0.1411,
        x2 = 2.5, expectedY2 = 0.5252;
    var line = c.linearInterpolate(x0, y0, x1, y1);

    line.should.be.a('function');
    line(x2).should.be.within(expectedY2 - .01, expectedY2 + .01);

  });

  describe('percentile', function () {
    var data = [15, 20, 35, 40, 50];
    it('should calculate the percentile', function () {
      c.percentile(data)(0).should.equal(15);
      c.percentile(data)(30).should.equal(27.5);
      c.percentile(data)(50).should.equal(40);
      c.percentile(data)(100).should.equal(50);
    });
  })


  describe('quartiles', function () {
    it('should return an array', function () {
      var data = [15, 20, 35, 40, 50];

      var q = c.quartiles(data);
      q.length.should.equal(5);
      q[0].should.equal(15);    // 0th quartile / 0th percentile / min
      q[1].should.equal(23.75); // 1st quartile / 25th percentile
      q[2].should.equal(40);    // 2nd quartile / 50th percentile / mean
      q[3].should.equal(50);    // 3rd quartile / 75th percentile
      q[4].should.equal(50);    // 4th quartile / 100th percentile / max
    });

  });

  describe('intervals', function () {
    it('should ', function () {
      var data = [2, 2, 4, 2, 3, 7, 4, 6, 8, 9, 2, 3, 4, 35, 2, 2, 5, 40];

      var i = c.intervals(data, {resolution: 10, scale: 'linear'});
      i.length.should.equal(10);
      i.forEach(function (interval) {
        interval.should.have.keys(['gte','lt','count','items']);
      });
      i[0].should.have.keys(['gte','lt','count','items']);
      i[0].gte.should.equal(2);
      i[9].lt.should.equal(42);

    });
  });


  describe('scale', function () {
    it('floor should return the next value at a given magnitude less than or equal to a given number', function () {
      c.scale(1, Math.floor)(1  ).should.equal(0);
      c.scale(0, Math.floor)(1  ).should.equal(1);
      c.scale(0, Math.floor)(1.4).should.equal(1);
      c.scale(1, Math.floor)(37 ).should.equal(30);
      c.scale(-1,Math.floor)(.53).should.equal(.5);
    });
    it('ceil should return the next value at a given magnitude less than or equal to a given number', function () {
      c.scale(1, Math.ceil)(1).should.equal(10);
      c.scale(0, Math.ceil)(1).should.equal(1);
      c.scale(0, Math.ceil)(1.4).should.equal(2);
      c.scale(1, Math.ceil)(37).should.equal(40);
      c.scale(-1,Math.ceil)(.53).should.equal(.6);
    });
  });

  describe('outliers', function () {
    it('should return a collection of outliers based on stddev', function () {
      var data = [1,2,3,4,5,6,30, 33, 4, 2,3,2,3,24, 1800];

      var o = c.outliers(data);
      Array.isArray(o).should.equal(true);
      o.length.should.equal(1);
      o[0].should.equal(1800);
    });
  })

  describe('magnitude', function () {
    it('should tell me the magnitude of any number', function () {
      c.magnitude(5).should.equal(0);
      c.magnitude(37).should.equal(1);
      c.magnitude(234322).should.equal(5);
      c.magnitude(.5).should.equal(-1);
      c.magnitude(.0002).should.equal(-4);
      c.magnitude(2.0625).should.equal(0);
    });
  });


})