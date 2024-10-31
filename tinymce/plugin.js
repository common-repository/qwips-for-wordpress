// Docu : http://wiki.moxiecode.com/index.php/TinyMCE:Create_plugin/3.x#Creating_your_own_plugins

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('qwips_tinymce');

	tinymce.create('tinymce.plugins.qwips_tinymce', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
			ed.addCommand('mceInsertQwip', function() {
				window.qwipsAdmin.mceInsertQwip();
			});

			// Register example button
			ed.addButton('qwips_tinymce', {
				title : ed.getLang('qwips_tinymce.buttonToolTip', 'Insert a Qwip'),
				cmd : 'mceInsertQwip',
				image : url + '/img/logo_32.png'
			});
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname  : 'qwips_tinymce',
				author 	  : 'QWiPS',
				authorurl : 'http://qwips.com/',
				infourl   : 'http://qwips.com/',
				version   : "1.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('qwips_tinymce', tinymce.plugins.qwips_tinymce);
})();


