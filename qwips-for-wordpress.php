<?php
/*
Plugin Name: QWiPS for WordPress
Plugin URI:
Description: Turns links to all Qwips into QWiPS Players and lets you attach Qwips to your posts
Version: 1.0
Author: QWiPS
Author URI: http://qwips.com
License: GPL2
*/

/*
	This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

define('QWIPS_BASE_URL', 'http://qwips.com');

function qwips_attach_script() {
	wp_enqueue_script('qwips-widget', QWIPS_BASE_URL.'/api/js/2');
	wp_enqueue_script('qwips-widget-customize', plugins_url('qwipscustomize.js', __FILE__));
}

function qwips_attach_script_admin($hook) {
	if($hook == 'post.php' || $hook == 'post-new.php') {
		wp_enqueue_script('qwips-widget-admin', plugins_url('qwipsadmin.js', __FILE__));
		wp_enqueue_style( 'qwips-widget-admin-css', plugins_url('qwipsadmin.css', __FILE__));
	}
}

function qwips_attach_meta_box() {
	add_meta_box(
		'qwips-history-metabox',
		__( 'Qwips History', 'qwips_textdomain' ),
		'qwips_metabox_inner',
		'post'
	);
	add_meta_box(
		'qwips-history-metabox',
		__( 'Qwips History', 'qwips_textdomain' ),
		'qwips_metabox_inner',
		'page'
	);
}

function qwips_metabox_inner($post){
	wp_nonce_field( 'qwips_tokens_history_nonce_value', 'qwips_tokens_history_nonce' );

	$curr_tokens = $post ? get_post_meta($post->ID, '_qwips_tokens_history', true) : "";

	echo '<input type="hidden" id="qwips_tokens_history" data-permalink="'.urlencode(get_post_permalink()).'" name="qwips_tokens_history" value="'.$curr_tokens.'" />';
	echo '<script type="text/javascript">window.QWIPS_BASE_URL=decodeURIComponent(\''.urlencode(QWIPS_BASE_URL).'\');</script>';
	echo '<div id="qwips-history-container">Loading...</div>';
}

function qwips_prepare_save_post($post_id) {
	// verify this came from the our screen and with proper authorization,
	// because save_post can be triggered at other times
	if ( !wp_verify_nonce( $_POST['qwips_tokens_history_nonce'], 'qwips_tokens_history_nonce_value' ) )
		return;

	// Check permissions
	if ( 'page' == $_POST['post_type'] )
	{
		if ( !current_user_can( 'edit_page', $post_id ) )
			return;
	}
	else
	{
		if ( !current_user_can( 'edit_post', $post_id ) )
			return;
	}

	$curr_tokens = get_post_meta($post_id, '_qwips_tokens_history', true);
	$curr_tokens = $curr_tokens ? explode(',', $curr_tokens) : array();

	$passed_tokens = $_POST['qwips_tokens_history'];
	$passed_tokens = $passed_tokens ? explode(',', $passed_tokens) : array();

	$final_tokens = array_merge($curr_tokens, $passed_tokens);
	$final_tokens = array_unique($final_tokens);
	$final_tokens = implode(',', $final_tokens);

	//save metadata
	delete_post_meta($post_id, '_qwips_tokens_history');
	add_post_meta($post_id, '_qwips_tokens_history', $final_tokens);
}

function qwips_prepare_display_post( $content ) {

	if($token = get_post_meta($GLOBALS['post']->ID, '_qwips_qwip_token', true)) {
		$content .= '<p>' . QWIPS_BASE_URL . '/' . $token.'</p>';
	}

	return $content;
}

function qwips_add_mce_buttons() {
	// Don't bother doing this stuff if the current user lacks permissions
	if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') ) {
		return;
	}

	// Add only in Rich Editor mode
	if ( get_user_option('rich_editing') == 'true') {
		add_filter("mce_external_plugins", "qwips_register_mce_plugin");
		add_filter('mce_buttons', 'qwips_register_mce_button');
	}
}

function qwips_register_mce_plugin($plugin_array) {
	$plugin_array['qwips_tinymce'] = plugins_url('tinymce/plugin.js', __FILE__);
	return $plugin_array;
}
function qwips_register_mce_button($buttons) {
   array_push($buttons, "separator", "qwips_tinymce");
   return $buttons;
}

// Non-admin pages scripts section
add_action('wp_enqueue_scripts', 'qwips_attach_script');

// Script action for the post new page
add_action( 'admin_enqueue_scripts', 'qwips_attach_script_admin' );

// MetaBox
add_action( 'add_meta_boxes', 'qwips_attach_meta_box' );

// POST SAVE
add_action( 'save_post', 'qwips_prepare_save_post' );

//POST DISPLAY
//add_filter( 'the_content', 'qwips_prepare_display_post' );

// init process for button control
add_action('init', 'qwips_add_mce_buttons');
