(function() {

	if (!jasmine) {
		throw new Exception("jasmine library does not exist in global namespace!");
	}

	function writeFile(filename, text) {
		try {
			new java.io.File(filename).getParentFile().mkdirs();
			var out = new java.io.BufferedWriter(new java.io.FileWriter(filename));
			out.write(text);
			out.close();
			log('JUnit report write to: ' + filename);
		} catch (e) {
			log('WriteFile Error: ' + e.message);
		}
	}

	function log(msg) {
		var console = jasmine.getGlobal().console;

		if (console && console.log) {
			console.log(msg);
		}
	}

	function elapsed(startTime, endTime) {
		return (endTime - startTime) / 1000;
	}

	function toISODateString(d) {
		function pad(n) {
			return n < 10 ? '0' + n : n;
		}

		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T'
				+ pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
	}

	/**
	 * Generates JUnit XML for the given spec run.
	 * Allows the test results to be used in java based CI
	 * systems like CruiseControl, Hudson and Jenkins.
	 */
	var JUnitXmlReporter = function(savePath) {
		this.savePath = savePath || '';
		this.suiteReports = [];
	};

	JUnitXmlReporter.prototype = {
		reportRunnerResults : function(runner) {
			var endTime = new Date(), buff = [], fileName = 'TEST-SpecRunner.xml';
			var reports = this.suiteReports, report, len, i;
			var results = runner.results(), specs = runner.specs();
			var failed = results.failedCount, total = specs.length;
			var testcases, testcase, leng, j;
			this.log("Runner Finished.");
			//
			buff.push('<?xml version="1.0" encoding="UTF-8" ?>');
			buff.push('<testsuite name="SpecRunner" errors="0" failures="' + failed + '" tests="'
					+ total + '" time="' + elapsed(this.startTime, endTime) + '" timestamp="'
					+ toISODateString(this.startTime) + '">');
			for (i = 0, len = reports.length; i < len; i++) {
				report = reports[i];
				buff.push('<testsuite name="' + report.name + '" errors="' + report.errors
						+ '" failures="' + report.failures + '" tests="' + report.tests
						+ '" time="' + report.time + '" timestamp="' + report.timestamp + '">');
				testcases = report.testcases;
				for (j = 0, leng = testcases.length; j < leng; j++) {
					testcase = testcases[j];
					buff.push(' <testcase classname="' + testcase.classname + '" name="'
							+ testcase.name + '" time="' + testcase.time + '">');
					if (testcase.failure) {
						buff.push('<failure>' + testcase.failure + '</failure>');
					}
					buff.push('</testcase>');
				}
				buff.push('</testsuite>');
			}
			buff.push('</testsuite>');
			//
			writeFile(this.savePath + fileName, buff.join(''));
		},

		reportRunnerStarting : function(runner) {
			this.startTime = new Date();
			this.log("Runner Started.");
		},

		reportSpecResults : function(spec) {
			var resultText = "Failed.";

			if (spec.results().passed()) {
				resultText = "Passed.";
			}

			spec.endTime = new Date();

			this.log(resultText);
		},

		reportSpecStarting : function(spec) {
			spec.startTime = new Date();

			if (!spec.suite.startTime) {
				spec.suite.startTime = new Date();
			}

			this.log(spec.suite.description + ' : ' + spec.description + ' ... ');
		},

		reportSuiteResults : function(suite) {
			var endTime = new Date(), results = suite.results(), desc = suite.description;
			var suiteReport = {
				name : desc,
				errors : 0,
				tests : results.totalCount,
				failures : results.failedCount,
				time : elapsed(suite.startTime, endTime),
				timestamp : toISODateString(suite.startTime),
				testcases : []
			};
			var testcases = suiteReport.testcases, testcase, specs = suite.specs(), spec;
			var len, i, j, specRets, expectedResults, trace, leng;
			for (i = 0, len = specs.length; i < len; i++) {
				spec = specs[i];
				testcase = {
					classname : desc,
					name : spec.description,
					time : elapsed(spec.startTime, spec.endTime),
					failure : null
				};
				specRets = spec.results();
				if (specRets.failedCount > 0) {
					expectedResults = specRets.getItems();
					for (j = 0, leng = expectedResults.length; j < leng; j++) {
						trace = expectedResults[j].trace;
						if (trace instanceof Error) {
							testcase.failure = trace.message;
							break;
						}
					}
				}
				testcases.push(testcase);
			}
			this.suiteReports.push(suiteReport);
			this.log(desc + ": " + results.passedCount + " of " + results.totalCount + " passed.");
		},

		log : log
	};

	// export public
	jasmine.JUnitXmlReporter = JUnitXmlReporter;
})();