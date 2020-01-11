/*
 *******************************************
 ****** Расширяем исходный функционал ******
 *******************************************
*/
Object.defineProperty(String.prototype, 'ucfirst', {
	'value': function() {
		return this[0].toUpperCase() + this.slice(1);
	},
	'enumerable': false
});

Object.defineProperty(Array.prototype, 'inArray', {
	'value': function(value) {
		var result = false;

		for(var i=0; i < this.length; i++) {
			if(this[i] == value) {
				result = true;
				break;
			}
		}

		return result;
	},
	'enumerable': false
});


Math.sinInDeree = function(num) {
	var radian = Math.asin(num);     // угол в радианах
	return (radian * 180 / Math.PI); // угол в градусах
};
JSON.safeParse = function(string) {
	var result = false;

	if(typeof string === 'string') {
		try {
			result = JSON.parse(string);
		}
		catch(e) {};
	}

	return result;
};




function buildingNav(initParams) {
	/*
	 *******************************************
	 **************** Проверки *****************
	 *******************************************
	*/
	if(typeof window.$ === 'undefined') {
		alert('buildingNav: Не найдена библитека jQuery!');
		return 0;
	}

	var $bna = $('.building_nav:eq(0)').html('');
	if(!$bna.length) {
		alert('buildingNav: Не нейден контейнер (".building_nav") для модуля!');
		return 0;
	}

	if(typeof window.fabric === 'undefined') {
		$bna.html('buildingNav: Не найдена библитека Fabric.js!').css('color', 'red');
		return 0;
	}

	fabric.Canvas.prototype.getObjectById = function(id) {
		var result  = false;
		var objects = this.getObjects();
		for (var i=0; i < objects.length; i++) {
			if (objects[i].id && objects[i].id === id) {
				result = objects[i];
				break;
			}
		}

		return result;
	};


	/*
	 *******************************************
	 ********** Полученные параметры ***********
	 *******************************************
	*/
	if(typeof initParams === 'undefined')
		initParams = {};

	if(initParams.debug)
		$bna.addClass('debug');

	if(typeof initParams.open === 'undefined')
		initParams.open = '/';

	if(typeof initParams.width === 'undefined')
		initParams.width = 0;
	else {
		initParams.width = parseInt(initParams.width);

		if(initParams.width) {
			$bna.width(initParams.width);

			if(initParams.width < 900)
				$bna.addClass('mobile');
		}
	}

	if(typeof initParams.height === 'undefined')
		initParams.height = 0;
	else
		initParams.height = parseInt(initParams.height);

	if(typeof initParams.city === 'undefined')
		initParams.city = 'Москва';

	if(typeof initParams.urls === 'undefined')
		initParams.urls = {};

	if(typeof initParams.urls.images === 'undefined')
		initParams.urls.images = '/images/buildingnav/';

	if(typeof initParams.urls.loadingBuilds === 'undefined')
		initParams.urls.loadingBuilds = '';


	/*
	 *******************************************
	 ************* Свойства модуля *************
	 *******************************************
	*/
	var bna     = this;
	var $main   = null;
	var msg     = new Messages();
	var model   = new Model();
	var header  = new Header();
	var menu    = new Menu();
	var main    = new Main();

	var pageAddress = {// Текущий внутренний адрес
		'address'  : '',
		'structure': [] // структура адреса
	};




	/*
	 *******************************************
	 ************** Методы модуля **************
	 *******************************************
	*/
	/**
	 * Парсер адреса
	 * @param  {string} a -- адрес
	 * @return {array}
	 */
	function parseAddress(a) {
		var result = [];
		var levels = a.split('/');

		for(i in levels) {
			var level = levels[i].trim();

			if(level) {
				var lData = level.split('-');
				if(lData.length == 2)
					result.push({
						'object': lData[0],
						'id'    : lData[1]
					});
				else
					result.push(lData[0]);
			}
		}

		return result;
	}



	/**
	 * Открытие содержимого нужного раздела
	 * @param {string} a -- адрес
	 */
	function router(a) {
		var oldStruct = pageAddress.structure;
		var structure = parseAddress(a);
		if(!structure.length && !['', 'root'].inArray(a))
			a = '';

		pageAddress.address   = a;
		pageAddress.structure = structure;

		var section = (structure[0] ? (structure[0].object ? structure[0].object : structure[0]) : '');
		switch(section) {
			case 'build':
				menu.choose(pageAddress.address);
				var subsection = (structure[1] ? (structure[1].object ? structure[1].object : structure[1]) : '');
				switch(subsection) {
					case 'path_to_build':
						main.openLoading();
						main.openPathToBuildPage(structure[0].id);
						break;

					case 'floor':
						var oldBuildId = oldStruct[0] && oldStruct[0].id ? oldStruct[0].id : false;
						var oldFloorId = oldStruct[1] && oldStruct[1].id ? oldStruct[1].id : false;
						if(oldBuildId === structure[0].id && oldFloorId === structure[1].id) {
							main.openBuildMapPage(structure, true);
						}
						else {
							main.openLoading();
							main.openBuildMapPage(structure);
						}
						break;
				}
				break;

			case '':
			case 'root':
				menu.choose('/');
				main.openRoot();
				break;

			default:
				msg.error('Попытка открытия несуществующего раздела "'+section+'"', pageAddress);
		}
	};














	/*
	 *******************************************
	 ********* Вывод сообщений модуля **********
	 *******************************************
	*/
	function Messages() {
		var list = {
			'error'  : [],
			'warning': [],
			'notice' : [],
			'message': []
		};

		/**
		 * Возвращает текущую дату
		 * @return {object}
		 */
		var getCurrentDate = function() {
			var dt = new Date();

			return {
				'human': dt.getFullYear() +'-'+ dt.getMonth() +'-'+ dt.getDate() +' '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds() +'.'+ dt.getMilliseconds(),
				'UNIX' : dt.getTime()
			};
		}


		/**
		 * Функция вывода сообщений в терминал
		 * @param {string} type -- тип сообщения
		 * @param {string} msg  -- текст сообщения
		 * @param {object} obj  -- объект с деталями сообщения
		 */
		function log(type, msg, obj) {
			if(typeof list[type] === 'undefined')
				type = 'message';

			var date = getCurrentDate();
			list[type].push({
				'date': date,
				'msg' : msg
			});

			msg += '\n';

			var title       = '%cBuilding nav ';
			var title_style = '';
			switch (type) {
				case 'error':
					title       += 'error:';
					title_style  = 'background-color: red; color: white; font-weight: bold;';
					break;

				case 'warning':
					title       += 'warning:';
					title_style  = 'background-color: orange; color: white; font-weight: bold;';
					break;

				case 'notice':
					title       += 'notice:';
					title_style  = 'background-color: yellow; font-weight: bold;';
					break;

				//case 'message':
				default:
					title       += 'message:';
					title_style  = 'background-color: silver; font-weight: bold;';
			}

			if(obj)
				console.log(title, title_style, msg, obj);
			else
				console.log(title, title_style, msg);
		};


		//----------- Обертки над функцией вывода сообщений -----------
		/**
		 * Вывод ошибки
		 * @param {string} msg -- текст сообщения
		 * @param {object} obj -- объект с деталями сообщения
		 */
		this.error = function(msg, obj) {
			log('error', msg, obj);
		}

		/**
		 * Вывод предупреждения
		 * @param {string} msg -- текст сообщения
		 * @param {object} obj -- объект с деталями сообщения
		 */
		this.warning = function(msg, obj) {
			log('warning', msg, obj);
		}

		/**
		 * Вывод замечания
		 * @param {string} msg -- текст сообщения
		 * @param {object} obj -- объект с деталями сообщения
		 */
		this.notice = function(msg, obj) {
			log('notice', msg, obj);
		}

		/**
		 * Вывод сообщения
		 * @param {string} msg -- текст сообщения
		 * @param {object} obj -- объект с деталями сообщения
		 */
		this.print = function(msg, obj) {
			log('message', msg, obj);
		}
	}





	/*
	 *******************************************
	 ************** Модель модуля **************
	 *******************************************
	*/
	function Model() {
		var builds = {},
			floors = {},
			rooms  = {};

		/**
		 * Возвращает список зданий
		 * @return {object}
		 */
		this.getBuilds = function() {
			return builds;
		}


		/**
		 * Создает структуру объектов зданий (здание -> этаж -> помещение)
		 */
		function createStructure() {
			for(b in builds) {
				builds[b].items = {};
			}

			for(f in floors) {
				floors[f].items = {};

				if(builds[floors[f].build_id])
					builds[floors[f].build_id].items[f] = floors[f];
			}

			for(r in rooms) {
				if(builds[rooms[r].build_id] && floors[rooms[r].floor_id])
					floors[rooms[r].floor_id].items[r] = rooms[r];
			}

			menu.refrashItems();
		}


		/**
		 * Возвращает сруктуру меню
		 * @return {array}
		 */
		this.getStructureMenu = function() {
			var structure = [
				{
					'title' : 'Здания на карте',
					'action': '',
					'class' : 'builds_in_map'
				}
			];

			for(b in builds) {
				var build = {
					'title' : builds[b].name,
					'class' : 'add_item',
					'action': 'build-'+b,
					'items' : [
						{
							'title' : 'Путь до здания',
							'class' : 'add_item',
							'action': 'path_to_build'
						}
					]
				};

				var bFloors = builds[b].items;
				if(bFloors) {
					for(f in bFloors) {
						var floor = {
							'title' : bFloors[f].number + ' этаж',
							'class' : 'add_item',
							'action': 'floor-'+f,
							'items' : [
								{
									'title' : 'Карта этажа',
									'class' : 'add_item',
									'action': 'map',
								}
							]
						};

						var fRooms = bFloors[f].items;
						if(typeof fRooms !== 'undefined') {
							for(r in fRooms) {
								fRooms[r].number = parseInt(fRooms[r].number);
								var rTitle = '';
								if(fRooms[r].number || fRooms[r].name) {
									if(fRooms[r].number)
										rTitle = fRooms[r].number + (fRooms[r].name ? (' - '+fRooms[r].name) : '');
									else
										rTitle = fRooms[r].name;
								}
								else
									rTitle = 'Помещение';


								floor.items.push({
									'title' : rTitle,
									'class' : 'add_item',
									'action': 'room-'+r
								});
							}
						}

						build.items.push(floor);
					}
				}

				structure.push(build);
			}

			return structure;
		}



		/**
		 * Возвращает основные данные зданий
		 * @return {object}
		 */
		this.getMainBuildsData = function() {
			var data = {};

			for(b in builds) {
				data[b] = {
					'id'       : parseInt(b),
					'latitude' : parseFloat(builds[b].latitude),
					'longitude': parseFloat(builds[b].longitude),
					'name'     : builds[b].name
				};
			}

			return data;
		};



		/**
		 * Возвращает основные данные здания по id
		 * @param  {number} id
		 * @return {object}
		 */
		this.getBuild = function(id) {
			var build = false;

			if(builds[id]) {
				build = {
					'id'        : parseInt(id),
					'latitude'  : parseFloat(builds[id].latitude),
					'longitude' : parseFloat(builds[id].longitude),
					'name'      : builds[id].name
				};
			}

			return build;
		}



		/**
		 * Возвращает данные этажа по id
		 * @param  {number} id
		 * @return {object}
		 */
		this.getFloor = function(id) {
			var floor = false;

			if(floors[id]) {
				var objects = JSON.safeParse(floors[id].objects);

				if(typeof objects === 'object') {
					var fRooms = floors[id].items;
					for(r in fRooms) {
						objects.push({
							'id'    : r,
							'type'  : 'room',
							'number': parseInt(fRooms[r].number),
							'name'  : fRooms[r].name,
							'data'  : JSON.safeParse(fRooms[r].data)
						});
					}
				}

				floor = {
					'id'       : parseInt(id),
					'build_id' : parseInt(floors[id].build_id),
					'number'   : parseInt(floors[id].number),
					'objects'  : objects
				};
			}

			return floor;
		}



		/**
		 * Возвращает данные помещения по id
		 * @param  {number} id
		 * @return {object}
		 */
		this.getRoom = function(id) {
			var room = false;

			if(rooms[id]) {
				room = {
					'id'       : parseInt(id),
					'build_id' : parseInt(rooms[id].build_id),
					'floor_id' : parseInt(rooms[id].floor_id),
					'number'   : parseInt(rooms[id].number),
					'name'     : rooms[id].name,
					'data'     : JSON.safeParse(rooms[id].data)
				};
			}

			return room;
		}



		/**
		 * Загрузка данных приложения
		 * @param {function} callback
		 */
		function loadBuildsData(callback) {
			$.post(initParams.urls.loadingBuilds, function(data) {
				var answer = JSON.safeParse(data);

				if(answer) {
					if(answer.builds && Object.keys(answer.builds).length)
						builds = answer.builds;

					if(answer.floors && Object.keys(answer.floors).length)
						floors = answer.floors;

					if(answer.rooms && Object.keys(answer.rooms).length)
						rooms = answer.rooms;

					createStructure();
					menu.updateStructure();

					if(typeof callback !== 'undefined')
						callback()
				}
				else {
					msg.warning('Model::loadBuildsData -- При загрузки информации о зданиях были получены некорректные данные', data);
					alert('При загрузки информации о зданиях были получены некорректные данные');
				}
			})
			.fail(function(data) {
				msg.error('Model::loadBuildsData -- Oшибка при попытке получения данных имеющихся зданий', data);
			});
		}

		loadBuildsData(function() {
			router(initParams.open);
		});
	}






	/*
	 *******************************************
	 ************** Шапка модуля ***************
	 *******************************************
	*/
	function Header() {
		var $header = $('<div />', {
			'class': 'bnav-header'
		}).appendTo($bna);
		var $menuButton = $('<div />', {
			'class': 'bnav-menu_button',
			'click': function(e) {
				var $this = $(this);
				var $menu = $('.bnav_menu');
				if($bna.hasClass('menu_open')) 
					$bna.removeClass('menu_open');
				else 
					$bna.addClass('menu_open');
			}
		}).appendTo($header);
		var $h2 = $('<h2 />', {
			'class': 'bnav-header_text',
			'text' : 'Building nav'
		}).appendTo($header);
		var $sectionName = $('<span />', {
			'class': 'bnav-section_name'
		}).appendTo($header);


		/**
		 * Устанавливает тест шапки модуля
		 * @param {string} text
		 */
		this.set = function(text) {
			$sectionName.text(text);
		};


		/**
		 * Возвращает высоту шапки модуля
		 * @return {number}
		 */
		this.getOuterHeight = function() {
			return parseInt($header.outerHeight());
		};
	}










	/*
	 *******************************************
	 *************** Меню модуля ***************
	 *******************************************
	*/
	function Menu() {
		var oMenu    = this;
		var structure = [];

		var $menu = $('<ul />', {
			'class': 'bnav_menu'
		}).appendTo($bna);



		/**
		 * Открытие закрытие раздела меню
		 * @param {*} e -- событие клика
		 */
		function toggleDropdown(e) {
			var $this   = $(this);
			var $parent = $this.parent();
			if($parent.hasClass('active'))
				$parent.removeClass('active');
			else
				$parent.addClass('active');
		};



		/**
		 * Клик по пункту меню (открытие пункта меню)
		 * @param {*} e -- событие клика
		 */
		function clickToItem(e) {
			var $this = $(this);
			var href  = $this.data('href');

			if(href)
				router(href);
			else
				msg.warning('Не найден адрес пункта меню', $this);
		};



		/**
		 * Обновление пунктов меню по имеющейся структуре меню
		 * сформированной функцией createStructure
		 */
		this.refrashItems = function() {
			$menu.html('');
			var address = [];
			function createMenuLevel(level, $container, struct) {
				if($container && $container.length) {
					for(var s in struct) {
						address[level]      = struct[s].action
						var currAddress     = address.slice(0, level + 1);
						var listItemClasses = ['a'+level+'_'+struct[s].action];

						if(struct[s].items)
							listItemClasses.push('bnav_menu-dropdown');
						else
							listItemClasses.push('bnav_menu-single_item');

						var $listItem = $('<li />', {
							'class': listItemClasses.join(' '),
						}).appendTo($container);
		
						var openButtParams = {
							'href'  : 'javascript:void(0)',
							'text'  : struct[s].title
						};
						var openButtClasses = [];
						if(struct[s].items) {
							openButtClasses.push('dropdown_button');
							openButtParams.click = toggleDropdown;
						}
						else {
							openButtParams['data-href'] = '/'+currAddress.join('/');
							openButtParams.click = clickToItem;
						}

						if(struct[s].class) 
							openButtClasses.push(struct[s].class);
						
						openButtParams.class = openButtClasses.join(' ');
		
						var $openButton = $('<a />', openButtParams).appendTo($listItem);
		
						if(struct[s].items) {
							var $openBox = $('<div />', {
								'class': 'menu-openbox'
							}).appendTo($listItem);

							var $subitems = $('<ul />', {
								'class': 'subitems'
							}).appendTo($openBox);

							createMenuLevel(level + 1, $subitems, struct[s].items);
						}
					}
				}
			};
			createMenuLevel(0, $menu, structure);
		};



		/**
		 * Обновление структуры данных
		 */
		this.updateStructure = function() {
			structure = model.getStructureMenu();
			oMenu.refrashItems();
		};



		/**
		 * Выбор элемента меню
		 * @param {string} address -- адрес пункта меню
		 */
		this.choose = function(address) {
			$menu.find('a[data-href]').removeClass('open_item');

			if(address) {
				var $a = $('a[data-href="'+address+'"]');
	
				if($a.length) {
					var $dropdowns = $a.parents('.bnav_menu-dropdown');
	
					if($dropdowns)
						$dropdowns.addClass('active');

					$a.addClass('open_item');
				}
				else
					msg.warning('В меню отсутствует пункт с адресом "'+address+'"');
			}
		};
	}





	/*
	 *******************************************
	 ********** Управление содержимым **********
	 *******************************************
	*/
	function Main() {
		var oMain = this;
		this.page = null;
		$main     = $('<div />', {
			'class': 'bnav_main'
		}).appendTo($bna);

		if(initParams.height)
			$main.height(initParams.height - header.getOuterHeight() - 2);
		else
			$main.height(window.innerHeight - header.getOuterHeight() - 2);



		/**
		 * Открытие главной страницы
		 */
		this.openRoot = function() {
			header.set('Все здания на карте');
			oMain.page = new RootPage();
		};



		/**
		 * Страница состояния загрузки
		 */
		this.openLoading = function() {
			header.set('Загрузка...');
			oMain.page = new LoadingPage();
		};



		/**
		 * Cтраница ошибки
		 * @param {string} html  -- html код
		 * @param {string} title -- заголовок ошибки
		 */
		this.openError = function(html, title) {
			header.set('Ошибка');
			oMain.page = new ErrorPage(html, title);
		};



		/**
		 * Открытие страницы пути до здания
		 * @param {number} id -- id здания
		 */
		this.openPathToBuildPage = function(id) {
			var buildData = model.getBuild(id);
			header.set('Путь до здания "'+ buildData.name +'"');
			oMain.page = new PathToBuildPage(id);
		};



		/**
		 * Открытие страницы карты здания
		 * @param {array}   newAddress -- новый адрес
		 * @param {boolean} onlyRoom   -- только подсветка помещения (без перерисовки планировки этажа)
		 */
		this.openBuildMapPage = function(newAddress, onlyRoom) {
			var build_id  = newAddress[0].id;
			var floor_id  = newAddress[1].id;
			var room_id   = newAddress[2] ? (newAddress[2].id ? newAddress[2].id : newAddress[2]) : false;
			var buildData = model.getBuild(build_id);
			var floorData = model.getFloor(floor_id);
			var roomData  = room_id ? model.getRoom(room_id) : false;
			var title     = '/ ' + buildData.name + ' / ' + floorData.number + ' этаж';
			// var room      = (newAddress[2] ? (newAddress[2].object ? newAddress[2].object : newAddress[2]) : '');
			if(roomData) {
				title += ' / ';

				if(roomData.number > 0 || roomData.name) {
					title += (roomData.number > 0 ? roomData.number : '');
					title += ' ' + (roomData.name ? roomData.name   : '');
				}
				else
					title += 'Помещение';
			}

			if(floorData) {
				if(oMain.page && onlyRoom) {
					oMain.page.highlightRoom(room_id !== 'map' ? room_id : false);
				}
				else {
					oMain.page = new BuildMapPage({
						'build_id': build_id,
						'floor_id': floor_id,
						'room_id' : room_id,
						'objects' : floorData.objects
					});
				}

				header.set(title);
			}
			else
				main.openError('Ошибка получения данных этажа', 'Ошибка данных этажа');
		};

		this.openLoading();

		this.resize = function() {
			if(oMain.page && oMain.page.resize)
				oMain.page.resize();
		};
	}



	





	/*
	 *******************************************
	 ************ Страница загрузки ************
	 *******************************************
	*/
	function LoadingPage() {
		var html = (
			'<div class="loading">' +
				'<h3>Загрузка объекта...</h3>' +
				'<ul class="load_animation">'+
					'<li></li>' +
					'<li></li>' +
					'<li></li>' +
					'<li></li>' + 
				'</ul>' +
			'</div>'
		);

		$main.html(html);
	}





	/*
	 *******************************************
	 ************* Страница ошибки *************
	 *******************************************
	*/
	function ErrorPage(html, title) {
		title = title ? title : 'Ошибка';
		var html = (
			'<div class="error">' +
				'<h3>'+ title +'</h3>' +
				html +
			'</div>'
		);

		$main.html(html);
	}





	/*
	 *******************************************
	 *********** Начальная страница ************
	 *******************************************
	*/
	function RootPage() {
		var $mapContainer = $();
		var buildCoords   = model.getMainBuildsData();

		if(typeof ymaps !== 'undefined') {
			$mapContainer = $('<div />', {
				'id'  : 'builds_in_map',
				'css' : {
					'height' : $main.height()
				}
			});

			if(initParams.height)
				$mapContainer.height(initParams.height - header.getOuterHeight() - 2);
			else
				$mapContainer.height(window.innerHeight - header.getOuterHeight() - 2);

			$main.html($mapContainer);

			ymaps.ready(showBuilds);
		}
		else 
			main.openError('Не подгрузился Яндекс JavaScript API');


		/**
		 * Отображение всех зданий на карте
		 */
		function showBuilds() {
			var buildDots = {
				'type'    : 'FeatureCollection',
				'features': []
			};

			var centerCoords  = [0, 0];
			var i             = 0;

			for(b in buildCoords) {
				centerCoords[0] += buildCoords[b].latitude;
				centerCoords[1] += buildCoords[b].longitude;
				

				buildDots.features.push({
					'type': 'Feature',
					'id': b,
					'geometry': {
						'type': 'Point', 
						'coordinates': [buildCoords[b].latitude, buildCoords[b].longitude]
					}, 
					'properties': {
						'balloonContentHeader': '<font size=3><b>'+buildCoords[b].name+'</b></font>'
					}
				});

				i++;
			}

			if(i) {
				centerCoords[0] = centerCoords[0] / i;
				centerCoords[1] = centerCoords[1] / i;
			}

			var myMap = new ymaps.Map('builds_in_map', 
				{
					'center': centerCoords,
					'zoom'  : 12
				},
				{
					'searchControlProvider': 'yandex#search'
				}
			);

			var objectManager = new ymaps.ObjectManager({
				'clusterize': true,
				'gridSize'  : 32,
				'clusterDisableClickZoom': true
			});

			objectManager.objects.options.set('preset', 'islands#greenDotIcon');
			objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
			myMap.geoObjects.add(objectManager);
			objectManager.add(buildDots);
		}

		this.resize = function() {
			var height = (initParams.height ? initParams.height : window.innerHeight) - header.getOuterHeight() - 2;
			$mapContainer.height(height);
			$main.height(height);
		};
	}






	/*
	 *******************************************
	 ************* Путь до здания **************
	 *******************************************
	*/
	function PathToBuildPage(id) {
		var $mapContainer = $();
		var build         = model.getBuild(id);

		if(build) {
			if(typeof ymaps !== 'undefined') {
				$mapContainer = $('<div />', {
					'id': 'path_to_build'
				});

				if(initParams.height)
					$mapContainer.height(initParams.height - header.getOuterHeight() - 2);
				else
					$mapContainer.height(window.innerHeight - header.getOuterHeight() - 2);
				
				$main.html($mapContainer);

				ymaps.ready(toBuild);
			}
			else 
				main.openError('Не подгрузился Яндекс JavaScript API');
		}
		else
			main.openError('Не удалось получить координаты здания');


		/**
		 * Путь до здания
		 */
		function toBuild() {
			function showMap(a, b) {
				// Задаём точки мультимаршрута.
				var referencePoints = [];

				if(typeof a === 'undefined')
					a = initParams.city;

				referencePoints.push(a);

				if(typeof b !== 'undefined')
					referencePoints.push(b);

				/**
				 * Создаем мультимаршрут.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml
				 */
				multiRoute = new ymaps.multiRouter.MultiRoute(
					{
						'referencePoints': referencePoints,
						'params': {
							'routingMode': 'masstransit'
						}
					},
					{
						// Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
						'boundsAutoApply': true
					}
				);


				var pedestrianButton = new ymaps.control.Button({ // Пешком
					'data': {
						'content': 'Пешком'
					},
					'options': {
						'selectOnClick': true
					}
				});

				var masstransitButton = new ymaps.control.Button({ // Общественный транспорт
					'data': {
						'content': 'Общественным транспортом'
					},
					'options': {
						'selectOnClick': true
					}
				});

				var onAutoButton = new ymaps.control.Button({ // На авто
					'data': {
						'content': 'На авто'
					},
					'options': {
						'selectOnClick': true
					}
				});

				pedestrianButton.events.add('select', function (e) {
					masstransitButton.deselect();
					onAutoButton.deselect();

					multiRoute.model.setParams({
						'routingMode': 'pedestrian'
					});
				});

				masstransitButton.events.add('select', function (e) {
					pedestrianButton.deselect();
					onAutoButton.deselect();

					multiRoute.model.setParams({
						'routingMode': 'masstransit'
					});
				});

				onAutoButton.events.add('select', function (e) {
					pedestrianButton.deselect();
					masstransitButton.deselect();

					multiRoute.model.setParams({
						'routingMode': 'auto'
					});
				});


				// Создаем карту с добавленной на нее кнопкой.
				var myMap = new ymaps.Map('path_to_build',
					{
						'center'  : a,
						'zoom'    : 12,
						'controls': [onAutoButton, masstransitButton, pedestrianButton]
					},
					{
						'buttonMaxWidth': 300
					}
				);


				// Добавляем мультимаршрут на карту.
				myMap.geoObjects.add(multiRoute);
				onAutoButton.select();
			}

			if(navigator) {
				navigator.geolocation.getCurrentPosition(
					function(position) {
						showMap([position.coords.latitude, position.coords.longitude], [build.latitude, build.longitude]);
					},
					function(error) {
						var errorType = '';
						switch(error.code) {
							case 1:
								errorType = 'PERMISSION_DENIED';
								break;
							case 2:
								errorType = 'POSITION_UNAVAILABLE';
								break;
							case 3:
								errorType = 'TIMEOUT';
								break;
						}

						msg.error('Не удалось получить текущие координаты.\n' + (errorType ? errorType + ': ' : '') + error.message);
						main.openError('Не удалось получить текущие координаты');
					}
				);
			}
		}

		this.resize = function() {
			var height = (initParams.height ? initParams.height : window.innerHeight) - header.getOuterHeight() - 2;
			$mapContainer.height(height);
			$main.height(height);
		};
	}










	/*
	 *******************************************
	 ************* Страница карты **************
	 *******************************************
	*/
	function BuildMapPage(mapData) {
		$main.html('');
		var oBuildMap   = this;
		var $canvasBox  = $();
		var scaleSquare = 50; // Квадрат сетки масштаба
		var canvas      = new Canvas();
		var bottomBar   = new BottomCanvasBar();


		function calcWidth() {
			return $main.width();
		}

		function calcHeight() {
			return (initParams.height ? initParams.height : window.innerHeight) - header.getOuterHeight() - 2;
		}



		/**
		 * Подсветка границ комнаты
		 * @param {number} room_id -- id помещения
		 */
		this.highlightRoom = function(room_id) {
			canvas.highlightRoom(room_id);
		};

		/*
		*******************************************
		************ Управление канвой ************
		*******************************************
		*/
		function Canvas() {
			var oCanvas      = this;
			var canvasMinX   = 0;
			var canvasMinY   = 0;
			var canvasMaxX   = 0;
			var canvasMaxY   = 0;

			var $canvas = $('<canvas />', {
				'id': 'buildMapCanvas'
			}).appendTo($main);

			fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

			var fcanv = new fabric.Canvas('buildMapCanvas', {
				'width'     : calcWidth(),
				'height'    : calcHeight(),
				'selection' : false,
			});
			fcanv.clear(); // Делаем прозрачным для отображения сетки
			var $canvasBox = $('.canvas-container'); 



			// Скролл
			var mouseover = false;
			/**
			 * Курсор мышки над канвой (для управления скролом с помощью клавиш)
			 * @return {boolean}
			 */
			this.mouseIsOver = function() {
				return mouseover;
			}
			$canvasBox.on('mouseover', function(e) { mouseover = true;  });
			$canvasBox.on('mouseout',  function(e) { mouseover = false; });


			/**
			 * Скролл с фиксированным шагом в определенном направлении
			 * @param {string} direction -- направление скролла
			 */
			this.scrollTo = function(direction) {
				var render = true;
				if(typeof direction == 'string')
					direction = direction.toLowerCase();

				switch(direction) {
					case 'up':
						fcanv.viewportTransform[5] += scaleSquare;
						if(fcanv.viewportTransform[5] > 0)
							fcanv.viewportTransform[5] = 0;
						break;

					case 'down':
						fcanv.viewportTransform[5] -= scaleSquare;
						break;

					case 'left':
						fcanv.viewportTransform[4] += scaleSquare;
						if(fcanv.viewportTransform[4] > 0)
							fcanv.viewportTransform[4] = 0;
						break;

					case 'right':
						fcanv.viewportTransform[4] -= scaleSquare;
						break;

					default:
						render = false;
				}
				correctScroll();

				if(render) {
					fcanv.renderAll();
					// fcanv.requestRenderAll();
				}
			};


			var mapScrollHandle = false;
			var prevCoords      = {};

			/**
			 * Обработка скрола с помощью мышки
			 * @param {*} e 
			 */
			function mapScroll(e) {
				fcanv.viewportTransform[4] += e.pointer.x - prevCoords.x;
				fcanv.viewportTransform[5] += e.pointer.y - prevCoords.y;
				correctScroll();

				fcanv.renderAll();

				prevCoords.x = e.pointer.x;
				prevCoords.y = e.pointer.y;
			}

			/**
			 * Корректировка координат скрола, чтобы скрол не выходил 
			 * за рамки этажа
			 */
			function correctScroll() {
				var minX = (-canvasMaxX + 100) / currentScale;
				var minY = (-canvasMaxY + 100) / currentScale;
				var maxX = (canvasMinX  + 100)  / currentScale;
				var maxY = (canvasMinY  + 100)  / currentScale;

				if(minX > fcanv.viewportTransform[4])
					fcanv.viewportTransform[4] = minX;
				if(minY > fcanv.viewportTransform[5])
					fcanv.viewportTransform[5] = minY;
				if(maxX < fcanv.viewportTransform[4])
					fcanv.viewportTransform[4] = maxX;
				if(maxY < fcanv.viewportTransform[5])
					fcanv.viewportTransform[5] = maxY;
			}

			fcanv.on('mouse:down', function(o){
				mapScrollHandle = mapScroll;
				prevCoords.x    = o.pointer.x;
				prevCoords.y    = o.pointer.y;
			});

			fcanv.on('mouse:move', function(o){
				if(typeof mapScrollHandle === 'function')
					mapScrollHandle(o);
			});

			fcanv.on('mouse:up', function(o){
				mapScrollHandle = false;
			});



			// Масштаб
			var currentScale = 1;
			/**
			 * установка указанного масштаба
			 * @param {number} scale -- масштаб
			 */
			this.setScale = function(scale) {
				if(currentScale != scale) {
					fcanv.setZoom(1 / scale);
					currentScale = scale;
				}
			};

			fcanv.on('mouse:wheel', function(opt) {
				var zoom = fcanv.getZoom(); // Текущий zoom
				if(opt.e.deltaY > 0)
					zoom /= 2;
				else
					zoom *= 2;

				// Устанавливаем ограничения
				if (zoom > 1)
					zoom = 1;
				if (zoom < 0.0625)
					zoom = 0.0625;

				var m = 1;
				if(zoom > 0.99)
					m = 1;
				else if(zoom > 0.49)
					m = 2;
				else if(zoom > 0.24)
					m = 4;
				else if(zoom > 0.124)
					m = 8;
				else // if(zoom > 0.0624)
					m = 16;
				
				bottomBar.refrashZoom(m);
				oCanvas.setScale(m);

				opt.e.preventDefault();
				opt.e.stopPropagation();
			});




			// ================   Добавление элементов на холст   ================
			var stairsParam = {
				'img'   : $().add('<img src="'+initParams.urls.images+'stairs_adm.svg">')
							 .add('<img src="'+initParams.urls.images+'stairs.svg">'),
				'width' : 128,
				'height': 64
			};
			var doorParam = {
				'img'   : $().add('<img src="'+initParams.urls.images+'door_adm.svg">')
							 .add('<img src="'+initParams.urls.images+'door.svg">'),
				'width' : 50,
				'height': 30
			};
			var roomBordersList = [];
			var roomLabel       = {
				'number': 22,
				'name'  : 17
			};



			/**
			 * Создает и возвращает объект стенки по полученным данным
			 * @param  {object} wCoords -- координаты концов стенки
			 * @return {object}
			 */
			function createWall(wCoords) {
				if(wCoords.x1 > canvasMaxX)
					canvasMaxX = wCoords.x1;
				if(wCoords.y1 > canvasMaxY)
					canvasMaxY = wCoords.y1;
				if(wCoords.x2 > canvasMaxX)
					canvasMaxX = wCoords.x2;
				if(wCoords.y2 > canvasMaxY)
					canvasMaxY = wCoords.y2;

				var line = new fabric.Line([wCoords.x1, wCoords.y1, wCoords.x2, wCoords.y2], {
					'obj_type'   : 'wall',
					'stroke'     : 'silver',
					'strokeWidth': 5,
					'selectable' : false,
					'evented'    : false
				});

				line.centeredRotation = false;
				line.hasBorders       = false;

				return line;
			}



			/**
			 * Создает и возвращает объект лестницы по полученным данным
			 * @param  {object} data -- данные лестницы
			 * @return {object}
			 */
			function createStairs(data) {
				if(data.x > canvasMaxX)
					canvasMaxX = data.x;
				if(data.y > canvasMaxY)
					canvasMaxY = data.y;

				return new fabric.Image(stairsParam.img[1], {
					'obj_type'   : 'stairs',
					'left'       : data.x,
					'top'        : data.y,
					'width'      : stairsParam.width,
					'height'     : stairsParam.height,
					'angle'      : data.angle,
					'scaleX'     : data.scaleX,
					'scaleY'     : data.scaleY,
					'selectable' : false,
					'evented'    : false,
					'hasRotatingPoint' : false
				});
			}



			/**
			 * Создает и возвращает объект двери по полученным данным
			 * @param  {object} data -- данные двери
			 * @return {object}
			 */
			function createDoor(data) {
				if(data.x > canvasMaxX)
					canvasMaxX = data.x;
				if(data.y > canvasMaxY)
					canvasMaxY = data.y;

				return new fabric.Image(doorParam.img[1], {
					'obj_type'   : 'door',
					'left'       : data.x,
					'top'        : data.y,
					'width'      : doorParam.width,
					'height'     : doorParam.height,
					'angle'      : data.angle,
					'scaleX'     : data.scaleX,
					'flipX'      : data.flipX,
					'flipY'      : data.flipY,
					'selectable' : false,
					'evented'    : false,
					'hasRotatingPoint' : false
				});
			}



			/**
			 * Создает границы помещения по полученным данным и возвращает 
			 * соответствующий объект
			 * @param  {number} id    -- id помещения
			 * @param  {object} rData -- данные по помещению
			 * @return {object}
			 */
			function createRoomBorder(id, rData) {
				if(typeof rData == 'undefined') 
					rData = {};
				if(typeof rData.number === 'undefined') 
					rData.number = '';
				if(typeof rData.name === 'undefined') 
					rData.name = '';
				if(typeof rData.left === 'undefined') 
					rData.left = 5;
				if(typeof rData.top === 'undefined') 
					rData.top = 5;
				if(typeof rData.coords === 'undefined' || !rData.coords.length)
					rData.coords = [{'x': 5, 'y': 5}];

				if(rData.left > canvasMaxX)
					canvasMaxX = rData.left;
				if(rData.top > canvasMaxY)
					canvasMaxY = rData.top;

				var mult       = (1 / fcanv.getZoom());
				var numberSize = roomLabel.number * mult;
				var rNumber    = rData.number ? (rData.number.toString()) : '';
				var number     = new fabric.Text(rNumber, {
					'id'         : id + '_number',
					'left'       : rData.left,
					'top'        : rData.top + 10,
					'fontSize'   : numberSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var nameSize = roomLabel.name * mult;
				var name     = new fabric.Text(rData.name, {
					'id'         : id + '_name',
					'left'       : rData.left,
					'top'        : rData.top - 10,
					'fontSize'   : nameSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var room = new fabric.Polyline(rData.coords, {
					'id'           : id,
					'fill'         : 'transparent',
					'left'         : rData.left,
					'top'          : rData.top,
					'number'       : number,
					'name'         : name,
					'objectCaching': false,
					'selectable'   : false,
					'evented'      : false,
				});

				name.room   = room;
				number.room = room;
				roomBordersList.push(room);

				return room;
			}



			/**
			 * Корректировка центра объекта границ помещения
			 * @param {*} o 
			 */
			function correctPositionRoomCenter(o) {
				var minX = -1,
					minY = -1,
					maxX = -1,
					maxY = -1;

				for(i in o.points) {
					if(minX < 0)
						minX = o.points[i].x;
					else if(o.points[i].x < minX)
						minX = o.points[i].x;

					if(minY < 0)
						minY = o.points[i].y;
					else if(o.points[i].y < minY)
						minY = o.points[i].y;

					if(maxX < 0)
						maxX = o.points[i].x;
					else if(o.points[i].x > maxX)
						maxX = o.points[i].x;

					if(maxY < 0)
						maxY = o.points[i].y;
					else if(o.points[i].y > maxY)
						maxY = o.points[i].y;
				}

				o.set({
					'left': minX + ((maxX - minX) / 2),
					'top' : minY + ((maxY - minY) / 2)
				});
			}



			/**
			 * Корректировка положения надписей помещения
			 * @param {*} o 
			 */
			function correctPositionRoomLabel(o) {
				var minX = -1,
					minY = -1,
					maxX = -1,
					maxY = -1;

				for(i in o.points) {
					if(minX < 0)
						minX = o.points[i].x;
					else if(o.points[i].x < minX)
						minX = o.points[i].x;

					if(minY < 0)
						minY = o.points[i].y;
					else if(o.points[i].y < minY)
						minY = o.points[i].y;

					if(maxX < 0)
						maxX = o.points[i].x;
					else if(o.points[i].x > maxX)
						maxX = o.points[i].x;

					if(maxY < 0)
						maxY = o.points[i].y;
					else if(o.points[i].y > maxY)
						maxY = o.points[i].y;
				}

				var x = minX + ((maxX - minX) / 2);
				var y = minY + ((maxY - minY) / 2);

				if(o.number.text) {
					o.number.set({
						'left': x,
						'top' : y - ((o.number.height / 1.5) + 5)
					});
	
					o.name.set({
						'left': x,
						'top' : y + ((o.name.height / 1.5) + 5)
					});
				}
				else {
					o.name.set({
						'left': x,
						'top' : y
					});
				}
			}




			/**
			 * Добавление объектов на канву. Используется при открытии этажа
			 * @param {object} objects -- список объектов планировки
			 */
			this.update = function(objects) {
				for(i in objects) {
					switch(objects[i].type) {
						case 'wall':
							object = createWall(objects[i]);
							fcanv.add(object);
							break;

						case 'stairs':
							object = createStairs(objects[i]);
							fcanv.add(object);
							break;

						case 'door':
							object = createDoor(objects[i]);
							fcanv.add(object);
							break;

						case 'room':
							object = createRoomBorder('room-' + objects[i].id, {
								'number' : parseInt(objects[i].number),
								'name'   : objects[i].name,
								'top'    : objects[i].data.top  ? objects[i].data.top  : 0,
								'left'   : objects[i].data.left ? objects[i].data.left : 0,
								'coords' : objects[i].data.dots ? objects[i].data.dots : []
							});

							correctPositionRoomCenter(object);
							correctPositionRoomLabel(object);

							fcanv.add(object).add(object.number).add(object.name);
							break;

						default:
						object = null;
					}
				}

				fcanv.requestRenderAll();
			};
			oCanvas.update(mapData.objects);



			/**
			 * Подсветка границ комнаты
			 * @param {number} room_id
			 */
			this.highlightRoom = function(room_id) {
				for(i in roomBordersList) {
					if(roomBordersList[i].fill !== 'transparent')
						roomBordersList[i].set({'fill': 'transparent'});
				}

				if(room_id !== false) {
					var room = fcanv.getObjectById('room-' + room_id);
	
					if(typeof room === 'object') {
						var canvWidth  = fcanv.getWidth();
						var canvHeight = fcanv.getHeight();
						var canvZoom   = 1 / fcanv.getZoom();

						fcanv.viewportTransform[4] = -(room.left - ((canvWidth * canvZoom)  / 2));
						fcanv.viewportTransform[5] = -(room.top  - ((canvHeight * canvZoom) / 2));

						correctScroll();
						room.set({'fill': 'rgba(0,0,200, 0.5)'});
					}
					else {
						fcanv.viewportTransform[4] = 0;
						fcanv.viewportTransform[5] = 0;
					}
				}
				else {
					fcanv.viewportTransform[4] = 0;
					fcanv.viewportTransform[5] = 0;
				}

				fcanv.renderAll();
			};

			if(mapData.room_id && mapData.room_id !== 'map')
				oCanvas.highlightRoom(mapData.room_id);


			this.resize = function() {
				fcanv.setWidth(calcWidth());
				fcanv.setHeight(calcHeight());
				fcanv.calcOffset();
			};
		}






		/*
		*******************************************
		****** Перемещение и масштабирование ******
		*******************************************
		*/
		function BottomCanvasBar() {
			var oBottomCanvasBar = this;

			var $bar = $('<div />', {
				'class': 'bnav_bottomCanvasBar'
			}).appendTo($main);

			var $scaleBlock = $('<ul />', {
				'class': 'bnav_scale'
			}).appendTo($bar);

			var $scaleReduce = $('<li />', {
				'class': 'bnav_scale-reduce',
				'text' : '-'
			}).appendTo($scaleBlock);
			var $scaleValue = $('<li />', {
				'class': 'bnav_scale-value',
				'text' : 1,
			}).appendTo($scaleBlock);
			var $scaleIncrease = $('<li />', {
				'class': 'bnav_scale-increase',
				'text' : '+'
			}).appendTo($scaleBlock);

			var $movingBlock = $('<ul />', {
				'class': 'bnav_moving'
			}).appendTo($bar);

			var $toUp = $('<li />', {
				'class'   : 'bnav_moving-toUp',
				'data-dir': 'up',
				'html'    : '&#9650;'
			}).appendTo($movingBlock);
			var $toLeft = $('<li />', {
				'class'   : 'bnav_moving-toLeft',
				'data-dir': 'left',
				'html'    : '&#9664;'
			}).appendTo($movingBlock);
			var $toDown = $('<li />', {
				'class'   : 'bnav_moving-toDown',
				'data-dir': 'down',
				'html'    : '&#9660;'
			}).appendTo($movingBlock);
			var $toRight = $('<li />', {
				'class'   : 'bnav_moving-toRight',
				'data-dir': 'right',
				'html'    : '&#9654;'
			}).appendTo($movingBlock);



			/**
			 * Изменение масштаба
			 * @param {*} e 
			 */
			function changeZoom(e) {
				var add = $(this).text() == '+';
				var x   = $scaleValue.text();
				if(add)
					x *= ((x <= 8) ? 2 : 1);
				else
					x /= ((x >= 2) ? 2 : 1);

				$scaleValue.text(x);
				canvas.setScale(x);
			}
			$scaleReduce.on('click', changeZoom);
			$scaleIncrease.on('click', changeZoom);



			/**
			 * Обновление значения масштаба
			 * @param {number} zoom -- значение зума в метрах
			 */
			this.refrashZoom = function(zoom) {
				$scaleValue.text(zoom);
			};



			/**
			 * Перемещение по карте с помощью специальных элементов
			 * @param {*} e 
			 */
			function scrollCanvas(e) {
				switch(e.type) {
					case 'keydown':
						if(canvas.mouseIsOver()) {
							switch((e.key).toLowerCase()) {
								case 'arrowup':
									e.preventDefault();
									canvas.scrollTo('up');
									break;

								case 'arrowdown':
									e.preventDefault();
									canvas.scrollTo('down');
									break;

								case 'arrowleft':
									e.preventDefault();
									canvas.scrollTo('left');
									break;

								case 'arrowright':
									e.preventDefault();
									canvas.scrollTo('right');
									break;
							}
						}
						break;

					case 'click':
						var dir = $(this).data('dir');
						if(dir)
							canvas.scrollTo(dir);
						break;
				}
			}
			document.addEventListener('keydown', scrollCanvas);
			$toUp.on('click', scrollCanvas);
			$toLeft.on('click', scrollCanvas);
			$toDown.on('click', scrollCanvas);
			$toRight.on('click', scrollCanvas);
		}


		this.resize = function() {
			var height = calcHeight();
			$main.height(height);
			$canvasBox.height(height);
			canvas.resize();
		};
	}



	/*
	 *******************************************
	 ************ Обработка resize ************
	 *******************************************
	*/
	window.addEventListener('resize', function(e) {
		if(initParams.width < 900 || window.innerWidth < 900)
			$bna.addClass('mobile');
		else
			$bna.removeClass('mobile');

		main.resize();
	});


	/*
	 *******************************************
	 ************* Открытые методы *************
	 *******************************************
	*/
	return {
		'router': router
	};
};
