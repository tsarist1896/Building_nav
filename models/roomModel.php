<?php
class roomModel {
	private $db;

	function __construct() {
		if(function_exists('connectDB_MySQL')) {
			$this->db = connectDB_MySQL(); // Подключение к MySQL

			if($this->db->connect_errno)
				die('Не удалось подключиться к базе данных');
		}
		else
			die('Не удалось найти функцию подключения к базе данных');
	}


	function __distruct() {
		$this->db->close();
	}


	/**
	 * Возвращает данные всех помещений
	 * @return array
	 */
	function getAllRooms() {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_rooms`'
		);

		$result = [];
		while($floors = $query->fetch_assoc()) {
			$result[$floors['id']] = $floors;
		}

		return $result;
	}


	/**
	 * Возвращает все помещения этажа
	 * @param  int   $build_id -- id здания
	 * @param  int   $floor_id -- id этажа
	 * @return array
	 */
	function getFloorRooms($build_id, $floor_id) {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_rooms`
			  WHERE `build_id` = '. (int)$build_id .
			'   AND `floor_id` = '. (int)$floor_id
		);

		$result = [];
		while($floors = $query->fetch_assoc()) {
			$floors['data']        = json_decode($floors['data'], true);
			$result[$floors['id']] = $floors;
		}

		return $result;
	}



	/**
	 * Вносит в базу данные о новом помещении этажа
	 * @param  int      $build_id  -- id здания
	 * @param  int      $floor_id  -- id этажа
	 * @param  int      $room_num  -- номер помещения
	 * @param  string   $room_name -- название помещения
	 * @param  string   $data      -- json массив с границами помещения
	 * @return bool|int            -- возвращает id новой записи или false, если помещение не удалось внести в бд
	 */
	function createRoom($build_id, $floor_id, $room_num, $room_name, $data) {
		$result = false;

		// подготовка запроса
		$prepare = $this->db->prepare(
			'INSERT INTO `bn_rooms`
			 (`build_id`, `floor_id`, `number`, `name`, `data`)
			 VALUES (?, ?, ?, ?, ?)'
		);

		if ($prepare) {
			if ($bind = $prepare->bind_param('iiiss', $build_id, $floor_id, $room_num, $room_name, $data)) { // привязка
				$execute = $prepare->execute();

				if($execute) {
					$result = $prepare->insert_id;

					// закрываем запрос
					$prepare->close();
				}
			}
		}

		return $result;
	}



	/**
	 * Обновление данных помещения
	 * @param  array    $parametrs -- данные помещения
	 * @return bool|int            -- возвращает id новой записи или false, если запись помещения не удалось обновить в бд
	 */
	function updateRoom($parametrs) {
		$result = false;
		if(!empty($parametrs)) {
			$fields = [
				'id'        => 'i',
				'build_id'  => 'i',
				'floor_id'  => 'i',
				'number'    => 'i',
				'name'      => 's',
				'data'      => 's'
			];
			$cols    = [];
			$qvalues = [];
			$values  = [];
			$types   = [];

			foreach($parametrs as $p => $v) {
				if(!empty($fields[$p])) {
					$cols[]    =  '`'.$p.'`';
					$qvalues[] =  '?';
					$values[]  =  &$parametrs[$p];
					$types[]   =  $fields[$p];
				}
			}

			// подготовка запроса
			$prepare = $this->db->prepare(
				'INSERT INTO `bn_rooms`
				('.implode(', ', $cols).')
				VALUES ('.implode(', ', $qvalues).')
				ON DUPLICATE KEY UPDATE build_id = VALUES(build_id), floor_id = VALUES(floor_id), number = VALUES(number),
										name = VALUES(name), data = VALUES(data)'
			);


			if ($prepare) {
				$bind_param = array_merge([implode('', $types)], $values);
				if ($bind = call_user_func_array([$prepare, 'bind_param'], $bind_param)) { // привязка
					$execute = $prepare->execute();

					if($execute) {
						$result = $prepare->insert_id;

						// закрываем запрос
						$prepare->close();
					}
				}
			}
		}

		return $result;
	}



	/**
	 * Удаляет данные помещения
	 * @param  int  $id -- id помещения
	 * @return bool
	 */
	function deleteRoom($id) {
		$query = $this->db->query(
			'DELETE FROM `bn_rooms`
			  WHERE id = ' . (int)$id
		);

		return $query;
	}
}