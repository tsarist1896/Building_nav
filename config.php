<?php
if(empty($conf_defined)) {
	if(isset($_GET['show_errors'])) {
		error_reporting(E_ALL); 
		ini_set('display_errors', 'On');
		set_time_limit(0);
	}

	define('ROOT_DIR',           '/home/tsarist1896/building_nav/');
	define('FILE_DIR',           ROOT_DIR);
	define('MODEL_DIR',          ROOT_DIR.'models/');
	define('ADMIN_DIR',          ROOT_DIR.'admin/');
	
	define('FRONTEND_DIR',       '/');
	define('FRONTEND_ADMIN_DIR', FRONTEND_DIR.'admin/');


	// Функции дебага
	require_once(FILE_DIR.'debug.php');

	// Подключение к БД
	require_once(MODEL_DIR.'connectToDB.php');

	$conf_defined = true;
}



