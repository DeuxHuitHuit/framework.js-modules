/**
* history
* @author Deux Huit Huit
*/
(function ($, undefined) {

	'use strict';

	var STORAGE_KEY = 'history';

	var scope = $('#site');

	var sels = {
		input: '.js-history-input'
	};

	var urls = [];

	try {
		urls = JSON.parse(App.storage.local.get(STORAGE_KEY) || []);
	} catch (error) {
		App.log(error);
	}

	var update = function () {
		urls.push(window.location.href);
		scope.find(sels.input).each(function () {
			var t = $(this);
			var value = urls.join('\n');

			if (t.attr('data-history-unique') === 'true') {
				value = _.uniq(urls).join('\n');
			}

			t.val(value);
		});
		App.storage.local.set(STORAGE_KEY, JSON.stringify(urls));
	};

	var onPageEnter = function (key, data) {
		update();
	};

	var onArticleEnter = function (key, data) {
		update();
	};

	var actions = function () {
		return {
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};

	App.modules.exports('history', {
		actions: actions
	});

})(jQuery);
