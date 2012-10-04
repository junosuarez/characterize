var _ = require('lodash');

var isObject = function (o) {
  return typeof o === 'object' && o !== null;
};

var prepare = function (fn) {
  return function (arr, opts) {
    if (!Array.isArray(arr)) {
      throw new TypeError('arr must be an array');
    }

    if (isObject(opts) && 'comparator' in opts && typeof opts.comparator === 'function') {
      arr = arr.map(opts.comparator);
    }

    arr.sort(function (a, b) { return a - b; });
    return fn(arr, opts);
  };
};

var mean = function (arr) {
  var sum = arr.reduce(function (a, b) {
      return a + b;
    }, 0);
  return sum / arr.length;
};

var median = function (arr) {
  var mid = arr.length / 2;
  if (arr.length % 2 !== 0) {
    return arr[(arr.length - 1) / 2];
  } else {
    return (arr[Math.floor(mid)] + arr[Math.ceil(mid)]) / 2;
  }
};

var mode = function (arr) {
  return _.chain(arr)
          .groupBy(_.id)
          .pairs().max(function(i) {
            return i[1].length;
          })
          .value()[0];
};

//linear interpolation
var linearInterpolate = function (x0, y0, x1, y1) {
  return function (x) {
    return y0 + ((y1 - y0) * ((x - x0) / (x1 - x0)));
  };
};

/**
 * [percentile description]
 * @param  {[type]} arr         [description]
 * @param  {[type]} p           [description]
 * @param  {[type]} interpolate optional (defaults to true) - If true, uses the
 *                              linear interpolation betwen the two nearest
 *                              elements in the array. If false, use the
 *                              nearest element in the array.
 * @return {[type]}             [description]
 */
var percentile = function (arr) {
  return function (p, interpolate) {
   if (typeof interpolate !== 'boolean') {
      interpolate = true;
    }

    if (p === 100) {
      return arr[arr.length-1];
    } else if (p === 0) {
      return arr[0];
    } else if (p > 100 || p < 0) {
      throw new RangeError('p must be a percent between 1 and 100');
    }

    var n = arr.length,
        rank = (p / 100) * (n + 1); // NIST percentile

        if (interpolate) {
          if (rank > arr.length - 1) {
            return arr[arr.length-1];
          } else if (rank < 0) {
            return arr[0];
          } else if (rank % 1 === 0) {
            return arr[rank];
          }

          // interpolate between two nearest elements
          var i = Math.floor(rank);

          var v0 = arr[i],
              v1 = arr[i + 1] || arr[i];

          var p0 = (i / n) * 100,
              p1 = ((i+1) / n) * 100;

          var line = linearInterpolate(p0, v0, p1, v1);

          var v = line(p);

          return v;

        }

        // no interpolation, return value of the nearest element
        return arr[Math.ceil(rank)];
  };
};

var quartiles = function (arr) {
  var x = [0, 25, 50, 75, 100].map(percentile(arr));
  return x;
};


var magnitude = function (n) {
  if (typeof n !== 'number') {
        throw new TypeError('n must be a number');
  }

  if (Math.abs(n) >= 1) {
    n = n.toFixed();
  }

  var s = n.toString();
  var m = s.match(/^0\.(0*)/);
  if (m !== null) {
    // less than one magnitude
    return -(m[1].length + 1);
  }

  return s.length - 1;
};

var scale = function(mag, fn) {
  if (mag === 0) {
    return fn;
  }
  var factor = Math.pow(10, mag);
  return function (x) {
    return cleanFloat(fn(x / factor) * factor);
  };
};

var cleanFloat = function (fl) {
  if (Math.abs(fl) >= 1) {
    return fl;
  }

  return +fl.toFixed(8);
};

var differences = function (terms) {
  var i, diffs = [];
  for (i = 1; i < terms.length; i++) {
    diffs.push(terms[i] - terms[i-1]);
  }
  return diffs;
};


var intervalClassifier = function (start, size, n) {
  return function (item) {
    for (var interval = 1; interval <= n; interval++) {
      if (item <= (start + (interval * size))) {
        return interval;
      }
    }
  };
};

var intervals = function (arr, opts) {
  opts = opts || {};
  opts.resolution = opts.resolution || 10;
  opts.scale = opts.scale || 'linear';

  var min = arr[0],
      max = arr[arr.length-1],
      mag = magnitude(mean(differences(arr)));
  var size = (max - min) / opts.resolution;

  size = scale(mag, Math.ceil)(size);

  var start = scale(mag, Math.floor)(min);


  var classifier = intervalClassifier(start, size, opts.resolution);

  var index = _.groupBy(arr, classifier);

  var i = _.range(opts.resolution).map(function (i) {
    var items = index[i + 1] || [];
    var count = items.length;
    var min = start + ((i) * size);
    var max = min + size;
    return {
      gte: min,
      lt: max,
      count: count,
      items: items
    };
  });

  return i;

};

_.to = function (key) {
  return function (x) {
    return x[key];
  };
};
_.len = function (x) {
  return x.length;
};
_.id = function (x) {
  return x;
};

