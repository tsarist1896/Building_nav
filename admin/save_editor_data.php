<?php 
	require_once('../config.php');
	require_once(MODEL_DIR.'buildModel.php');
	require_once(MODEL_DIR.'floorModel.php');
	require_once(MODEL_DIR.'roomModel.php');

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
		switch($_POST['part']) {
			case 'build':
				$result = handlBuildData();
				break;

			case 'floor':
				$result = handlFloorData();
				break;

			case 'room':
				$result = handlRoomData();
				break;

			default:
				$result['msg'] = 'Попытка сохранения данных неизвестной формы';
		}
	}
	else
		$result['msg'] = 'Запрос был отправлен без post данных';

	die(json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
handler();



/**
 * Обработка данных комнаты
 * @return array
 */
function handlRoomData() {
	$errors = [];
	$name   = $number = '';

	$build_id = isset($_POST['build_id']) ? (int)$_POST['build_id'] : 0;
	$floor_id = isset($_POST['floor_id']) ? (int)$_POST['floor_id'] : 0;

	if($build_id) {
		if($floor_id) {
			$room_id   = isset($_POST['room_id']) ? (int)$_POST['room_id']           : 0;
			$room_num  = isset($_POST['number'])  ? (int)$_POST['number']            : 0;
			$room_name = isset($_POST['name'])    ? htmlspecialchars($_POST['name']) : '';

			$itemText = '';
			if(!empty($room_num) || !empty($room_name)) {
				if($room_num)
					$itemText = $room_num . ($room_name ? (' '.$room_name) : '');
				else
					$itemText = $room_name;
			}
			else
				array_push($errors, 'Необходимо указать номер и/или название помещения');

			$data = [
				'left' => isset($_POST['room']['left']) ? (int)$_POST['room']['left'] : 0,
				'top'  => isset($_POST['room']['top'])  ? (int)$_POST['room']['top']  : 0,
				'dots' => []
			];

			// Добавлем углы
			if(!empty($_POST['room_dot'])) {
				foreach($_POST['room_dot'] as $rd) {
					array_push($data['dots'], [
						'type' => 'room_dot',
						'x'    => isset($rd['x']) ? (int)$rd['x'] : 0,
						'y'    => isset($rd['y']) ? (int)$rd['y'] : 0,
					]);
				}
			}

			$count_dots = count($data['dots']);
			if($count_dots) {
				if($count_dots < 3)
					array_push($errors, 'У границ комнаты должно быть не менее трех углов');
			}
			else
				array_push($errors, 'Обозначте границы комнаты (точки углов комнаты)');

			if(empty($errors)) {
				$RM = new roomModel();

				if(!$room_id) { // Создаем
					$data_json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($room_id = $RM->createRoom($build_id, $floor_id, $room_num, $room_name, $data_json)) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $itemText,
								'object' => 'room-'.$room_id
							]
						];
					}
					else
						array_push($errors, 'Не удалось создать помещение');
				}
				else { // Обновляем
					$data_json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($RM->updateRoom([
						'id'        => $room_id,
						'build_id'  => $build_id,
						'floor_id'  => $floor_id,
						'number'    => $room_num,
						'name'      => $room_name,
						'data'      => $data_json
					])) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $itemText,
								'object' => 'room-'.$room_id
							]
						];
					}
					else
						array_push($errors, 'Не удалось обновить данные этажа');
				}
			}
		}
		else
			array_push($errors, "Не был получен id этажа");
	}
	else
		array_push($errors, "Не был получен id здания");

	if(!empty($errors))
		$result['msg'] = implode(', ', $errors);

	return $result;
}



/**
 * Обработка данных этажа
 * @return array
 */
