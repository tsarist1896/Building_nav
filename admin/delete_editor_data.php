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

	if(!empty($_POST)) {// object
		if(isset($_POST['object'])) {
			if($object = $_POST['object']) {
				if(isset($_POST['id'])) {
					if($id = (int)$_POST['id']) {
						switch($object) {
							case 'build':
								$result = deleteBuild($id);
								break;

							case 'floor':
								$result = deleteFloor($id);
								break;

							case 'room':
								$result = deleteRoom($id);
								break;

							default:
								$result['msg'] = "Удаление объекта типа '{$object}' не предусмотрено";
						}
					}
					else
						$result['msg'] = 'Получен пустой параметр id';
				}
				else
					$result['msg'] = 'В post запросе отсутствует параметр id';
			}
			else
				$result['msg'] = 'Получен пустой параметр object';
		}
		else
			$result['msg'] = 'В post запросе отсутствует параметр object';
	}
	else
		$result['msg'] = 'Post запрос не имеет параметров';

	die(json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
handler();



/**
 * Удаление данных помещения
 * @param int $id -- id помещения
 * @return array
 */
function deleteRoom($id) {
	require_once(MODEL_DIR.'roomModel.php');
	$result = [
		'ok'  => false,
		'msg' => ''
	];

	$RM = new roomModel();

	if($RM->deleteRoom($id)) {
		$result = [
			'ok'  => true,
			'redirect' => [
				'section' => 'root'
			]
		];
	}
	else
		$result['msg'] = 'Не удалось удалить помещение из базы';

	return $result;
}



/**
 * Удаление даных этажа
 * @param int $id -- id этажа
 * @return array
 */
function deleteFloor($id) {
	require_once(MODEL_DIR.'floorModel.php');
	$result = [
		'ok'  => false,
		'msg' => ''
	];

	$FM = new floorModel();

	if($FM->deleteFloor($id)) {
		$result = [
			'ok'  => true,
			'redirect' => [
				'section' => 'root'
			]
		];
	}
	else
		$result['msg'] = 'Не удалось удалить этаж из базы';

	return $result;
}



/**
 * Удаление даных здания
 * @param int $id -- id здания
 * @return array
 */
function deleteBuild($id) {
	require_once(MODEL_DIR.'buildModel.php');
	$result = [
		'ok'  => false,
		'msg' => ''
	];

	$BM = new buildModel();

	if($BM->deleteBuild($id)) {
		$result = [
			'ok'  => true,
			'redirect' => [
				'section' => 'root'
			]
		];
	}
	else
		$result['msg'] = 'Не удалось удалить здание из базы';

	return $result;
}