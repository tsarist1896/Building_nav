<?php 
	require_once('../config.php');

/**
 * Обработчик запроса
 * @return JSON
 */
function handler() {
	$result = [
		'ok'  => false,
		'msg' => ''
	];
	if(!empty($_POST)) {
		$build_id = !empty($_POST['build']) ? (int)$_POST['build'] : 0;
		$floor_id = !empty($_POST['floor']) ? ($_POST['floor'] == 'add' ? 'add' : (int)$_POST['floor']) : 0;
		$room_id  = !empty($_POST['room'])  ? ($_POST['room']  == 'add' ? 'add' : (int)$_POST['room'])  : 0;

		// Загрузка для редактора помещения
		if($room_id) {
			if($build_id) {
				if($floor_id) {
					$floor = loadingFloor($build_id, $floor_id);

					if($floor['ok']) {
						$floorRooms                    = loadingFloorRooms($build_id, $floor_id, $room_id);
						$floorRooms['inactiveObjects'] = array_merge($floor['data']['objects'], $floorRooms['inactiveObjects']);

						if($room_id != 'add') {
							if(!empty($floorRooms['objects'])) {
								$result = [
									'ok'   => true,
									'data' => $floorRooms
								];
							}
							else
								$result['msg'] = 'Не найдено помещения по указанному id ('.$room_id.')';
						}
						else {
							$result = [
								'ok'   => true,
								'data' => $floorRooms
							];
						}
					}
					else
						$result['msg'] = $floor['msg'];
				}
				else
					$result['msg'] = 'Получено пустое значение id этажа';
			}
			else
				$result['msg'] = 'Получено пустое значение id здания';
		}
		// Загрузка для редактора этажа
		elseif($floor_id) {
			$build = loadingBuild($build_id);

			if($build['ok']) {
				if($floor_id != 'add') {
					$result = loadingFloor($build_id, $floor_id);

					if($result['ok'])
						$result['data']['inactiveObjects'] = $build['data']['objects'];
				}
				else
					$result = [
						'ok'   => true,
						'data' => [
							'inactiveObjects' => $build['data']['objects']
						]
					];
			}
			else
				$result['msg'] = $build['msg'];
		}
		// Загрузка для редактора границ здания
		elseif($build_id) {
			$result = loadingBuild($build_id);
		}
		else
			$result['msg'] = 'Были получены некорректные post данные';
	}
	else
		$result['msg'] = 'Запрос был отправлен без post данных';

	die(json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
handler();



/**
 * Загрузка и обработка данных здания
 * @param int $id -- id здания
 * @return array
 */
function loadingBuild($id) {
	require_once(MODEL_DIR.'buildModel.php');

	$result = [
		'ok'  => false,
		'msg' => ''
	];

	$BM    = new buildModel();
	$build = $BM->getBuildById($id);

	if($build) {
		$borders = json_decode($build['borders'], true);

		$result = [
			'ok'   => true,
			'data' => [
				'id'        => $id,
				'name'      => $build['name'],
				'longitude' => $build['longitude'],
				'latitude'  => $build['latitude'],
				'objects'   => $borders
			]
		];
	}
	else
		$result['msg'] = 'По указанному id ('.$id.') не найдено ни одного здания';

	return $result;
}


/**
 * Загрузка и обработка данных этажа
 * @param int $build_id -- id здания
 * @param int $floor_id -- id этажа
 * @return array
 */
function loadingFloor($build_id, $floor_id) {
	require_once(MODEL_DIR.'floorModel.php');
	$result = [
		'ok'  => false,
		'msg' => ''
	];

	$FM    = new floorModel();
	$floor = $FM->getBuildFloor($build_id, $floor_id);

	if($floor) {
		$objects = json_decode($floor['objects'], true);

		$result = [
			'ok'   => true,
			'data' => [
				'id'        => $floor_id,
				'build_id'  => $floor['build_id'],
				'floor_num' => $floor['number'],
				'objects'   => $objects
			]
		];
	}
	else
		$result['msg'] = 'По указанному id ('.$floor_id.') не найдено ни одного этажа';

	return $result;
}



/**
 * Загрузка и обработка данных помещений этажа
 * @param int $build_id -- id здания
 * @param int $floor_id -- id этажа
 * @param int $room_id -- id помещения
 * @return array
 */
function loadingFloorRooms($build_id, $floor_id, $room_id) {
	require_once(MODEL_DIR.'roomModel.php');
	$result = [
		'type'            => 'room',
		'id'              => $room_id,
		'build_id'        => $build_id,
		'floor_id'        => $floor_id,
		'room_num'        => '',
		'name'            => '',
		'objects'         => [],
		'inactiveObjects' => []
	];

	$RM    = new roomModel();
	$rooms = $RM->getFloorRooms($build_id, $floor_id);

	if(!empty($rooms[$room_id])) {
		$result['room_num'] = $rooms[$room_id]['number'];
		$result['name']     = $rooms[$room_id]['name'];

		array_push($result['objects'], [
			'type'     => 'room',
			'room_num' => $result['room_num'],
			'name'     => $result['name'],
			'left'     => $rooms[$room_id]['data']['left'],
			'top'      => $rooms[$room_id]['data']['top'],
			'data'     => $rooms[$room_id]['data']['dots']
		]);
		unset($rooms[$room_id]);
	}

	if(!empty($rooms)) {
		foreach($rooms as $r) {
			array_push($result['inactiveObjects'], [
				'type'     => 'room',
				'build_id' => $build_id,
				'floor_id' => $floor_id,
				'room_num' => $r['number'],
				'name'     => $r['name'],
				'left'     => $r['data']['left'],
				'top'      => $r['data']['top'],
				'dots'     => $r['data']['dots']
			]);
		}
	}

	return $result;
}