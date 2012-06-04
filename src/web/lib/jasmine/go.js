if ('undefined' != typeof isHtml) {
	jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
	jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
} else {
	jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('./build/junitReport/'));
}
jasmine.getEnv().execute();