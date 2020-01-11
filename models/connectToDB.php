<?php
/**
 * Подключение к БД MySQL
 * @return resource
 */
function connectDB_MySQL() {
	// http://php.net/manual/ru/mysqli.quickstart.prepared-statements.php
	$db = new mysqli('localhost', '<user_name>', '<user_pass>', 'building_nav');

	/* изменение набора символов на utf8 */
	$db->set_charset('utf8');

	return $db;
}
