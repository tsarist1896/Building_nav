<?php
class buildModel {
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
	 * Возвращает данные всех зданий
	 * @return array
	 */
	function getAllBuilds() {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_buildings`'
		);

		$result = [];
		while($builds = $query->fetch_assoc()) {
			// $builds['borders']     = json_decode($builds['borders'], true);
			$result[$builds['id']] = $builds;
		}


		return $result;
	}



	/**
	 * Возвращает данные здания по id
	 * @param  int $id -- id здания
	 * @return array
	 */
	function getBuildById($id) {
		$query = $this->db->query(
			'SELECT *
			   FROM `bn_buildings`
			  WHERE id = ' . (int)$id
		);

		return $query->fetch_assoc();
	}



	/**
	 * Возвращает данные здания по названию здания
	 * @param  string     $name -- название здания
	 * @return bool|array       -- возвращает данные здания или false, если здание не найдено
	 */
	function getBuildByName($name) {
		$result = false;

		// подготовка запроса
		$prepare = $this->db->prepare(
			'SELECT `id`, `name`, `longitude`, `latitude`, `borders`
			   FROM `bn_buildings`
			  WHERE name = ?
			  LIMIT 1'
		);

		if ($prepare) {
			if ($bind = $prepare->bind_param('s', $name)) { // привязка
				if($execute = $prepare->execute()) {
					// получаем 1ю строку
					$result = $prepare->get_result()->fetch_array(MYSQLI_ASSOC);

					// закрываем запрос
					$prepare->close();
				}
			}
		}

		return $result;
	}



	/**
	 * Возвращает данные здания по географическим координатам
	 * @param  string     $longitude -- долгота
	 * @param  string     $latitude  -- широта
	 * @return bool|array            -- возвращает данные здания или false, если здание не найдено
	 */
	function getBuildByNavCoord($longitude, $latitude) {
		$result = true;

		// подготовка запроса
		$prepare = $this->db->prepare(
			'SELECT *
			   FROM `bn_buildings`
			  WHERE longitude = ?
			    AND latitude = ?'
		);

		if ($prepare) {
			if ($bind = $prepare->bind_param('ss', $longitude, $latitude)) { // привязка
				if($execute = $prepare->execute()) {
					// получаем 1ю строку
					$result = $prepare->get_result()->fetch_array(MYSQLI_ASSOC);

					// закрываем запрос
					$prepare->close();
				}
			}
		}

		return $result;
	}



	/**
	 * Вносит в базу данные о новом здании
	 * @param  string     $name       -- название здания
	 * @param  string     $longitude  -- долгота
	 * @param  string     $latitude   -- широта
	 * @param  string     $borders    -- json массив границ здания
	 * @return bool|int               -- возвращает id новой записи или false, если здание не удалось внести в бд
	 */
	function createBuild($name, $longitude, $latitude, $borders) {
		$result = false;

		// подготовка запроса
		$prepare = $this->db->prepare(
			'INSERT INTO `bn_buildings`
			 (`name`, `longitude`, `latitude`, `borders`)
			 VALUES (?, ?, ?, ?)'
		);

		if ($prepare) {
			if ($bind = $prepare->bind_param('ssss', $name, $longitude, $latitude, $borders)) { // привязка
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
	 * Обновление данных здания
	 * @param  array    $parametrs -- данные здания
	 * @return bool|int            -- возвращает id новой записи или false, если запись здания не удалось обновить в бд
	 */
	function updateBuild($parametrs) {
		$result = false;
		if(!empty($parametrs)) {
			$fields = [
				'id'        => 'i',
				'name'      => 's',
				'longitude' => 's',
				'latitude'  => 's',
				'borders'   => 's'
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
				'INSERT INTO `bn_buildings`
				('.implode(', ', $cols).')
				VALUES ('.implode(', ', $qvalues).')
				ON DUPLICATE KEY UPDATE name = VALUES(name), longitude = VALUES(longitude), 
										latitude = VALUES(latitude), borders = VALUES(borders)'
			);


			if ($prepare) {
				$bind_param = array_merge([implode('', $types)], $values);
				if ($bind   = call_user_func_array([$prepare, 'bind_param'], $bind_param)) { // привязка
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
	 * Удаляет данные здания
	 * @param  int  $id -- id здания
	 * @return bool
	 */
	function deleteBuild($id) {
		$query = $this->db->query(
			'DELETE FROM `bn_buildings`
			  WHERE id = ' . (int)$id
		);

		return $query;
	}
}