<?php
require_once('./config.php');
require_once(MODEL_DIR.'buildModel.php');
require_once(MODEL_DIR.'floorModel.php');
require_once(MODEL_DIR.'roomModel.php');


/**
 * Обработчик запроса
 * @return JSON
 */
function handler() {
	$result = [
		'builds' => [],
		'floors' => [],
		'rooms'  => []
	];


	$BM     = new buildModel();
	$builds = $BM->getAllBuilds();

	if(!empty($builds)) {
		foreach($builds as $b) {
			$result['builds'][$b['id']] = [
				'id'        => (int)$b['id'],
				'object'    => 'build',
				'name'      => $b['name'],
				'longitude' => $b['longitude'],
				'latitude'  => $b['latitude']
			];
		}
	}


	$FM     = new floorModel();
	$floors = $FM->getAllFloors();

	if(!empty($floors)) {
		foreach($floors as $f) {
			$result['floors'][$f['id']] = [
				'id'       => (int)$f['id'],
				'object'   => 'floor',
				'build_id' => (int)$f['build_id'],
				'number'   => (int)$f['number'],
				'objects'  => $f['objects']
			];
		}
	}


	$RM    = new roomModel();
	$rooms = $RM->getAllRooms();

	if(!empty($rooms)) {
		foreach($rooms as $r) {
			$result['rooms'][$r['id']] = [
				'id'       => (int)$r['id'],
				'object'   => 'room',
				'build_id' => (int)$r['build_id'],
				'floor_id' => (int)$r['floor_id'],
				'number'   => (int)$r['number'],
				'name'     => $r['name'],
				'data'     => $r['data']
			];
		}
	}

	die(json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
handler();
