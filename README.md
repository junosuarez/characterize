# characterize
by jden <jason@denizac.org>

characterize a set of data. made for the usecase of a commandline reporter for analysis scripts - but throws in some other basic stats goodies as well.

## usage

    var characterize = require('characterize');
    var data = [ 1, 1, 1, 1, 2, 3, 4, 5, 5, 5, 6, 30, 32, 50, 580 ];
    characterize(data);

## example output:

	[ 1, 1, 1, 1, 2, 3, 4, 5, 5, 5, 6, 30, 32, 50, 580 ]

	Histogram:
	[540, 600) │█	(1)
	[480, 540) │	(0)
	[420, 480) │	(0)
	[360, 420) │	(0)
	[300, 360) │	(0)
	[240, 300) │	(0)
	[180, 240) │	(0)
	[120, 180) │	(0)
	[60, 120)  │	(0)
	[0, 60)    │██████████████	(14)

	Boxplot:
	├■███───────────────────────────────────────────────────────────┤

	Distribution (percentiles):
	0  :  1
	25 :  2
	50 :  5
	75 :  32
	100:  580

	Variance:  20388.64
	Std Deviation (population): 142.78879507860552

	Measures of Central Tendency:
	Mean  :  48.4
	Median:  5
	Mode  :  1

	Possible Outliers:
	580

## other functions

 - linearInterpolate
 - quartiles
 - percentile
 - intervals
 - magnitude
 - outliers
 - scale