function handlFloorData() {
	$errors = [];
	$name   = $longitude = $latitude = '';

	// Обрабатываем мета данные об этаже
	$build_id = isset($_POST['build_id']) ? (int)$_POST['build_id']  : 0;

	if($build_id) {
		$floor_id  = isset($_POST['floor_id'])  ? (int)$_POST['floor_id']  : 0;
		$floor_num = isset($_POST['floor_num']) ? (int)$_POST['floor_num'] : 0;

		$FM         = new floorModel();
		$floorByNum = $FM->getBuildFloorByNum($build_id, $floor_num);

		if(empty($floorByNum) || $floorByNum['id'] == $floor_id) {
			$objects = [];

			// Добавлем стены
			if(!empty($_POST['wall'])) {
				foreach($_POST['wall'] as $w) {
					$x1 = isset($w['x1']) ? (int)$w['x1'] : 0;
					$y1 = isset($w['y1']) ? (int)$w['y1'] : 0;
					$x2 = isset($w['x2']) ? (int)$w['x2'] : 0;
					$y2 = isset($w['y2']) ? (int)$w['y2'] : 0;
		
					if($x1 !== $x2 || $y1 !== $y2) {
						array_push($objects, [
							'type' => 'wall',
							'x1'   => $x1,
							'y1'   => $y1,
							'x2'   => $x2,
							'y2'   => $y2
						]);
					}
				}
			}

			$count_walls = count($objects);
			if($count_walls) {
				if($count_walls < 3)
					array_push($errors, 'На этаже должно быть не менее трех стен');
			}
			else
				array_push($errors, 'Добавьте стены');

			// Добавлем лестницы
			if(!empty($_POST['stairs'])) {
				foreach($_POST['stairs'] as $s) {
					array_push($objects, [
						'type'   => 'stairs',
						'x'      => isset($s['x'])      ? (int)  $s['x']      : 0,
						'y'      => isset($s['y'])      ? (int)  $s['y']      : 0,
						'angle'  => isset($s['angle'])  ? (int)  $s['angle']  : 0,
						'scaleX' => isset($s['scaleX']) ? (float)$s['scaleX'] : 0,
						'scaleY' => isset($s['scaleY']) ? (float)$s['scaleY'] : 0
					]);
				}
			}

			// Добавлем двери
			if(!empty($_POST['door'])) {
				foreach($_POST['door'] as $d) {
					array_push($objects, [
						'type'   => 'door',
						'x'      => isset($d['x'])      ? (int)  $d['x']      : 0,
						'y'      => isset($d['y'])      ? (int)  $d['y']      : 0,
						'angle'  => isset($d['angle'])  ? (int)  $d['angle']  : 0,
						'flipX'  => isset($d['flipX'])  ? (int)  $d['flipX']  : 0,
						'flipY'  => isset($d['flipY'])  ? (int)  $d['flipY']  : 0,
						'scaleX' => isset($d['scaleX']) ? (float)$d['scaleX'] : 0
					]);
				}
			}

			if(empty($errors)) {
				if(!$floor_id) { // Создаем
					$objects_json = json_encode($objects, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($floor_id = $FM->createFloor($build_id, $floor_num, $objects_json)) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $floor_num.' этаж',
								'object' => 'floor-'.$floor_id
							]
						];
					}
					else
						array_push($errors, 'Не удалось создать этаж');
				}
				else { // Обновляем
					$objects_json = json_encode($objects, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($FM->updateFloor([
						'id'        => $floor_id,
						'build_id'  => $build_id,
						'number'    => $floor_num,
						'objects'   => $objects_json
					])) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $floor_num.' этаж',
								'object' => 'floor-'.$floor_id
							]
						];
					}
					else
						array_push($errors, 'Не удалось обновить данные этажа');
				}
			}
		}
		else
			array_push($errors, "Этаж {$floor_num} уже внесен в БД");
	}
	else
		array_push($errors, "Не был получен id здания");

	if(!empty($errors))
		$result['msg'] = implode(', ', $errors);

	return $result;
}



/**
 * Обработка данных здания
 * @return array
 */
