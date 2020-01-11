<?php
define('ST_DEBUGING_TERMINAL', true);
function print_r_pre($object, $title = '', $script_die = true) {
	$key = '';
	if( !empty($title) ) {
		if(ST_DEBUGING_TERMINAL)
			print("Title: $title\n");
		else {
			echo '<div style="position: fixed; bottom: 0; right: 0; background-color: #dedede; padding: 0.2em; min-height: 1.3em; box-shadow: -2px -2px 2px silver, -2px 2px 2px silver;">';
			print('<b>'.$title.'</b>');
			echo '</div>';
		}
	}

	if(ST_DEBUGING_TERMINAL) {
		print_r($object);
		print("\n");
		if($script_die)
			die('');
	}
	else {
		print("<pre>\n");
		print_r($object);
		if($script_die)
			die('</pre>');
		else
			print('</pre>');
	}
}