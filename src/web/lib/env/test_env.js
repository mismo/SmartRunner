(function() {
	// test setTimeout
	print('setTimeout begin...');
	setTimeout(function() {
		print('setTimeout end!!!');
	}, 0);

	// test setInterval
	var count = 3, tid;
	print('setInterval begin...');
	print(new Date().getTime());
	tid = setInterval(function() {
		print(new Date().getTime() + ": " + (--count));
		if (!count) {
			clearInterval(tid);
			print('setInterval end!!!');
		}
	}, 50);
})();