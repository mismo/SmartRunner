/**
 * provides timed callbacks using Java threads
 */
(function() {
	var timers = {}, count = 0;

	clearInterval = clearTimeout = function(num) {
		if (timers[num]) {
			timers[num].interrupt();
			delete timers[num];
		}
	};

	setTimeout = function(fn, time) {
		var num;
		return num = setInterval(function() {
			try {
				fn();
			} finally {
				clearInterval(num);
			}
		}, time);
	};

	setInterval = function(fn, time) {
		var num = (++count) + "";

		timers[num] = new java.lang.Thread(new java.lang.Runnable({
			run : function() {
				while (true) {
					if (java.lang.Thread.interrupted()) {
						break;
					}
					try {
						java.lang.Thread.currentThread().sleep(time);
					} catch (e) {
						break;
					}
					fn();
				}
			}
		}));

		timers[num].start();

		return num;
	};

})();
