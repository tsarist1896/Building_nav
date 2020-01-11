<?php
class floorModel {
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
	 * Возвращает данные всех этажей
	 * @return array
	 */
	function getAllFloors() {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_floors`'
		);

		$result = [];
		while($floors = $query->fetch_assoc()) {
			$result[$floors['id']] = $floors;
		}

		return $result;
	}



	/**
	 * Возвращает данные этажа
	 * @param  int        $build_id -- id здания
	 * @param  int        $floor_id -- id этажа
	 * @return bool|array           -- возвращает данные этажа или false, если этаж не найден
	 */
	function getBuildFloor($build_id, $floor_id) {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_floors`
			  WHERE build_id = '. (int)$build_id .
			'   AND id = '. (int)$floor_id
		);

		$result = false;
		if($query && $floor = $query->fetch_assoc())
			$result= $floor;

		return $result;
	}



	/**
	 * Возвращает данные этажа здания по номеру
	 * @param  int        $build_id -- id здания
	 * @param  int        $num      -- номер этажа
	 * @return bool|array           -- возвращает данные этажа или false, если этаж не найден
	 */
	function getBuildFloorByNum($build_id, $num) {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_floors`
			  WHERE build_id = '. (int)$build_id .
			'   AND number = '. (int)$num
		);

		$result = false;
		if($query && $floor = $query->fetch_assoc())
			$result = $floor;

		return $result;
	}



	/**
	 * Вносит в базу данные о новом этаже здания
	 * @param  int      $build_id  -- id здания
	 * @param  int      $floor_num -- номер этажа
	 * @param  string   $objects   -- json массив планировки этажа
	 * @return bool|int            -- возвращает id новой записи или false, если этаж не удалось внести в бд
	 */
	function createFloor($build_id, $floor_num, $objects) {
		$result = false;

		// подготовка запроса
		$prepare = $this->db->prepare(
			'INSERT INTO `bn_floors`
			 (`build_id`, `number`, `objects`)
			 VALUES (?, ?, ?)'
		);

		if ($prepare) {
			if ($bind = $prepare->bind_param('iis', $build_id, $floor_num, $objects)) { // привязка
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
	 * Обновление данных этажа
	 * @param  array    $parametrs -- данные этажа
	 * @return bool|int            -- возвращает id новой записи или false, если запись этажа не удалось обновить в бд
	 */
	function updateFloor($parametrs) {
		$result = false;
		if(!empty($parametrs)) {
			$fields = [
				'id'       => 'i',
				'build_id' => 'i',
				'number'   => 'i',
				'objects'  => 's',
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
				'INSERT INTO `bn_floors`
				('.implode(', ', $cols).')
				VALUES ('.implode(', ', $qvalues).')
				ON DUPLICATE KEY UPDATE build_id = VALUES(build_id), number = VALUES(number), 
										objects = VALUES(objects)'
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
	 * Удаляет данные этажа
	 * @param  int  $id -- id этажа
	 * @return bool
	 */
	function deleteFloor($id) {
		$query = $this->db->query(
			'DELETE FROM `bn_floors`
			  WHERE id = ' . (int)$id
		);

		return $query;
	}
}