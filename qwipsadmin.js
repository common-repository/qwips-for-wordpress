(function(){

	//Constructed when QWiPS Javascript loads
	function QwipsAdmin(qwips){
		var me = this;
		var $$ = me.qwips = qwips;
		var $ = me.jQuery = $$.qwipsJQuery;

		//Set QWiPS Widget options
		$$.suspend();

		//Set QwipLinks to point to WP permalinks
		var linkUrl = decodeURIComponent($('#qwips_tokens_history').attr('data-permalink'));
		linkUrl = linkUrl.replace(/([\?:&])referenced-qwip=(\d[a-z0-9]{5,9})/i, '$1referenced-qwip={QWIPTOKEN}');
		if(linkUrl.indexOf('referenced-qwip')==-1) {
			linkUrl += ( linkUrl.indexOf('?')!==-1 ? '&' : '?' ) + 'referenced-qwip={QWIPTOKEN}';
		}
		$$.linkUrl(linkUrl);

		$$.options({ referencedQwipTokenRegex : /(?:[\?|&]referenced-qwip=)(\d[a-z0-9]{5,9})/i });

		//Watch for recorded qwips
		$$.bind($$.EV_QWIP_ADDED, function(ev,params){
			me.appendTokenToForm(params.qwip.token);
			me.appendHistoryItem(params.qwip.token);
		});

		//Add QuickTag button
		QTags.addButton( 'qwips-insert-qwip-qt', 'Insert Qwip', function(){
			me.mceInsertQwip();
		});

		//Parse history
		var $histCont = $('#qwips-history-container').empty();
		var tokensHistory = $('#qwips_tokens_history').val();
		tokensHistory = tokensHistory ? tokensHistory.split(',') : [];

		if(tokensHistory.length) {
			for(var ti=0; ti<tokensHistory.length; ti++) {
				me.appendHistoryItem(tokensHistory[ti]);
			}
		} else {
			$histCont.append('<h4 class="qwips-history-empty-notice">History is empty</h4>');
		}
	}

	QwipsAdmin.prototype.mceInsertQwip = function(){
		var me = this;
		var $$ = me.qwips;
		var $ = me.jQuery;
		var $dialogBackground = $('<div/>', {'class':'qwips-dialog-bg'});
		var $dialog = $('<div/>', {'class':'qwips-dialog'});

		var composer = new $$.widgets.Composer(undefined, { composerShowPlayer:false, composerCloseButton:true, inlineAuthorization:true }, function(err, token){
			if(err || token === undefined) {
				$dialog.remove();
				$dialogBackground.remove();
				return;
			}

			me.appendTokenToPost(token);

			composer.remove();
			$dialog.remove();
			$dialogBackground.remove();
		});

		$dialogBackground.appendTo('body');
		$dialog.appendTo('body');
		composer.appendTo($dialog);
	};

	QwipsAdmin.prototype.appendTokenToPost = function(token){
		var me = this;
		var $$ = me.qwips;

		if(tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden()) {
			tinyMCE.execCommand('mceInsertContent', true, $$.config.base + token);
		} else {
			QTags.insertContent( $$.config.base + token);
		}
	};

	QwipsAdmin.prototype.appendTokenToForm = function(token){
		var me = this;
		var $ = me.jQuery;

		var $formField = $('#qwips_tokens_history');

		var tokens = $formField.val();

		tokens = tokens ? tokens.split(',') : [];
		tokens.push(token);
		tokens = tokens.join(',');

		$formField.val(tokens);
	};

	QwipsAdmin.prototype.appendHistoryItem = function(token){
		var me = this;
		var $$ = me.qwips;
		var $ = me.jQuery;

		var $histCont = $('#qwips-history-container');
		$histCont.children('.qwips-history-empty-notice').hide();

		var $listItem = $('<div />', {'class':'qwips-history-item' });
		var plr = new $$.widgets.PlayerCompact(undefined, { qwip:token, playersWrapped:false });
		$listItem.append(
				plr.$element,
				$('<input />', { 'type':'text', 'class':'qwips-history-item-link', readonly:'readonly' }).val($$.config.base + token)
		);
		$listItem.appendTo($histCont);
		plr.$element.trigger('addedToDom');
	};

	//Export QwipsAdmin into global namespace
	window.QwipsAdmin = QwipsAdmin;

	//Runs when WordPress is ready
	addLoadEvent(function (){
		var baseUrl = window.QWIPS_BASE_URL;
		delete(window.QWIPS_BASE_URL);
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		document.getElementsByTagName('head')[0].appendChild(script);
		script.setAttribute('src', baseUrl + '/api/js/2');
		script.innerHTML = 'window.qwipsAdmin = new QwipsAdmin(qwips);';
		return script;
	});
})();