function handlBuildData() {
	$errors = [];
	$name = $longitude = $latitude = '';

	// Обрабатываем мета данные о здании
	$build_id = isset($_POST['build_id']) ? (int)$_POST['build_id'] : 0;

	if(!empty($_POST['name']))
		$name = trim(htmlspecialchars($_POST['name']));
	else
		array_push($errors, 'Не указано название здания');

	$ll_pattern = '`^\d+\.\d+$`'; // Паттерн для проверки долготы и ширины
	if(!empty($_POST['longitude'])) {
		$longitude = trim(htmlspecialchars($_POST['longitude']));

		if(!preg_match($ll_pattern, $longitude))
			array_push($errors, 'Укажите значение долготы в правильном формате (например, "53.304462")');
	}
	else
		array_push($errors, 'Не указана долгота');

	if(!empty($_POST['latitude'])) {
		$latitude = trim(htmlspecialchars($_POST['latitude']));

		if(!preg_match($ll_pattern, $latitude))
			array_push($errors, 'Укажите значение широты в правильном формате (например, "34.303721")');
	}
	else
		array_push($errors, 'Не указана широта');


	// Обрабатываем данные по стенам
	$borders = [];
	if(!empty($_POST['wall'])) {
		foreach($_POST['wall'] as $w) {
			$x1 = isset($w['x1']) ? (int)$w['x1'] : 0;
			$y1 = isset($w['y1']) ? (int)$w['y1'] : 0;
			$x2 = isset($w['x2']) ? (int)$w['x2'] : 0;
			$y2 = isset($w['y2']) ? (int)$w['y2'] : 0;

			if($x1 !== $x2 || $y1 !== $y2) {
				array_push($borders, [
					'type' => 'wall',
					'x1'   => $x1,
					'y1'   => $y1,
					'x2'   => $x2,
					'y2'   => $y2
				]);
			}
		}
	}

	$count_walls = count($borders);
	if($count_walls) {
		if($count_walls < 3)
			array_push($errors, 'У здания должно быть не менее трех границ (стен)');
	}
	else
		array_push($errors, 'Укажите границы здания (добавьте стены)');


	if(empty($errors)) {
		$BM = new buildModel();

		if(!$build_id) { // Создаем
			if(!$BM->getBuildByName($name)) {
				if(empty($buildByNav = $BM->getBuildByNavCoord($longitude, $latitude))) {
					$borders_json = json_encode($borders, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($build_id = $BM->createBuild($name, $longitude, $latitude, $borders_json)) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $name,
								'object' => 'build-'.$build_id
							]
						];
					}
					else
						$result['msg'] = 'Не удалось создать здание';
				}
				else
					$result['msg'] = 'Здание ("'.$buildByNav['name'].'") с указанной навигационнной координатой ('.$longitude.', '.$latitude.') уже существует';
			}
			else
				$result['msg'] = 'Здание с названием "'.$name.'" уже существует';
		}
		else { // Обновляем
			$buildByName = $BM->getBuildByName($name);
			if(empty($buildByName) || $buildByName['id'] === $build_id) {
				$buildByNav = $BM->getBuildByNavCoord($longitude, $latitude);
				if(empty($buildByNav) || $buildByName['id'] === $build_id) {
					$borders_json = json_encode($borders, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

					if($BM->updateBuild([
						'id'        => $build_id,
						'name'      => $name,
						'longitude' => $longitude,
						'latitude'  => $latitude,
						'borders'   => $borders_json
					])) {
						$result = [
							'ok'   => true,
							'data' => [
								'name'   => $name,
								'object' => 'build-'.$build_id
							]
						];
					}
					else
						$result['msg'] = 'Не удалось обновить данные здания';
				}
				else
					$result['msg'] = 'Здание ("'.$byNav['name'].'") с указанной навигационнной координатой ('.$longitude.', '.$latitude.') уже существует';
			}
			else
				$result['msg'] = 'Здание с названием "'.$name.'" уже существует';
		}
	}
	else
		$result['msg'] = implode("\n", $errors);

	return $result;
}
