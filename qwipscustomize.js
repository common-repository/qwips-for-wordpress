(function($$){
	var linkUrl = window.location.toString().replace(/([\?:&])referenced-qwip=(\d[a-z0-9]{5,9})/i, '$1referenced-qwip={QWIPTOKEN}');
	if(linkUrl.indexOf('referenced-qwip')==-1) {
		linkUrl += ( linkUrl.indexOf('?')!==-1 ? '&' : '?' ) + 'referenced-qwip={QWIPTOKEN}';
	}
	$$.linkUrl(linkUrl);

	$$.options({
		normalPlayerTitle: false,
		referencedQwipBehavior : 'scroll',
	    referencedQwipAutoPlay : true,
		referencedQwipTokenRegex : /(?:[\?|&]referenced-qwip=)(\d[a-z0-9]{5,9})/i,
		defaultPage:'sfx'
	});
})(qwips);
//,companionAnchor: 'tr'