var str = {};
str.repeat = function(s, times) {
  return Array(times + 1).join(s);
};
str.pad = function(s, len) {
  var space = len - s.length;
  var padding = str.repeat(' ', space);
  return s + padding;
};

var g = function (items) {
  var labelLen = _(items
    .map(_.to('label'))
    .map(_.len))
    .max();

  return items.map(function (item) {
    return str.pad(item.label, labelLen) + ' │' + str.repeat('█', item.val) + '\t(' + item.val + ')';
  }).reverse().join('\n');
};



var graph = function (arr) {
  var i = prepare(intervals)(arr);
  return i.map(function(interval) {
    var o = '[' +interval.gte + ', ' + interval.lt + ')\t |';
    o = o + Array(interval.count + 1).join('█') + '\t(' + interval.count +')';
    //console.log(o);
    return o;
  });

};

var zScore = function (val, arrMean, arrStddev) {
  return (val - arrMean) / arrStddev;
};

var sum = function (x, y) {
  return x + y;
};


var variance = function (arr) {
  var arrMean = mean(arr);
  return arr.map(function (i) {
      return Math.pow(i - arrMean, 2);
    }).reduce(sum, 0) / arr.length;
};

var stddev = function (arr, isPop) {
  isPop = isPop !== undefined ? isPop : true;

  if (isPop) {
    return Math.sqrt(variance(arr));
  } else {
    throw new Error('Sample stddev not implemented');
  }

};

var outliers = function (arr) {

  if (arr.length > 30) {
    //Iglewicz and Hoaglin modified Z-score method,
    //only approrpiate on larger sample sizes due to its reliance on median
    var coefficient = 0.6745;
    var m = median(arr);
    throw new Error('explode');
  } else {
    var arrMean = mean(arr);
    var arrStddev = stddev(arr);

    var scorer = function (x) {
      return zScore(x, arrMean, arrStddev);
    };
    var scores = arr.map(scorer);

    return _.zip(arr, scores)
      .filter(function (pair) { return Math.abs(pair[1]) > 3.5; })
      .map(function(x) { return x[0]; });
  }

};

var bounder = function (min, max) {
  return function (x) {
    if (x > max) {
      return max;
    } else if (x < min) {
      return min;
    }
    return x;
  };
};

var scaler = function (oldMin, oldMax, newMin, newMax) {
  var line = linearInterpolate(oldMin, newMin, oldMax, newMax);
  var bound = bounder(newMin, newMax);

  return function (x) {
    return bound(line(x));
  };
};

var boxplot = function (quartiles) {
  var width;
  if (process.stdout.isTTY) {
    width = process.stdout.getWindowSize()[0] - 1;
  }
  width = width > 80 ? 80 : width;

  var first = 0,
      last = width - 1;
  var s = scaler(quartiles[0], quartiles[4], first, last);
  var outerQuartile = '─',
      innerQuartile = '█',
      median = '■';

  var scaled = quartiles.map(s).map(Math.round);
  scaled[1] = scaled[1] === first ? first + 1 : scaled[1];
  scaled[3] = scaled[3] === last ? last - 1 : scaled[3];

  var plot = str.repeat(outerQuartile, width).split('');

  var innerLen = scaled[3] - scaled[1];
  for (var i = scaled[1]; i <= scaled[3]; i++){
    plot[i] = innerQuartile;
  }

  plot[first] = '├';
  plot[scaled[2]] = median;
  plot[last] = '┤';

  return plot.join('');
};

var report = function (data) {
  var q = quartiles(data);
  var o = outliers(data);

  console.log(data);
  console.log('');
  console.log('Histogram:');
  console.log(
    g(
      intervals(data)
      .map(function(i) {
        return {
          label: '[' + i.gte + ', ' + i.lt + ')',
          val: i.count
        };
      })
    )
  );

  console.log('');
  console.log('Boxplot:');
  console.log(boxplot(q));

  console.log('');
  console.log('Distribution (percentiles):');
  console.log('0  : ', q[0]);
  console.log('25 : ', q[1]);
  console.log('50 : ', q[2]);
  console.log('75 : ', q[3]);
  console.log('100: ', q[4]);

  console.log('');
  console.log('Variance: ', variance(data));
  console.log('Std Deviation (population):', stddev(data));

  console.log('');
  console.log('Measures of Central Tendency:');
  console.log('Mean  : ', mean(data));
  console.log('Median: ', median(data));
  console.log('Mode  : ', mode(data));

  console.log('');
  console.log('Possible Outliers:');

  console.log(_.any(o) ? o.join() : 'None');
};

//report([1,1,1,1,2,3,4,5,5,5,6,30, 32, 50, 580]);





module.exports = prepare(report);

_.extend(module.exports, {
  linearInterpolate: linearInterpolate,
  quartiles: prepare(quartiles),
  percentile: percentile,
  intervals: prepare(intervals),
  magnitude: magnitude,
  outliers: outliers,
  scale: scale
})