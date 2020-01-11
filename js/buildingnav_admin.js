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




function buildingNavAdmin(initParams) {
	/*
	 *******************************************
	 **************** Проверки *****************
	 *******************************************
	*/
	if(typeof window.$ === 'undefined') {
		alert('buildingNavAdmin: Не найдена библитека jQuery!');
		return 0;
	}

	var $bna = $('.building_nav_admin:eq(0)').html('');
	if(!$bna.length) {
		alert('buildingNavAdmin: Не нейден контейнер (".building_nav_admin") для модуля!');
		return 0;
	}

	if(typeof window.fabric === 'undefined') {
		$bna.html('buildingNavAdmin: Не найдена библитека Fabric.js!').css('color', 'red');
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
	else
		initParams.width = parseInt(initParams.width);

	if(typeof initParams.height === 'undefined')
		initParams.height = 450;

	if(typeof initParams.urls === 'undefined')
		initParams.urls = {};

	if(typeof initParams.urls.images === 'undefined')
		initParams.urls.images = '/images/buildingnav/';

	if(typeof initParams.urls.loadingBuilds === 'undefined')
		initParams.urls.loadingBuilds = '';

	if(typeof initParams.urls.saveEditorData === 'undefined')
		initParams.urls.saveEditorData = '';

	if(typeof initParams.urls.deleteBuild === 'undefined')
		initParams.urls.deleteBuild = '';



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

	var pageAddress = {
		'address'  : '',
		'structure': []
	};



	/*
	 *******************************************
	 ************** Методы модуля **************
	 *******************************************
	*/
	/**
	 * Парсер адреса
	 * @param  string a -- адрес
	 * @return array
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
	 * @param string a -- адрес
	 */
	function router(a) {
		var structure = parseAddress(a);
		if(!structure.length && !['', 'root'].inArray(a))
			a = '';

		pageAddress.address   = a;
		pageAddress.structure = structure;

		var section = (structure[0] ? (structure[0].object ? structure[0].object : structure[0]) : '');
		switch(section) {
			case 'build':
				menu.choose(pageAddress.address);
				main.openLoading();
				main.openEditor(pageAddress.structure);
				break;
			case '':
			case 'root':
				menu.choose(pageAddress.address);
				main.openRoot();
				break
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
		 * @return object
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
		 * @param string type -- тип сообщения
		 * @param string msg  -- текст сообщения
		 * @param object obj  -- объект с деталями сообщения
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
		 * @param string msg -- текст сообщения
		 * @param object obj -- объект с деталями сообщения
		 */
		this.error = function(msg, obj) {
			log('error', msg, obj);
		}

		/**
		 * Вывод предупреждения
		 * @param string msg -- текст сообщения
		 * @param object obj -- объект с деталями сообщения
		 */
		this.warning = function(msg, obj) {
			log('warning', msg, obj);
		}

		/**
		 * Вывод замечания
		 * @param string msg -- текст сообщения
		 * @param object obj -- объект с деталями сообщения
		 */
		this.notice = function(msg, obj) {
			log('notice', msg, obj);
		}

		/**
		 * Вывод сообщения
		 * @param string msg -- текст сообщения
		 * @param object obj -- объект с деталями сообщения
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
		 * @return object
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
		 * @return array
		 */
		this.getStructureMenu = function() {
			var structure = [
				{
					'title' : 'Добавить здание',
					'action': 'build-add',
					'class' : 'add_item'
				}
			];

			for(b in builds) {
				var build = {
					'title' : builds[b].name,
					'class' : '',
					'action': 'build-'+b,
					'items' : [
						{
							'title' : 'Добавить этаж',
							'class' : 'add_item',
							'action': 'floor-add'
						}
					]
				};

				var bFloors = builds[b].items;
				if(bFloors) {
					for(f in bFloors) {
						var floor = {
							'title' : bFloors[f].number + ' этаж',
							'class' : '',
							'action': 'floor-'+f,
							'items' : [
								{
									'title' : 'Добавить помещение',
									'class' : 'add_item',
									'action': 'room-add',
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
									'class' : '',
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
		 * @return object
		 */
		this.getBuildCoords = function() {
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
					'id'        : id,
					'latitude'  : builds[id].latitude,
					'longitude' : builds[id].longitude,
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
		 * Загрузка данных приложения
		 * @param {function} callback
		 */
		this.loadingEditorData = function(requestData, callback) {
			$.post(initParams.urls.loadingEditorData, requestData, function(data) {
				var answer = JSON.safeParse(data);
				if(answer) {
					if(answer.ok)
						callback(answer);
					else
						alert(answer.msg);
				}
				else {
					main.openError('При загрузке данных объекта в ответ получены некорректные данные', 'Ошибка загрузки данных');
					msg.error('при загрузке данных объекта в ответ получены некорректные данные ("'+initParams.urls.loadingEditorData+'")', data);
				}
			})
			.fail(function(data) {
				main.openError('Ошибка при загрузке данных объекта ("'+initParams.urls.loadingEditorData+'")', 'Ошибка загрузки данных');
				msg.error('Ошибка при загрузке данных объекта ("'+initParams.urls.loadingEditorData+'")', data);
			});
		};



		/**
		 * Сохранение данных редактора в базу данных
		 * @param {object}   requestData -- данные формы редактора
		 * @param {function} callback    -- функция выполняемая после успешного сохранения данных
		 */
		this.saveEditorData = function(requestData, callback) {
			$.post(initParams.urls.saveEditorData, requestData, function(data) {
				var answer = JSON.safeParse(data);
				if(answer) {
					if(answer.ok)
						loadBuildsData(callback, answer.data);
					else
						alert(answer.msg);
				}
				else {
					msg.warning('при сохранении данных редактора в ответ получены некорректные данные ("'+initParams.urls.saveEditorData+'")', data);
					alert('При сохранении данных редактора в ответ получены некорректные данные');
				}
			})
			.fail(function(data) {
				msg.error('ошибка при попытке сохранения данных редактора ("'+initParams.urls.saveEditorData+'")', data);
				alert('Ошибка при попытке сохранения данных редактора');
			});
		};



		/**
		 * Удаление данных редактора из базы данных
		 * @param {object}   requestData -- данные удалаяемого объекта
		 * @param {function} callback    -- функция выполняемая после успешного удаления данных
		 */
		this.deleteEditorData = function(requestData, callback) {
			$.post(initParams.urls.deleteEditorData, requestData, function(data) {
				var answer = JSON.safeParse(data);
				if(answer) {
					if(answer.ok) {
						alert('Объект успешно удален');
						loadBuildsData(callback);
					}
					else
						alert(answer.msg);
				}
				else {
					msg.warning('при удалении данных здания в ответ получены некорректные данные ("'+initParams.urls.deleteBuild+'")', data);
					alert('При удалении данных здания в ответ получены некорректные данные');
				}
			})
			.fail(function(data) {
				msg.error('ошибка при попытке удалении данных здания ("'+initParams.urls.deleteBuild+'")', data);
				alert('Ошибка при попытке удалении данных здания');
			});
		};



		/**
		 * Загрузка данных приложения
		 * @param {function} callback
		 * @param {object}   callbackData данные передаваемые в callback
		 */
		function loadBuildsData(callback, callbackData) {
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
						callback(callbackData);
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
			'text' : 'Админка building nav'
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
		
							var $updateButton = $('<a />', {
								'href'     : 'javascript:void(0)',
								'data-href': '/'+currAddress.join('/'),
								'class'    : 'update_item',
								'text'     : 'Редактировать',
								'click'    : clickToItem
							}).appendTo($openBox);
		
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
		$main = $('<div />', {
			'class': 'bnav_main'
		}).appendTo($bna);



		/**
		 * Открытие главной страницы
		 */
		this.openRoot = function() {
			header.set('');
			oMain.page = new RootPage();
		};



		/**
		 * Страница состояния загрузки
		 */
		this.openLoading = function() {
			header.set('');
			oMain.page = new LoadingPage();
		};



		/**
		 * Cтраница ошибки
		 * @param {string} html  -- html код
		 * @param {string} title -- заголовок ошибки
		 */
		this.openError = function(html, title) {
			header.set('');
			oMain.page = new ErrorPage(html, title);
		};



		/**
		 * Открытие страницы редактора
		 * @param {array} aStructure -- структура адрес
		 */
		this.openEditor = function(aStructure) {
			var item  = aStructure[aStructure.length - 1];
			var title = item.id === 'add' ? 'Добавление' : 'Редактирование';

			if(['build', 'floor', 'room'].inArray(item.object)) {
				if(item.object == 'build' && item.id === 'add') {
					oMain.page = new EditorPage({
						'part': item.object,
						'id'  : item.id
					});
				}
				else {
					var requestData = {};
					for(i in aStructure) {
						requestData[aStructure[i].object] = aStructure[i].id;
					}

					model.loadingEditorData(requestData, function(answer) {
						oMain.page = new EditorPage({
							'part' : item.object,
							'id'   : item.id,
							'data' : answer.data
						});
					});
				}

				switch(item.object) {
					case 'build':
						title += ' здания';
						break;
					case 'floor':
						title += ' этажа';
						break;
					case 'room':
						title += ' помещения';
						break;
				}
			}
			else {
				title = 'Ошибка';
				main.openError('Ошибка загрузки пункта "'+item.object+'-'+item.id+'"');
				msg.error('Ошибка загрузки пункта "'+item.object+'-'+item.id+'"', aStructure);
			}

			header.set(title);
		};


		this.resize = function() {
			if(oMain.page && oMain.page.resize)
				oMain.page.resize();
		};
		// this.openRoot();
	}





	/*
	 *******************************************
	 *********** Начальная страница ************
	 *******************************************
	*/
	function RootPage() {
		var html = (
			'<p>Добро пожаловать в административную часть building_map</p>' +
			'<p>В меню (слева) вы можете добавлять и редактировать уже существующие объекты такие как здания, этажи, помещения</p>'
		);

		$main.html(html);
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
	 *********** Страница редактора ************
	 *******************************************
	*/
	function EditorPage(editorParams) {
		var oEditor      = this;
		var $canvasBlock = null;
		var scaleSquare  = 50; // Квадрат сетки масштаба
		var isUpdatePart = editorParams.id !== 'add';

		var $form = $('<form />', {
			'action': initParams.urls.saveEditorData,
			'method': 'post'
		});
		$main.html('').append($form);

		var metaBlock         = new MetaBlock();
		var topObjectsBar     = new TopObjectsBar();
		var canvas            = new Canvas();
		var metrage           = new Metrage();
		var bottomCanvasBar   = new BottomCanvasBar();
		var objectsList       = new ObjectsList();
		var buttonsBlock      = new ButtonsBlock();

		function calcWidth() {
			return $main.width();
		}

		function calcHeight() {
			return (initParams.height ? initParams.height : window.innerHeight) - header.getOuterHeight() - 2;
		}


		/**
		 * Название и метаданные
		 */
		function MetaBlock() {
			var $metaBlock = $('<div />', {
				'class': 'bnav-main_block'
			}).appendTo($form);

			var $header = $('<h3 />', {
				'class': 'bnav-main_header',
				'text' : 'Мета данные'
			}).appendTo($metaBlock);

			switch(editorParams.part) {
				case 'build':
					var $idInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'build_id',
						'value': ((editorParams.data && editorParams.data.id) ? editorParams.data.id : '')
					}).appendTo($metaBlock);
					
					var $nameLabel = $('<label />', {
						'for'  : 'build_name',
						'text' : 'Название'
					}).appendTo($metaBlock);
					var $nameInput = $('<input>', {
						'type'       : 'text',
						'name'       : 'name',
						'id'         : 'build_name',
						'placeholder': '2 корпус',
						'value'      : ((editorParams.data && editorParams.data.name) ? editorParams.data.name : '')
					}).appendTo($metaBlock);

					var $latitudeLabel = $('<label />', {
						'for' : 'build_latitude',
						'text': 'Широта'
					}).appendTo($metaBlock);
					var $latitudeInput = $('<input>', {
						'type'       : 'text',
						'name'       : 'latitude',
						'id'         : 'build_latitude',
						'value'      : ((editorParams.data && editorParams.data.latitude) ? editorParams.data.latitude : ''),
						'placeholder': '53.304462'
					}).appendTo($metaBlock);

					var $longitudeLabel = $('<label />', {
						'for' : 'build_longitude',
						'text': 'Долгота'
					}).appendTo($metaBlock);
					var $longitudeInput = $('<input>', {
						'type'       : 'text',
						'name'       : 'longitude',
						'id'         : 'build_longitude',
						'value'      : ((editorParams.data && editorParams.data.longitude) ? editorParams.data.longitude : ''),
						'placeholder': '34.303721'
					}).appendTo($metaBlock);
					break;

				case 'floor':
					var $buildIdInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'build_id',
						'value': ((pageAddress.structure[0] && pageAddress.structure[0].id) ? pageAddress.structure[0].id : '')
					}).appendTo($metaBlock);

					var $floorIdInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'floor_id',
						'value': ((editorParams.data && editorParams.data.id) ? editorParams.data.id : '')
					}).appendTo($metaBlock);

					var $numberLabel = $('<label />', {
						'for'  : 'floor_number',
						'text' : 'Номер этажа'
					}).appendTo($metaBlock);
					var $numberInput = $('<input>', {
						'type'       : 'number',
						'min'        : -20,
						'max'        : 200,
						'step'       : 1,
						'name'       : 'floor_num',
						'id'         : 'floor_number',
						'value'      : ((editorParams.data && editorParams.data.floor_num) ? editorParams.data.floor_num : 1)
					}).appendTo($metaBlock);
					break;

				case 'room':
					var $buildIdInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'build_id',
						'value': ((editorParams.data && editorParams.data.build_id) ? editorParams.data.build_id : '')
					}).appendTo($metaBlock);

					var $floorIdInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'floor_id',
						'value': ((editorParams.data && editorParams.data.floor_id) ? editorParams.data.floor_id : '')
					}).appendTo($metaBlock);

					var $roomIdInput = $('<input>', {
						'type' : 'hidden',
						'name' : 'room_id',
						'value': ((editorParams.data && editorParams.data.id) ? editorParams.data.id : '')
					}).appendTo($metaBlock);

					var $numberLabel = $('<label />', {
						'for'  : 'room_number',
						'text' : 'Номер'
					}).appendTo($metaBlock);
					var $numberInput = $('<input>', {
						'type'       : 'number',
						'name'       : 'number',
						'id'         : 'room_number',
						'min'        : 0,
						'max'        : 10000,
						'value'      : ((editorParams.data && editorParams.data.room_num) ? editorParams.data.room_num : 0),
						'change'     : function (e) {
							canvas.changeRoomNumber(this.value > 0 ? this.value : '');
						}
					}).appendTo($metaBlock);

					var $nameLabel = $('<label />', {
						'for'  : 'build_name',
						'text' : 'Название/назначение'
					}).appendTo($metaBlock);
					var $nameTextarea = $('<textarea>', {
						'name'       : 'name',
						'id'         : 'room_name',
						'placeholder': 'например, cетевая лаборатория',
						'text'       : ((editorParams.data && editorParams.data.name) ? editorParams.data.name : ''),
						'change'     : function (e) {
							canvas.changeRoomName(this.value);
						}
					}).appendTo($metaBlock);
					break;
			}



			/**
			 * Возвращает введенный номер помещения
			 * @return {number}
			 */
			this.getRoomNumber = function() {
				var result = '';

				if($numberInput) {
					var val = parseInt($numberInput.val());

					if(val > 0)
						result = val;
				}

				return result;
			};



			/**
			 * Возвращает введенное имя помещения
			 * @return {string}
			 */
			this.getRoomName = function() {
				var result = '';

				if($nameTextarea)
					result = $nameTextarea.val();

				return result;
			};
		}



		/**
		 * Меню добавления объектов
		 */
		function TopObjectsBar() {
			var oTopObjectsBar = this;

			$canvasBlock = $('<div />', {
				'class': 'bnav-main_block bnav-main_canvas_block'
			}).appendTo($form);

			var $header = $('<h3 />', {
				'class': 'bnav-main_header',
				'text' : 'Редактор'
			}).appendTo($canvasBlock);


			var $options = $('<ul />', {
				'class': 'options'
			}).appendTo($canvasBlock);
			var $addStairs = $('<li />', {
				'class'      : 'option-add-stairs',
				'data-action': 'stairs',
				'title'      : 'Добавить лестницу',
				'click'      : click,
			});
			var $addDoor = $('<li />', {
				'class'      : 'option-add-door',
				'data-action': 'door',
				'title'      : 'Добавить проход (дверь)',
				'click'      : click,
			});
			var $addWall = $('<li />', {
				'class'      : 'option-add-wall',
				'data-action': 'wall',
				'title'      : 'Добавить стену',
				'click'      : click,
			});
			var $addRoom = $('<li />', {
				'class'      : 'option-add-room',
				'data-action': 'room',
				'title'      : 'Обозначить комнату',
				'click'      : click,
			});

			switch(editorParams.part) {
				case 'build':
					$options.prepend($addWall);
					break;

				case 'floor':
					$options.prepend($addWall)
							.prepend($addDoor)
							.prepend($addStairs);
					break;

				case 'room':
					$options.prepend($addRoom);
					break;
			}


			/**
			 * Отмена выделения выбранных параметров
			 */
			this.unselectOptions = function() {
				$options.find('li.active').removeClass('active');
			}


			/**
			 * Обработчик клика на опцию
			 * @param {*} e 
			 */
			function click(e) {
				var $this = $(this);
				var h     = $this.data('action');
				var hName, action;
				
				if(h) {
					if($this.hasClass('active'))
						action = 'del';
					else
						action = 'add';

					hName = action + h.ucfirst() + 'Handler';
					
					if(typeof canvas[hName] !== 'undefined') {
						oTopObjectsBar.unselectOptions();
						if(action === 'add')
							$this.addClass('active');

						canvas[hName](true);
					}
					else
						msg.warning('Указанно некорректное название ("'+hName+'") обработчика типа объекта');
				}
				else
					msg.notice('Не указано название обработчика типа объекта');
			}
		}





		/**
		 * Шкалы метража
		 */
		function Metrage() {
			var oMetrage   = this;
			var scale      = 1;
			var initialH   = 0;
			var initialV   = 0;
			var $canvasBox = $('.canvas-container');
			var countH     = parseInt($canvasBox.innerWidth() / scaleSquare);

			var $horisontal = $('<ul />', {
				'class': 'horisontal_metrage square' + scaleSquare
			}).prependTo($canvasBox);

			for(var i=0; i < countH; i++) {
				$('<li />', {
					'text': i ? (i + 'm') : ''
				}).appendTo($horisontal);
			}

			var $vertical = $('<ul />', {
				'class': 'vertical_metrage square' + scaleSquare
			}).prependTo($canvasBox);
			var vli = parseInt($canvasBox.innerHeight() / scaleSquare);
			for(var i=0; i < vli; i++) {
				$('<li />', {
					'text': i ? (i + 'm') : ''
				}).appendTo($vertical);
			}



			/**
			 * Обновление шкал метража
			 */
			function refrash() {
				var hMetrage = parseInt(initialH) * scale;

				$horisontal.find('li').each(function(i, element) {
					if(!i) {
						var remainder = initialH % 1;
						if(remainder) {
							element.style.width = (scaleSquare * (1 - remainder)) + 'px';
						}
						else
							element.style.width = '';
					}
					else
						element.innerText = hMetrage + 'm';

					hMetrage += scale;
				});

				var vMetrage = parseInt(initialV) * scale;
				$vertical.find('li').each(function(i, element) {
					if(!i) {
						var remainder = initialV % 1;
						if(remainder) {
							element.style.height = (scaleSquare * (1 - remainder)) + 'px';
						}
						else
							element.style.height = '';
					}
					else
						element.innerText = vMetrage + 'm';

					vMetrage += scale;
				});
			}



			/**
			 * Устанавливает начальное значение (первое отображаемое)
			 * горизонтальной шкалы масштабирования
			 * @param {number} value
			 */
			this.setInitialHorizontalValue = function(value) {
				if(initialH != value) {
					initialH = value;
					refrash();
				}
			};



			/**
			 * Устанавливает начальное значение (первое отображаемое)
			 * вертикальной шкалы масштабирования
			 * @param {number} value
			 */
			this.setInitialVarticalValue = function(value) {
				if(initialV != value) {
					initialV = value;
					refrash();
				}
			};



			/**
			 * Устанавливает значение масштаба
			 * @param {number} value
			 */
			this.setScale = function(value) {
				if(scale != value) {

					var diff = scale / value;
					initialH *= diff;
					initialV *= diff;

					scale = value;
					refrash();
				}
			};

			this.resize = function() {
				var countH = parseInt($canvasBox.innerWidth() / scaleSquare);
				if(countH < countH) {
					var addNew = countH - countH;
					for(var i=0; i < addNew; i++) {
						$('<li />', {
							'text': ''
						}).appendTo($horisontal);
					}
					countH = countH;
					refrash();
				}
				$horisontal.addClass('afterResized'); // fix after resize
			};
		}








		/*
		*******************************************
		************ Управление канвой ************
		*******************************************
		*/
		function Canvas() {
			var oCanvas      = this;
			var waitStatus   = false; // Cтатус ожидания (Пропуск действий)
			var mouseup      = null,
				mousedown    = null,
				mousemove    = null;
			var objRoulette  = {
				'o'       : null,
				'initSize': 12,
				'size'    : 12,
			};
			var objCounter   = 0;
			var zIndex       = 0; // Для объектов




			var doActions = {
				'select'  : true,
				'unselect': true,
			};



			var wallObjs = {};
			/**
			 * Добавить объект стены в список стен
			 * @param {number} value
			 */
			function addWall(id, data) {
				wallObjs[id] = data;
			}
			/**
			 * Возвращает точки стен
			 * @param  {array} widthout_ids -- исключить точки с id из указанного списка
			 * @return {object}
			 */
			function getDots(widthout_ids) {
				var dots = [];

				if(widthout_ids && widthout_ids.length) {
					for(var w in wallObjs) {
						if(!widthout_ids.inArray(w)) {
							dots.push(wallObjs[w].dot1);
							dots.push(wallObjs[w].dot2);
						}
					}
				}
				else {
					for(var w in wallObjs) {
						dots.push(wallObjs[w].dot1);
						dots.push(wallObjs[w].dot2);
					}
				}

				return dots;
			}


			/**
			 * Устанавливает для всех точек стен указанный параметр
			 * @param {string} parametr -- название параметра
			 * @param {string} value    -- значение параметра
			 */
			function setAllDotsParametr(parametr, value) {
				for(var w in wallObjs) {
					wallObjs[w].dot1.set(parametr, value);
					wallObjs[w].dot2.set(parametr, value);
				}
			}


			/**
			 * Удаляет стенy из списка стен по id
			 */
			function removeWall(id) {
				delete wallObjs[id];
			}



			/**
			 * Увеличивает и возвращает значение счетчика объектов
			 * для создания id объекта
			 * @return {number}
			 */
			function getObjectCounter() {
				return objCounter++;
			}



			/**
			 * Возвращает состояние отслеживания действия
			 * @param  {string} action -- действие
			 * @return {boolean}
			 */
			this.getReactToAction = function(action) {
				var result = false;
				if(typeof doActions[action] !== 'undefined')
					result = doActions[action];

				return result;
			}



			/**
			 * Включает/Отключает реагирование на действие
			 * @param {string}  action -- действие
			 * @param {boolean} state  -- состояние
			 */
			this.setReactToAction = function(action, state) {
				if(typeof doActions[action] !== 'undefined')
					doActions[action] = (!!state);
			};



			var $canvas = $('<canvas />', {
				'id': 'buildAddCanvas'
			}).appendTo($canvasBlock);

			fabric.Object.prototype.originX            = fabric.Object.prototype.originY = 'center';
			fabric.Object.prototype.cornerStyle        = 'circle';
			fabric.Object.prototype.transparentCorners = false;
			fabric.Object.prototype.setControlsVisibility({
				'bl' : false,
				'br' : false,
				'mb' : false,
				'ml' : false,
				'mr' : false,
				'mt' : false,
				'tl' : false,
				'tr' : false,
				'mtr': true,
			});

			// создаём "оболочку" вокруг canvas элемента (id="c")
			var fcanv = new fabric.Canvas('buildAddCanvas', {
				'width'     : $form.width(),
				'height'    : initParams.height,
				'selection' : false,
			});
			fcanv.clear(); // Делаем прозрачным для отображения сетки
			var $canvasBox = $('.canvas-container');
			$canvasBox.css('background-color', 'white');




			/**
			 * Установка статуса ожидания
			 * @param {*} status 
			 */
			function setWaitStatus(status) {
				waitStatus = !!status;
			}


			var mouseover    = false;
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
				if(!waitStatus) {
					var render = true;
					if(typeof direction == 'string')
						direction = direction.toLowerCase();

					switch(direction) {
						case 'up':
							fcanv.viewportTransform[5] += scaleSquare;
							if(fcanv.viewportTransform[5] > 0)
								fcanv.viewportTransform[5] = 0;

							metrage.setInitialVarticalValue(fcanv.viewportTransform[5] / -scaleSquare);
							break;

						case 'down':
							fcanv.viewportTransform[5] -= scaleSquare;
							metrage.setInitialVarticalValue(fcanv.viewportTransform[5] / -scaleSquare);
							break;

						case 'left':
							fcanv.viewportTransform[4] += scaleSquare;
							if(fcanv.viewportTransform[4] > 0)
								fcanv.viewportTransform[4] = 0;
								metrage.setInitialHorizontalValue(fcanv.viewportTransform[4] / -scaleSquare);
							break;

						case 'right':
							fcanv.viewportTransform[4] -= scaleSquare;
							metrage.setInitialHorizontalValue(fcanv.viewportTransform[4] / -scaleSquare);
							break;

						default:
							render = false;
					}

					if(render) {
						fcanv.renderAll();
						fcanv.requestRenderAll();
						// fix для работы с объектами
						oCanvas.selectObjectAsGroup(fcanv.getObjects());
						oCanvas.unselectAllObjects();
					}
				}
			}



			var bgCache = {
				'current' : false,
				'bg'      : {}
			};
			/**
			 * Отрисовка фона редактора (сетка масштаба)
			 * @param {number} zoom -- масштаб
			 */
			function drawBackground(zoom) {
				if(![1,2,4,8,16].inArray(zoom))
					zoom = 1;

				var square   = scaleSquare * zoom;
				var cacheKey = zoom + 'x';
				if(bgCache.current !== cacheKey) {
					if(typeof bgCache.bg[cacheKey] == 'undefined') {
						// создаём канву для отрисовки сетки
						var bgCanvas = new fabric.Canvas();
						bgCanvas.set({
							'width'          : square,
							'height'         : square,
							'backgroundColor': 'transparent',
							'selection'      : false,
						});

						var hLine = new fabric.Line([0, 0, square, 0], {
							'stroke'     : 'rgb(224,224,224)',
							'strokeWidth': zoom * 2,
							'selectable' : false,
							'evented'    : false
						});
						bgCanvas.add(hLine);

						var vLine = new fabric.Line([0, 0, 0, square], {
							'stroke'     : 'rgb(224,224,224)',
							'strokeWidth': zoom * 2,
							'selectable' : false,
							'evented'    : false
						});
						bgCanvas.add(vLine);

						bgCache.bg[cacheKey] = bgCanvas.renderAll().toDataURL();
					}

					fcanv.setBackgroundColor({
						'source': bgCache.bg[cacheKey],
						'repeat': 'repeat'
					}, fcanv.renderAll.bind(fcanv));
				}
			};
			drawBackground(1);

			var currentScale = 1;
			/**
			 * Устанавливает масштаб
			 * @param {number} scale -- значение масштаба
			 */
			this.setScale = function(scale) {
				if(currentScale != scale) {
					fcanv.setZoom(1 / scale);
					drawBackground(scale);
					metrage.setScale(scale);
					objRoulette.size = objRoulette.initSize * scale;
					currentScale     = scale;
				}
			};



			// ================   Добавление элементов на холст   ================
			var addObject = null;
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
			var roomLabel = {
				'number': 22,
				'name'  : 17
			};



			/**
			 * Создание редактируемой стены
			 * @param  {number}    id 
			 * @param  {object} wCoords -- координаты концов стены
			 * @return {object}
			 */
			function createWall(id, wCoords) {
				if(typeof wCoords == 'undefined') wCoords = {};
				wCoords.x1 = wCoords.x1 ? wCoords.x1 : 0;
				wCoords.y1 = wCoords.y1 ? wCoords.y1 : 0;
				wCoords.x2 = wCoords.x2 ? wCoords.x2 : 0;
				wCoords.y2 = wCoords.y2 ? wCoords.y2 : 0;

				var dot1 = new fabric.Circle({
					'obj_type'   : 'wall_dot',
					'dot_number' : 1,
					'left'       : wCoords.x1,
					'top'        : wCoords.y1,
					'strokeWidth': 5,
					'radius'     : 5,
					'fill'       : '#fff',
					'stroke'     : 'red',
					'hasControls': false,
					'hasBorders' : false,
				});
				var dot2 = new fabric.Circle({
					'obj_type'   : 'wall_dot',
					'dot_number' : 2,
					'left'       : wCoords.x2,
					'top'        : wCoords.y2,
					'strokeWidth': 5,
					'radius'     : 5,
					'fill'       : '#fff',
					'stroke'     : 'red',
					'hasControls': false,
					'hasBorders' : false,
				});

				setAllDotsParametr('selectable', false);
				var line = new fabric.Line([wCoords.x1, wCoords.y1, wCoords.x2, wCoords.y2], {
					'id'         : id,
					'obj_type'   : 'wall',
					'dot1'       : dot1,
					'dot2'       : dot2,
					'stroke'     : 'red',
					'strokeWidth': 5,
					'selectable' : false,
					'evented'    : false,
					'hasRotatingPoint' : false
				});

				var components = {
					'line': line,
					'dot1': dot1,
					'dot2': dot2
				};

				addWall(id, components);
				dot1.line = dot2.line = line;
				line.centeredRotation    = false;
				line.hasBorders          = true;

				return components;
			}



			/**
			 * Создание не редактируемой стены
			 * @param  {object} wCoords -- координаты концов стены
			 * @return {object}
			 */
			function createInactiveWall(wCoords) {
				var line = new fabric.Line([wCoords.x1, wCoords.y1, wCoords.x2, wCoords.y2], {
					'obj_type'   : 'wall',
					'stroke'     : 'silver',
					'strokeWidth': 5,
					'selectable' : false,
					'evented'    : false
				});

				line.centeredRotation    = false;
				line.hasBorders          = true;

				return line;
			}



			/**
			 * Создание редактируемой лестницы
			 * @param  {string} id   -- id лестницы
			 * @param  {object} data -- данные лестницы
			 * @return {object}
			 */
			function createStairs(id, data) {
				data = (typeof data !== 'undefined') ? data : {};
				data.x      = data.x      ? data.x      : 0;
				data.y      = data.y      ? data.y      : 0;
				data.angle  = data.angle  ? data.angle  : 0;
				data.scaleX = data.scaleX ? data.scaleX : 1;
				data.scaleY = data.scaleY ? data.scaleY : 1;

				setAllDotsParametr('selectable', false);

				var stairs = new fabric.Image(stairsParam.img[0], {
					'id'         : id,
					'obj_type'   : 'stairs',
					'left'       : data.x,
					'top'        : data.y,
					'width'      : stairsParam.width,
					'height'     : stairsParam.height,
					'angle'      : data.angle,
					'scaleX'     : data.scaleX,
					'scaleY'     : data.scaleY,
					'selectable' : true,
					'evented'    : true,
					'hasRotatingPoint' : true
				});

				stairs.centeredRotation = false;

				return stairs;
			};



			/**
			 * Создание не редактируемой лестницы
			 * @param  {object} data -- данные лестницы
			 * @return {object}
			 */
			function createInactiveStairs(data) {
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
			 * Создание редактируемой двери
			 * @param  {object} id   -- id двери
			 * @param  {object} data -- данные двери
			 * @return {object}
			 */
			function createDoor(id, data) {
				if(typeof data == 'undefined') data = {};
				data.x      = data.x      ? data.x      : 0;
				data.y      = data.y      ? data.y      : 0;
				data.angle  = data.angle  ? data.angle  : 0;
				data.scaleX = data.scaleX ? data.scaleX : 1;
				data.flipX  = data.flipX  ? data.flipX  : false;
				data.flipY  = data.flipY  ? data.flipY  : false;

				var door = new fabric.Image(doorParam.img[0], {
					'id'         : id,
					'obj_type'   : 'door',
					'left'       : data.x,
					'top'        : data.y,
					'width'      : doorParam.width,
					'height'     : doorParam.height,
					'angle'      : data.angle,
					'scaleX'     : data.scaleX,
					'flipX'      : data.flipX,
					'flipY'      : data.flipY,
					'selectable' : true,
					'evented'    : true,
					'hasRotatingPoint' : true
				});

				door.centeredRotation    = false;

				return door;
			}



			/**
			 * Создание не редактируемой двери
			 * @param  {object} data -- данные двери
			 * @return {object}
			 */
			function createInactiveDoor(data) {
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
			 * Создание редактируемых границ помещения
			 * @param  {number} id   -- id помещения
			 * @param  {object} data -- данные границ помещения
			 * @return {object}
			 */
			function createRoomBorder(id, data) {
				if(typeof data == 'undefined')
					data = {};
				if(typeof data.number === 'undefined')
					data.number = '';
				if(typeof data.name === 'undefined')
					data.name = '';
				if(typeof data.left === 'undefined')
					data.left = 5;
				if(typeof data.top === 'undefined')
					data.top = 5;
				if(typeof data.coords === 'undefined' || !data.coords.length)
					data.coords = [{'x': data.left, 'y': data.top}];

				var dots = [];
				for(var i=0; i < data.coords.length; i++) {
					var dotId = id+'_dot-' + getObjectCounter();
					data.coords[i].id = dotId;
					dots.push(new fabric.Circle({
						'id'         : dotId,
						'obj_type'   : 'room_dot',
						'dot_number' : i,
						'left'       : data.coords[i].x,
						'top'        : data.coords[i].y,
						'strokeWidth': 5,
						'radius'     : 5,
						'fill'       : '#fff',
						'stroke'     : 'blue',
						'hasControls': false,
						'hasBorders' : false
					}));
				}

				var mult       = (1 / fcanv.getZoom());
				var numberSize = roomLabel.number * mult;
				var number     = new fabric.Text((data.number).toString(), {
					'id'         : id + '_number',
					'left'       : data.left,
					'top'        : data.top,
					'fontSize'   : numberSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var nameSize = roomLabel.name * mult;
				var name     = new fabric.Text(data.name, {
					'id'         : id + '_name',
					'left'       : data.left,
					'top'        : data.top,
					'fontSize'   : nameSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var room = new fabric.Polyline(data.coords, {
					'id'           : id,
					'fill'         : 'rgba(0,0,200, 0.5)',
					'left'         : data.left,
					'top'          : data.top,
					'dots'         : dots,
					'number'       : number,
					'name'         : name,
					'objectCaching': false,
					'selectable'   : false,
					'evented'      : false
				});


				for(var i=0; i < dots.length; i++) {
					dots[i].room = room;
					dots[i].centeredRotation = true;
				}
				name.room   = room;
				number.room = room;

				return room;
			}



			/**
			 * Создание не редактируемых границ помещения
			 * @param  {number} id   -- id помещения
			 * @param  {object} data -- данные границ помещения
			 * @return {object}
			 */
			function createInactiveRoomBorder(id, data) {
				if(typeof data == 'undefined') 
					data = {};
				if(typeof data.number === 'undefined') 
					data.number = '';
				if(typeof data.name === 'undefined') 
					data.name = '';
				if(typeof data.left === 'undefined') 
					data.left = 5;
				if(typeof data.top === 'undefined') 
					data.top = 5;
				if(typeof data.coords === 'undefined' || !data.coords.length)
					data.coords = [{'x': data.left, 'y': data.top}];

				var mult       = (1 / fcanv.getZoom());
				var numberSize = roomLabel.number * mult;
				var number     = new fabric.Text(data.number, {
					'id'         : id + '_number',
					'left'       : data.left,
					'top'        : data.top,
					'fontSize'   : numberSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var nameSize = roomLabel.name * mult;
				var name     = new fabric.Text(data.name, {
					'id'         : id + '_name',
					'left'       : data.left,
					'top'        : data.top,
					'fontSize'   : nameSize,
					'fill'       : 'black',
					'selectable' : false,
					'evented'    : false
				});

				var room = new fabric.Polyline(data.coords, {
					'id'           : id,
					'fill'         : 'rgba(155,155,155, 0.5)',
					'left'         : data.left,
					'top'          : data.top,
					'number'       : number,
					'name'         : name,
					'objectCaching': false,
					'selectable'   : false,
					'evented'      : false
				});

				name.room   = room;
				number.room = room;

				return room;
			}



			/**
			 * Обработчик добавления стены на холст
			 */
			this.addWallHandler = function() {
				if(!waitStatus) {
					var object_id = 'wall_' + getObjectCounter();
					addObject     = createWall(object_id);

					objRoulette.o = new fabric.Text('0m', {
						'id'      : 'obj_roulette',
						'left'    : 0,
						'top'     : 0,
						'fontSize': objRoulette.size
					});

					mousedown = function(o) {
						var mult = (1 / fcanv.getZoom()); // Множитель
						var x    = parseInt(o.absolutePointer.x >= 0 ? o.absolutePointer.x : 0);
						var y    = parseInt(o.absolutePointer.y >= 0 ? o.absolutePointer.y : 0);

						addObject.dot1.set({
							'left': x,
							'top' : y
						});
						addObject.dot2.set({
							'left': x,
							'top' : y
						});

						objRoulette.o.set('fontSize', objRoulette.size).set({
							'left': x + ((objRoulette.o.width / 2) + (12 * mult)),
							'top' : y
						});
						addObject.line.set({
							'x1': x,
							'y1': y,
							'x2': x,
							'y2': y,
						});
						fcanv.add(addObject.line).add(addObject.dot1).add(addObject.dot2).add(objRoulette.o);
						addObject.line.moveTo(zIndex++);
						addObject.dot1.moveTo(zIndex++);
						addObject.dot2.moveTo(zIndex++);
						correctWallDot(addObject.dot1);
						mousedown = null;
					};

					mousemove = function(o) {
						var mult   = (1 / fcanv.getZoom());
						var x      = parseInt(o.absolutePointer.x >= 0 ? o.absolutePointer.x : 0);
						var y      = parseInt(o.absolutePointer.y >= 0 ? o.absolutePointer.y : 0);
						var length = (calcWallLength(addObject.line) / scaleSquare).toFixed(1);

						addObject.dot2.set({
							'left': x,
							'top' : y,
						});
						objRoulette.o.set('fontSize', objRoulette.size).set({
							'left': x + ((objRoulette.o.width / 2) + (12 * mult)),
							'top' : y,
							'text': length + 'm'
						});
						addObject.line.set({
							'x2': x,
							'y2': y,
						});

						correctWallDot(addObject.dot2);
						fcanv.renderAll();
					};

					mouseup = function(o) {
						// var zoom = 1 / fcanv.getZoom();
						var x      = parseInt(o.absolutePointer.x >= 0 ? o.absolutePointer.x : 0);
						var y      = parseInt(o.absolutePointer.y >= 0 ? o.absolutePointer.y : 0);
						var length = (calcWallLength(addObject.line) / scaleSquare).toFixed(1);
						addObject.dot2.set({
							'left': x,
							'top' : y,
						});
						addObject.line.set({
							'x2': x,
							'y2': y,
						});
						correctWallDot(addObject.dot2);

						fcanv.remove(objRoulette.o);
						mousemove = mouseup = objRoulette.o = null;
						topObjectsBar.unselectOptions();
						objectsList.add({
							'id'    : addObject.line.id,
							'x1'    : addObject.line.x1,
							'y1'    : addObject.line.y1,
							'x2'    : addObject.line.x2,
							'y2'    : addObject.line.y2,
							'type'  : 'wall',
							'length': length
						});

						setAllDotsParametr('selectable', true);
						// fix
						oCanvas.selectObjectAsGroup([addObject.dot2]);
						oCanvas.unselectAllObjects();
						addObject = null;
					};
				}
			};



			/**
			 * Удаление обработчика добавления стены на холст
			 */
			this.delWallHandler = function() {
				fcanv.remove(addObject).remove(objRoulette.o).renderAll();
				mousedown = mousemove = mouseup = addObject = objRoulette.o = null;
				setAllDotsParametr('selectable', true);
			};



			/**
			 * Обработчик добавления лестницы на холст
			 */
			this.addStairsHandler = function() {
				if(!waitStatus) {
					setAllDotsParametr('selectable', false);
					var object_id = 'stairs_' + getObjectCounter();
					addObject     = createStairs(object_id);

					mousedown = function(o) {
						var x = parseInt(o.absolutePointer.x >= 0 ? o.absolutePointer.x : 0);
						var y = parseInt(o.absolutePointer.y >= 0 ? o.absolutePointer.y : 0);

						addObject.set({
							'left': x,
							'top' : y
						});
						fcanv.add(addObject);
						addObject.moveTo(zIndex++);
						topObjectsBar.unselectOptions();
						objectsList.add({
							'type'   : 'stairs',
							'id'     : addObject.id,
							'x'      : addObject.left,
							'y'      : addObject.top,
							'angle'  : addObject.angle,
							'lengthX': (addObject.width / scaleSquare),
							'lengthY': (addObject.height / scaleSquare),
							'scaleX' : addObject.scaleX,
							'scaleY' : addObject.scaleY
						});
						setAllDotsParametr('selectable', true);

						mousedown = addObject = null;
					};

					mousemove = mouseup = null;
				}
			};



			/**
			 * Деактивация обработчика добавления лестницы
			 */
			this.delStairsHandler = function() {
				fcanv.remove(addObject).renderAll();
				mousedown = mousemove = mouseup = addObject = null;
				setAllDotsParametr('selectable', true);
			};



			/**
			 * Обработчик добавления двери на холст
			 */
			this.addDoorHandler = function() {
				if(!waitStatus) {
					setAllDotsParametr('selectable', false);
					var object_id = 'door_' + getObjectCounter();
					addObject     = createDoor(object_id);

					mousedown = function(o) {
						var x = parseInt(o.absolutePointer.x >= 0 ? o.absolutePointer.x : 0);
						var y = parseInt(o.absolutePointer.y >= 0 ? o.absolutePointer.y : 0);

						addObject.set({
							'left': x,
							'top' : y
						});
						fcanv.add(addObject);
						addObject.moveTo(zIndex++);
						topObjectsBar.unselectOptions();
						objectsList.add({
							'type'  : 'door',
							'id'    : addObject.id,
							'x'     : addObject.left,
							'y'     : addObject.top,
							'angle' : addObject.angle,
							'length': (addObject.width / scaleSquare),
							'scaleX': addObject.scaleX
						});
						setAllDotsParametr('selectable', true);

						mousedown = addObject = null;
					};

					mousemove = mouseup = null;
				}
			};



			/**
			 * Деактивация обработчика добавления двери
			 */
			this.delDoorHandler = function() {
				fcanv.remove(addObject).renderAll();
				mousedown = mousemove = mouseup = addObject = null;
				setAllDotsParametr('selectable', true);
			};



			/**
			 * Обработчик добавления данных о помещении на холст
			 */
			this.addRoomHandler = function() {
				if(!waitStatus) {
					setAllDotsParametr('selectable', false);
					var object_id = 'room-add' /* + getObjectCounter() */;
					var object    = fcanv.getObjectById(object_id);

					if(!object) {
						mousedown = function(o) {
							var x = parseInt(o.absolutePointer.x >= 5 ? o.absolutePointer.x : 5);
							var y = parseInt(o.absolutePointer.y >= 5 ? o.absolutePointer.y : 5);

							addObject = createRoomBorder(object_id, {
								'number': metaBlock.getRoomNumber(),
								'name'  : metaBlock.getRoomName(),
								'left'  : x + 20,
								'top'   : y + 20,
								'coords': [
									{
										'x': x,
										'y': y
									},
									{
										'x': x,
										'y': y + 40
									},
									{
										'x': x + 40,
										'y': y + 40
									},
									{
										'x': x + 40,
										'y': y
									}
								]
							});

							addObject.points[0].x  = addObject.name.left = x;
							addObject.points[0].y  = addObject.name.top  = y;

							objectsList.add({
								'id'   : object_id,
								'type' : 'room',
								'left' : x + 20,
								'top'  : y + 20
							});

							fcanv.add(addObject);
							for(var i=0; i < addObject.dots.length; i++) {
								fcanv.add(addObject.dots[i]);
								objectsList.add({
									'type' : 'room_dot',
									'id'   : addObject.dots[i].id,
									'x'    : addObject.dots[i].left,
									'y'    : addObject.dots[i].top
								});
							}
							fcanv.add(addObject.number);
							fcanv.add(addObject.name);
							correctPositionRoomLabel(addObject);

							topObjectsBar.unselectOptions();
							setAllDotsParametr('selectable', true);
							mousemove = mousedown = addObject = null;
						};

						mouseup = null;
					}
					else {
						mousedown = function(o) {
							var x      = parseInt(o.absolutePointer.x >= 5 ? o.absolutePointer.x : 5);
							var y      = parseInt(o.absolutePointer.y >= 5 ? o.absolutePointer.y : 5);
							var i      = object.dots.length;
							var dotId  = 'room_dot-' + getObjectCounter();
							var newDot = new fabric.Circle({
								'id'         : dotId,
								'obj_type'   : 'room_dot',
								'room'       : object,
								'dot_number' : i,
								'left'       : x,
								'top'        : y,
								'strokeWidth': 5,
								'radius'     : 5,
								'fill'       : '#fff',
								'stroke'     : 'blue',
								'hasControls': false,
								'hasBorders' : false
							});

							object.points.push({
								'id'  : dotId,
								'type': 'room_dot',
								'x'   : x,
								'y'   : y
							});
							object.dots.push(newDot);
							correctPositionRoomLabel(object);

							objectsList.add({
								'type'  : 'room_dot',
								'id'    : newDot.id,
								'x'     : x,
								'y'     : y
							});

							fcanv.add(newDot);
							topObjectsBar.unselectOptions();
							setAllDotsParametr('selectable', true);
							mousedown = addObject = null;
						};
					}
				}
			};



			/**
			 * Деактивация добавления данных о помещении на холст
			 */
			this.delRoomHandler = function() {
				fcanv.remove(addObject).renderAll();
				mousedown = mousemove = mouseup = addObject = null;
				setAllDotsParametr('selectable', true);
			};



			/**
			 * Корректировка положения точки конца стены при перемещении
			 * (эффект прилипания к ближайшей точки другой стены)
			 * @param  {object} dot -- точка
			 * @return {object}     -- координаты
			 */
			function correctWallDot(dot) {
				var dots      = getDots([dot.line.id]);
				var target    = false;
				var newCoords = false;

				for(var i=0; i < dots.length; i++) {
					if(
						(dots[i].top  - 7) < dot.top  && dot.top  < (dots[i].top  + 7) && 
						(dots[i].left - 7) < dot.left && dot.left < (dots[i].left + 7)
					) {
						target = dots[i];
						break;
					}
				}

				if(target) {
					var x = parseInt(target.left);
					var y = parseInt(target.top);
					dot.set('left', x).set('top', y);
					dot.line.set('x'+dot.dot_number, x).set('y'+dot.dot_number, y);
					newCoords = {
						'x': x,
						'y': y
					};
				}

				return newCoords;
			}



			/**
			 * Рассчет длины стены
			 * @param  {object} o -- объект стены
			 * @return {number}
			 */
			function calcWallLength(o) {
				var result = 0;
				if(o.dot1.left == o.dot2.left) {
					result = o.dot1.top - o.dot2.top;
				}
				else if(o.dot1.top == o.dot2.top) {
					result = o.dot1.left - o.dot2.left;
				}
				else {
					var l1 = o.dot1.left - o.dot2.left; // Катет 1
					var l2 = o.dot1.top  - o.dot2.top; // Катет 2
					result = Math.sqrt((l1 * l1) + (l2 * l2)); // Гипотенуза
				}

				return Math.abs(result);
			}



			/**
			 * Корректировка положения объекта границ помещения
			 * @param {*} o -- объект границ помещения
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
			 * @param {*} o -- объект границ помещения
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
			 * Изменяет надпись номера помещения для редактируемого помещения
			 * @param {number} num -- номер помещения
			 */
			this.changeRoomNumber = function(num) {
				var object = fcanv.getObjectById('room-add_number');
				if(object) {
					object.set('text', num);
					correctPositionRoomLabel(object.room);
					fcanv.renderAll();
				}
			};



			/**
			 * Изменяет надпись названия помещения для редактируемого помещения
			 * @param {string} name -- номер помещения
			 */
			this.changeRoomName = function(name) {
				var object = fcanv.getObjectById('room-add_name');
				if(object) {
					object.set('text', name);
					correctPositionRoomLabel(object.room);
					fcanv.renderAll();
				}
			};




			// ================   Обработчики событий   ================
			fcanv.on('object:moving', function(e) {
				var o = e.target;
				switch(o.obj_type) {
					case 'wall_dot':
						if(o.dot_number) {
							if(o.line) {
								var mult   = (1 / fcanv.getZoom());
								var x      = Math.round(o.left);
								var y      = Math.round(o.top >= 0 ? o.top : 0);
								var length = (calcWallLength(o.line) / scaleSquare).toFixed(1);
	
								if(!objRoulette.o) {
									objRoulette.o = new fabric.Text(length + 'm', {
										'id'      : 'obj_roulette',
										'left'    : x + (12 * mult),
										'top'     : y,
										'fontSize': objRoulette.size
									});
									fcanv.add(objRoulette.o);
								}
								else {
									objRoulette.o.set('fontSize', objRoulette.size).set({
										'left' : x + ((objRoulette.o.width / 2) + (12 * mult)),
										'top'  : y,
										'text' : length + 'm'
									});
								}
	
								if(x < 0) {
									x = 0;
									o.set('left', x);
								}
								if(y < 5) {
									y = 0;
									o.set('top', y);
								}
	
								var coords = {};
								coords['x'+ o.dot_number] = x;
								coords['y'+ o.dot_number] = y;
								o.line.set(coords);
								var newCoords = correctWallDot(o);
								if(newCoords) {
									coords['x'+ o.dot_number] = newCoords.x;
									coords['y'+ o.dot_number] = newCoords.y;
								}
								objectsList.changeObjectData(o.line.id, {
									'inputs': coords,
									'values': {
										'length': length
									}
								}, true);
							}
							else
								msg.warning('Canvas::object:moving Точке перетаскивания не назначена линия');
						}
						else
							msg.warning('Canvas::object:moving Не найден номер точки перетаскивания');
						break;

					case 'door':
						var minX = (doorParam.width  / 2) * o.scaleX;
						var minY = (doorParam.height / 2);
						var x    = Math.round(o.left >= minX ? o.left : minX);
						var y    = Math.round(o.top  >= minY ? o.top  : minY);

						o.set({
							'left': x,
							'top' : y
						});
						objectsList.changeObjectData(o.id, {
							'inputs': {
								'x' : x,
								'y' : y
							}
						}, true);
						break;

					case 'stairs':
						var minX = (stairsParam.width  / 2) * o.scaleX;
						var minY = (stairsParam.height / 2) * o.scaleY;
						var x    = Math.round(o.left >= minX ? o.left : minX);
						var y    = Math.round(o.top  >= minY ? o.top  : minY);

						o.set({
							'left': x,
							'top' : y
						});
						objectsList.changeObjectData(o.id, {
							'inputs': {
								'x' : x,
								'y' : y
							}
						}, true);
						break;

					case 'room_dot':
						var x = Math.round(o.left >= 5 ? o.left : 5);
						var y = Math.round(o.top  >= 5 ? o.top  : 5);

						o.set({
							'left': x,
							'top' : y
						});

						for(i in o.room.points) {
							if(o.id === o.room.points[i].id) {
								o.room.points[i].x = x;
								o.room.points[i].y = y;
							}
						}
						correctPositionRoomLabel(o.room);

						objectsList.changeObjectData(o.id, {
							'inputs': {
								'x' : x,
								'y' : y
							}
						});

						break;
				}

				fcanv.renderAll();
			});



			fcanv.on('object:rotating', function(e) {
				var o = e.target;
				switch(o.obj_type) {
					case 'door':
						var angle = Math.round(o.angle);

						if(angle === 360)
							angle = 0;

						o.set('angle', angle);
						objectsList.changeObjectData(o.id, {
							'inputs': {
								'angle' : angle
							}
						}, true);
						break;

					case 'stairs':
						var angle = Math.round(o.angle);

						if(angle === 360)
							angle = 0;

						o.set('angle', angle);
						objectsList.changeObjectData(o.id, {
							'inputs': {
								'angle' : angle
							}
						}, true);
						break;
				}
			});



			/**
			 * Изменение длины и ширины
			 */
			fcanv.on('object:scaling', function(e){
				var o = e.target;
				switch(o.obj_type) {
					case 'door':
						var mult   = (1 / fcanv.getZoom());
						var scaleX = parseFloat((o.scaleX).toFixed(2));

						if(scaleX < 0.5)
							scaleX = 0.5;
						if(scaleX > 10)
							scaleX = 10;

						o.set('scaleX', scaleX);

						var length = ((o.width / scaleSquare) * scaleX).toFixed(2);
						var text   = length + 'm';

						if(!objRoulette.o) {
							var fontSize  = objRoulette.size * mult;
							objRoulette.o = new fabric.Text(text, {
								'id'      : 'obj_roulette',
								'left'    : o.left + (12 * mult),
								'top'     : o.top + (o.height / 2) + fontSize,
								'angle'   : o.angle,
								'fontSize': fontSize
							});
							fcanv.add(objRoulette.o);
						}
						else {
							objRoulette.o.set('fontSize', objRoulette.size).set({
								'left' : o.left + (12 * mult),
								'top'  : o.top + (o.height / 2) + objRoulette.o.fontSize,
								'text' : text
							});
						}
						fcanv.renderAll();

						objectsList.changeObjectData(o.id, {
							'inputs': {
								'scale_x': scaleX
							},
							'values': {
								'length': ((o.width / scaleSquare) * scaleX).toFixed(2)
							}
						}, true);
						break;

					case 'stairs':
						var mult   = (1 / fcanv.getZoom());
						var scaleX = parseFloat((o.scaleX).toFixed(2));
						var scaleY = parseFloat((o.scaleY).toFixed(2));

						if(scaleX < 0.1953)
							scaleX = 0.1953;
						if(scaleX > 10)
							scaleX = 10;

						if(scaleY < 0.3906)
							scaleY = 0.3906;

						o.set({
							'scaleX': scaleX,
							'scaleY': scaleY
						});

						var length_x = ((o.width / scaleSquare) * scaleX).toFixed(2);
						var length_y = ((o.height / scaleSquare) * scaleY).toFixed(2);
						var text     = length_x + 'm x ' + length_y + 'm';

						if(!objRoulette.o) {
							var fontSize  = objRoulette.size * mult;
							objRoulette.o = new fabric.Text(text, {
								'id'      : 'obj_roulette',
								'left'    : o.left + (12 * mult),
								'top'     : o.top + ((o.height / 2)* o.scaleY) + fontSize,
								'angle'   : o.angle,
								'fontSize': fontSize
							});
							fcanv.add(objRoulette.o);
						}
						else {
							objRoulette.o.set('fontSize', objRoulette.size).set({
								'left' : o.left /* + ((objRoulette.o.width / 2) */ + (12 * mult)/* ) */,
								'top'  : o.top + ((o.height / 2)* o.scaleY) + objRoulette.o.fontSize,
								'text' : text
							});
						}
						fcanv.renderAll();

						objectsList.changeObjectData(o.id, {
							'inputs': {
								'scale_x': scaleX,
								'scale_y': scaleY
							},
							'values': {
								'length_x': length_x,
								'length_y': length_y
							}
						}, true);
						break;
				}
			});



			fcanv.on('object:scaled', function(e){
				if(objRoulette.o) {
					fcanv.remove(objRoulette.o).renderAll();
					objRoulette.o = null;
				}
			});



			fcanv.on('object:moved', function(e) {
				if(objRoulette.o) {
					fcanv.remove(objRoulette.o).renderAll();
					objRoulette.o = null;
				}
			});



			/**
			 * Динамически включает/отключает некоторые элементы управления объектом
			 * @param {*} e -- событие выделения объекта
			 */
			function selectionState(e) {
				var selected = !e.deselected;
				var objects  = selected ? e.selected : e.deselected;

				if(objects.length) {
					var o = objects[0];
					var selectObj = null;
					switch(o.obj_type) {
						// case 'wall':
						// 	fabric.Object.prototype.setControlsVisibility({
						// 		'bl' : false,
						// 		'br' : false,
						// 		'mb' : false,
						// 		'ml' : false,
						// 		'mr' : false,
						// 		'mt' : false,
						// 		'tl' : false,
						// 		'tr' : false,
						// 		'mtr': false,
						// 	});
						// 	break;

						// case 'wall_dot':
						// 	fabric.Object.prototype.setControlsVisibility({
						// 		'bl' : false,
						// 		'br' : false,
						// 		'mb' : false,
						// 		'ml' : false,
						// 		'mr' : false,
						// 		'mt' : false,
						// 		'tl' : false,
						// 		'tr' : false,
						// 		'mtr': false,
						// 	});
						// 	selectObj = o.line.id;
						// 	break;

						case 'door':
							fabric.Object.prototype.setControlsVisibility({
								'bl' : false,
								'br' : false,
								'mb' : false,
								'ml' : true,
								'mr' : true,
								'mt' : false,
								'tl' : false,
								'tr' : false,
								'mtr': true,
							});
							selectObj = o.id;
							break;

						case 'stairs':
							fabric.Object.prototype.setControlsVisibility({
								'bl' : false,
								'br' : false,
								'mb' : true,
								'ml' : true,
								'mr' : true,
								'mt' : true,
								'tl' : false,
								'tr' : false,
								'mtr': true,
							});
							selectObj = o.id;
							break;

						default:
							fabric.Object.prototype.setControlsVisibility({
								'bl' : false,
								'br' : false,
								'mb' : false,
								'ml' : false,
								'mr' : false,
								'mt' : false,
								'tl' : false,
								'tr' : false,
								'mtr': false,
							});
					}

					if(selectObj) {
						objectsList.setReactToAction('select', false);
						objectsList.setStateSelectObjectById(selected, selectObj);
						objectsList.setReactToAction('select', true);
					}
				}
			}
			fcanv.on('selection:created', selectionState);
			fcanv.on('selection:cleared', selectionState);



			fcanv.on('mouse:down', function(o){
				if(typeof mousedown === 'function')
					mousedown(o);
			});



			fcanv.on('mouse:move', function(o){
				if(typeof mousemove === 'function')
					mousemove(o);
			});



			fcanv.on('mouse:up', function(o){
				if(typeof mouseup === 'function')
					mouseup(o);
			});



			fcanv.on('mouse:wheel', function(opt) {
				if(!waitStatus) {
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


					setWaitStatus(true);
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
					
					bottomCanvasBar.refrashZoom(m);
					oCanvas.setScale(m);
					setWaitStatus(false);

					opt.e.preventDefault();
					opt.e.stopPropagation();
				}
			});



			/**
			 * Изменение параметра объекта
			 * @param {string} id    -- id объекта
			 * @param {string} param -- название параметра
			 * @param {*}      val   -- значение
			 */
			this.changeObjectParametr = function(id, param, val) {
				var object = fcanv.getObjectById(id);

				if(typeof object[param] !== 'undefined') {
					// var setParam = {};
					// setParam[param] = val;
					object.set(param, val);
					fcanv.renderAll();
				}
			};



			/**
			 * Выделение объекта на канве по его id
			 * @param {string} id -- id объекта
			 */
			this.selectObjectById = function(id) {
				if(typeof id == 'string') {
					fcanv.discardActiveObject();
					var object = fcanv.getObjectById(id);
					if(object)
						fcanv.setActiveObject(object).renderAll();
					else
						msg.notice('Не удалось найти объект с id "'+ id +'" для отмены выделения');
				}
				else
					msg.warning('Canvas::selectObjectById полученный id не является cтрокой');
			};



			/**
			 * Выделение нескольких объектов на канве
			 * @param {array} objs -- список объектов
			 */
			this.selectObjectAsGroup = function(objs) {
				var sel = new fabric.ActiveSelection(objs, {
					'canvas': fcanv,
				});
				fcanv.setActiveObject(sel);
				fcanv.requestRenderAll();
			};



			/**
			 * Отменить выделение уже выделенных объектов на канве
			 */
			this.unselectAllObjects = function() {
				fcanv.discardActiveObject()
				fcanv.requestRenderAll();
			};



			/**
			 * Удаление объекта с канвы по его id
			 * @param {string} id -- id объекта
			 */
			this.remove = function(id) {
				var o = fcanv.getObjectById(id);
				if(o) {
					fcanv.discardActiveObject();

					switch(o.obj_type) {
						case 'wall':
							removeWall(o.id);
							fcanv.remove(o.dot1)
								 .remove(o.dot2)
								 .remove(o);
							break;

						case 'room_dot':
							var room = o.room;
							o.room.dots;

							for(i in o.room.dots) {
								if(o.room.dots[i].id === o.id) {
									o.room.dots.splice(i, 1);
									break;
								}
							}

							for(i in o.room.points) {
								if(o.room.points[i].id === o.id) {
									o.room.points.splice(i, 1);
									break;
								}
							}
							fcanv.remove(o);
							break;

						default:
							fcanv.remove(o);
					}
				}
				else
					msg.notice('Не удалось найти объект с id "'+ id +'" для удаления');
			};



			/**
			 * Загрузка редактируемых объектов на холст
			 * @param {array} objects -- список объектов
			 */
			this.load = function(objects) {
				var object_id;
				for(var i=0; i < objects.length; i++) {
					switch(objects[i].type) {
						case 'wall':
							object_id  = 'wall_' + getObjectCounter();
							var wall   = createWall(object_id, objects[i]);
							var length = (calcWallLength(wall.line) / scaleSquare).toFixed(1);

							fcanv.add(wall.line).add(wall.dot1).add(wall.dot2);

							objectsList.add({
								'id'    : object_id,
								'x1'    : objects[i].x1,
								'y1'    : objects[i].y1,
								'x2'    : objects[i].x2,
								'y2'    : objects[i].y2,
								'type'  : 'wall',
								'length': length
							});
							break;

						case 'stairs':
							object_id  = 'stairs_' + getObjectCounter();
							var stairs = createStairs(object_id, objects[i]);
							fcanv.add(stairs);

							objectsList.add({
								'type'   : 'stairs',
								'id'     : object_id,
								'x'      : objects[i].x,
								'y'      : objects[i].y,
								'angle'  : objects[i].angle,
								'lengthX': (stairs.width / scaleSquare),
								'lengthY': (stairs.height / scaleSquare),
								'scaleX' : objects[i].scaleX,
								'scaleY' : objects[i].scaleY
							});
							break;

						case 'door':
							object_id  = 'door_' + getObjectCounter();
							var door   = createDoor(object_id, objects[i]);
							fcanv.add(door);

							objectsList.add({
								'type'   : 'door',
								'id'     : object_id,
								'x'      : objects[i].x,
								'y'      : objects[i].y,
								'angle'  : objects[i].angle,
								'length' : (door.width / scaleSquare),
								'scaleX' : objects[i].scaleX,
								'flipX'  : objects[i].flipX,
								'flipY'  : objects[i].flipY,
							});
							break;

						case 'room':
							object_id = 'room-add';
							var room  = createRoomBorder(object_id, {
								'number': metaBlock.getRoomNumber(),
								'name'  : metaBlock.getRoomName(),
								'left'  : objects[i].left,
								'top'   : objects[i].top,
								'coords': objects[i].data
							});

							objectsList.add({
								'id'    : object_id,
								'type'  : 'room',
								'left'  : objects[i].left,
								'top'   : objects[i].top
							});

							correctPositionRoomCenter(room);
							correctPositionRoomLabel(room);
							fcanv.add(room).add(room.number).add(room.name);
							for(i in room.points) {
								fcanv.add(room.dots[i]);

								objectsList.add({
									'id'    : room.dots[i].id,
									'type'  : 'room_dot',
									'x'     : room.dots[i].left,
									'y'     : room.dots[i].top
								});
							}
							break;
					}
				}

				setAllDotsParametr('selectable', true);
				fcanv.renderAll().requestRenderAll();
			}



			/**
			 * Загрузка не редактируемых объектов на холст
			 * @param {array} objects -- список объектов
			 */
			this.loadInactive = function(objects) {
				var object;
				for(var i=0; i < objects.length; i++) {
					switch(objects[i].type) {
						case 'wall':
							object = createInactiveWall(objects[i]);
							fcanv.add(object);
							break;

						case 'stairs':
							object = createInactiveStairs(objects[i]);
							fcanv.add(object);
							break;

						case 'door':
							object = createInactiveDoor(objects[i]);
							fcanv.add(object);
							break;

						case 'room':
							object = createInactiveRoomBorder('room-' + getObjectCounter(), {
								'number': parseInt(objects[i].room_num) ? objects[i].room_num : '',
								'name'  : objects[i].name,
								'left'  : objects[i].left,
								'top'   : objects[i].top,
								'coords': objects[i].dots
							});

							correctPositionRoomCenter(object);
							correctPositionRoomLabel(object);

							fcanv.add(object).add(object.number).add(object.name);
							break;

						default:
						object = null;
					}

					zIndex++;
				}

				setAllDotsParametr('selectable', true);
				fcanv.requestRenderAll();
			};



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
			}).appendTo($canvasBlock);

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
			 * Событие изменение масштаба карты
			 * @param {*} e -- событие клика
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
			 * Обновление значения масштаба карты
			 * @param {number} zoom -- значения масштаба карты
			 */
			this.refrashZoom = function(zoom) {
				$scaleValue.text(parseInt(zoom));
			};



			/**
			 * Обработчик нажатия на кнопки скролла
			 * @param {*} e -- событие нажатия на кнопку
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









		/*
		*******************************************
		******* Управление объектами канвы ********
		*******************************************
		*/
		function ObjectsList() {
			$objectsBlock = $('<div />', {
				'class': 'bnav-main_block'
			}).appendTo($form);
			var $header = $('<h3 />', {
				'class': 'bnav-main_header',
				'text' : 'Объекты'
			}).appendTo($objectsBlock);
			var $list = $('<ul />', {
				'class': 'bnav_objects'
			}).appendTo($objectsBlock);


			var doActions = {
				'select': true
			};

			/**
			 * Возвращает состояние отслеживания действия
			 * @param  {string}  action -- действие
			 * @return {boolean}
			 */
			this.getReactToAction = function(action) {
				var result = false;
				if(typeof doActions[action] !== 'undefined')
					result = doActions[action];

				return result;
			};

			/**
			 * Включает/Отключает реагирование на действие
			 * @param {string}  action -- действие
			 * @param {boolean} state  -- состояние
			 */
			this.setReactToAction = function(action, state) {
				if(typeof doActions[action] !== 'undefined')
					doActions[action] = (!!state);
			};



			/**
			 * Удаляет выделение блока объекта
			 */
			function removeSelects() {
				$list.find('li.bnav_objects-objwrap').removeClass('selected');
			};



			/**
			 * Обработчик выделения блока объекта и самого объекта
			 * @param {object} -- событие клика
			 */
			function changeSelect(e) {
				var $title = $(this);
				var $wrap  = $title.parents('li.bnav_objects-objwrap');
				var id     = $wrap.attr('id');
				removeSelects();
				$wrap.addClass('selected');

				canvas.setReactToAction('select', false);
				canvas.selectObjectById(id);
				canvas.setReactToAction('select', true);
			}



			/**
			 * Помечает блоки объектов как выделенные/невыделенные
			 * @param {boolean} state -- состояние выделенно/невыделенно
			 * @param {array}   ids   -- id объекта
			 */
			this.setStateSelectObjectById = function(state, id) {
				state = !!state;
				if(typeof id == 'string') {
					removeSelects();
					var $objwrap = $('#' + id);

					if($objwrap.length) {
						if(state)
							$objwrap.addClass('selected');
						else
							$objwrap.removeClass('selected');
					}
					else
						msg.notice('ObjectsList::setStateSelectObjectById по заданному списку id объектов ("#' + id +'") не найдено ни одного блока объекта');
				}
				else
					msg.notice('ObjectsList::setStateSelectObjectById полученный id объекта не является строкой', id);
			};



			/**
			 * Изменяет значение в полях параметров
			 * @param {string}  id     -- id объекта
			 * @param {object}  data   -- объект с новыми значениями
			 * @param {boolean} comeUp -- перемещать ли блок вверх
			 */
			this.changeObjectData = function(id, data, comeUp) {
				var $wrap = $list.find('#'+id);
				if($wrap.length) {
					removeSelects();

					if(comeUp) // Перемещаем блок вверх
						$list.prepend($wrap);

					$wrap.addClass('selected');

					if(data.inputs) {
						for(var name in data.inputs) {
							var $input = $wrap.find('.obj-input_'+name);
							if($input.length) {
								$input.val(data.inputs[name]);
							}
							else
								msg.notice('ObjectsList::changeObjectParametr по заданному названию параметра объекта ("'+ name +'") не найдено ни одного поля блока объекта');
						}
					}
					
					if(data.values) {
						for(var name in data.values) {
							var $elem = $wrap.find('.obj-value_'+name);
							if($elem.length) {
								$elem.text(data.values[name]);
							}
							else
								msg.notice('ObjectsList::changeObjectParametr по заданному названию значения объекта ("'+ name +'") не найдено ни одного элемента блока объекта');
						}
					}
				}
				else
					msg.notice('ObjectsList::changeObjectParametr по заданному id объекта ("'+ id +'") не найдено ни одного блока объекта');
			};



			/**
			 * Обработка отражения изображения двери по вертикали/горизонтали
			 * @param {*} e -- событие клика
			 */
			function flipDoor(e) {
				var $this = $(this);
				var param = $this.data('parametr');
				var $wrap = $this.parents('.bnav_object-door');

				if($wrap.length) {
					var id = $wrap.attr('id');
					if(id) {
						canvas.changeObjectParametr(id, param, $this.is(':checked'));
					}
					else
						msg.warning('HTML-элемент блока двери не имеет id атрибута');
				}
				else
					msg.warning('Не удалось найти HTML-элемент блока двери');
			}



			/**
			 * Добавление блока нового объекта
			 * @param {object} obj_param -- параметры блока
			 */
			this.add = function(objParam) {
				var $wrap  = $('<li />', {
					'id'   : objParam.id,
					'class': 'bnav_objects-objwrap bnav_object-' + objParam.type
				}).appendTo($list);

				var $delete = $('<span />', {
					'class' : 'bnav_objects-delete',
					'text'  : 'X',
					'click' : function(e) {
						var $this = $(this);
						var $wrap = $this.parent();
						var id    = $wrap.attr('id');
						if(id) {
							canvas.remove(id);
							$wrap.remove();
						}
						else
							msg.notice('Попытка удалить объект с пустым id');
					}
				}).appendTo($wrap);

				var $title = $('<div />', {
					'class': 'bnav_objects-title',
					'click': changeSelect
				}).appendTo($wrap);
				var $titleLabel = $('<label />', {
				}).appendTo($title);
				var $objName = $('<span />', {
					'class': 'bnav_objects-name',
					'text': objParam.id
				}).appendTo($titleLabel);

				var $body = $('<div />', {
					'class': 'bnav_objects-body',
				}).appendTo($wrap);

				var $wrapCoords = $('<div />', {
					'class': 'obj-coords',
					'text' : 'Координаты'
				}).appendTo($body);


				switch(objParam.type) {
					case 'wall':
						$titleLabel.prepend('Стена ');
						// Координаты
						var $labelX1 = $('<label />', {
							'text' : 'x1: '
						}).appendTo($wrapCoords);
						var $inputX1 = $('<input>', {
							'class'        : 'obj-input obj-input_x1',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][x1]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.x1,
							'data-parametr': 'x1'
						}).appendTo($labelX1);

						var $labelY1 = $('<label />', {
							'text' : 'y1: '
						}).appendTo($wrapCoords);
						var $inputY1 = $('<input>', {
							'class'        : 'obj-input obj-input_y1',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][y1]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.y1,
							'data-parametr': 'y1'
						}).appendTo($labelY1);

						var $labelX2 = $('<label />', {
							'text' : 'x2: '
						}).appendTo($wrapCoords);
						var $inputX2 = $('<input>', {
							'class'        : 'obj-input obj-input_x2',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][x2]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.x2,
							'data-parametr': 'x2'
						}).appendTo($labelX2);

						var $labelY2 = $('<label />', {
							'text' : 'y2: '
						}).appendTo($wrapCoords);
						var $inputY2 = $('<input>', {
							'class'        : 'obj-input obj-input_y2',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][y2]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.y2,
							'data-parametr': 'y2'
						}).appendTo($labelY2);

						// Длина
						var $objLengthBox = $('<div />', {
							'html' : 'Длина: '
						}).appendTo($body);
						var $objLength = $('<span />', {
							'class': 'obj-value_length',
							'html' : objParam.length
						}).appendTo($objLengthBox);
						break;

					case 'door':
						$titleLabel.prepend('Дверь ');
						// Координаты
						var $labelX = $('<label />', {
							'text' : 'x: '
						}).appendTo($wrapCoords);
						var $inputX = $('<input>', {
							'class'        : 'obj-input obj-input_x',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][x]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.x,
							'data-parametr': 'x'
						}).appendTo($labelX);

						var $labelY = $('<label />', {
							'text' : 'y: '
						}).appendTo($wrapCoords);
						var $inputY = $('<input>', {
							'class'        : 'obj-input obj-input_y',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][y]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.y,
							'data-parametr': 'y'
						}).appendTo($labelY);

						// Угол поворота
						var $wrapAngle = $('<div />', {
							'class': 'obj-angle',
							'text' : 'Угол'
						}).appendTo($body);

						var $labelAngle = $('<label />', {
							'text' : 'поворота: '
						}).appendTo($wrapAngle);
						var $inputAngle = $('<input>', {
							'class'        : 'obj-input obj-input_angle',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][angle]',
							'min'          : 0,
							'max'          : 360,
							'value'        : objParam.angle,
							'data-parametr': 'angle'
						}).appendTo($labelAngle);

						// Отражение по вертикали/горизонтали
						var $wrapFlip = $('<div />', {
							'class': 'obj-flip',
							'text': 'Отразить '
						}).appendTo($body);
						var $inputFlipXh = $('<input>', {
							'class'        : 'obj-input obj-input_flipxh',
							'type'         : 'hidden',
							'name'         : objParam.type + '['+objParam.id+'][flipX]',
							'value'        : 0,
							'data-parametr': 'flipXh'
						}).appendTo($wrapFlip);
						var $labelFlipX = $('<label />', {
							'text' : 'по горизонтали '
						}).appendTo($wrapFlip);
						var $inputFlipX = $('<input>', {
							'class'        : 'obj-input obj-input_flipx',
							'type'         : 'checkbox',
							'name'         : objParam.type + '['+objParam.id+'][flipX]',
							'value'        : 1,
							'data-parametr': 'flipX',
							'checked'      : !!objParam.flipX,
							'change'       : flipDoor
						}).appendTo($labelFlipX);

						var $inputFlipYh = $('<input>', {
							'class'        : 'obj-input obj-input_flipyh',
							'type'         : 'hidden',
							'name'         : objParam.type + '['+objParam.id+'][flipY]',
							'value'        : 0,
							'data-parametr': 'flipYh'
						}).appendTo($wrapFlip);
						var $labelFlipY = $('<label />', {
							'text' : 'по вертикали '
						}).appendTo($wrapFlip);
						var $inputFlipY = $('<input>', {
							'class'        : 'obj-input obj-input_flipy',
							'type'         : 'checkbox',
							'name'         : objParam.type + '['+objParam.id+'][flipY]',
							'value'        : 1,
							'data-parametr': 'flipY',
							'checked'      : !!objParam.flipY,
							'change'       : flipDoor
						}).appendTo($labelFlipY);

						// Масштабирование
						var $wrapScale = $('<div />', {
							'class': 'obj-scale',
							'text' : 'Масштабирование'
						}).appendTo($body);
						
						var $labelScaleX = $('<label />', {
							'text' : 'по x: '
						}).appendTo($wrapScale);
						var $inputScaleX = $('<input>', {
							'class'        : 'obj-input obj-input_scale_x',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][scaleX]',
							'min'          : 0.1,
							'max'          : 50,
							'value'        : objParam.scaleX,
							'data-parametr': 'scale_x'
						}).appendTo($labelScaleX);

						// Длина
						var $objLengthBox = $('<div />', {
							'html' : 'Длина: '
						}).appendTo($body);
						var $objLength = $('<span />', {
							'class': 'obj-value_length',
							'html' : objParam.length
						}).appendTo($objLengthBox);
						break;

					case 'stairs':
						$titleLabel.prepend('Лестница ');
						// Координаты
						var $labelX = $('<label />', {
							'text' : 'x: '
						}).appendTo($wrapCoords);
						var $inputX = $('<input>', {
							'class'        : 'obj-input obj-input_x',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][x]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.x,
							'data-parametr': 'x'
						}).appendTo($labelX);
		
						var $labelY = $('<label />', {
							'text' : 'y: '
						}).appendTo($wrapCoords);
						var $inputY = $('<input>', {
							'class'        : 'obj-input obj-input_y',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][y]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.y,
							'data-parametr': 'y'
						}).appendTo($labelY);

						// Угол поворота
						var $labelAngle = $('<label />', {
							'text' : 'поворот: '
						}).appendTo($wrapCoords);
						var $inputAngle = $('<input>', {
							'class'        : 'obj-input obj-input_angle',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][angle]',
							'min'          : 0,
							'max'          : 360,
							'value'        : objParam.angle,
							'data-parametr': 'angle'
						}).appendTo($labelAngle);

						// Масштабирование
						var $wrapScale = $('<div />', {
							'class': 'obj-scale',
							'text' : 'Масштабирование'
						}).appendTo($body);
						
						var $labelScaleX = $('<label />', {
							'text' : 'по x: '
						}).appendTo($wrapScale);
						var $inputScaleX = $('<input>', {
							'class'        : 'obj-input obj-input_scale_x',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][scaleX]',
							'min'          : 0.1,
							'max'          : 50,
							'value'        : objParam.scaleX,
							'data-parametr': 'scale_x'
						}).appendTo($labelScaleX);

						var $labelScaleY = $('<label />', {
							'text' : 'по y: '
						}).appendTo($wrapScale);
						var $inputScaleY = $('<input>', {
							'class'        : 'obj-input obj-input_scale_y',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][scaleY]',
							'min'          : 0.1,
							'max'          : 50,
							'value'        : objParam.scaleY,
							'data-parametr': 'scale_y'
						}).appendTo($labelScaleY);

						// Длина
						var $objLengthBox = $('<div />', {
							'html' : 'Длина&nbsp;&nbsp;&nbsp;&nbsp;по x: '
						}).appendTo($body);
						var $objLengthX = $('<span />', {
							'class': 'obj-value_length_x',
							'html' : objParam.lengthX
						}).appendTo($objLengthBox);

						$objLengthBox.append('&nbsp;&nbsp;&nbsp;&nbsp;по y: ');
						var $objLengthY = $('<span />', {
							'class': 'obj-value_length_y',
							'html' : objParam.lengthY
						}).appendTo($objLengthBox);
						break;

					case 'room':
						$titleLabel.prepend('Границы комнаты ');
						var $labelLeft = $('<label />', {
							'text' : 'x: '
						}).appendTo($wrapCoords);
						var $inputLeft = $('<input>', {
							'class'        : 'obj-input obj-input_left',
							'type'         : 'number',
							'name'         : objParam.type + '[left]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.left,
							'data-parametr': 'left'
						}).appendTo($labelLeft);
		
						var $labelTop = $('<label />', {
							'text' : 'y: '
						}).appendTo($wrapCoords);
						var $inputTop = $('<input>', {
							'class'        : 'obj-input obj-input_top',
							'type'         : 'number',
							'name'         : objParam.type + '[top]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.top,
							'data-parametr': 'top'
						}).appendTo($labelTop);
						break;

					case 'room_dot':
						$titleLabel.prepend('Угол комнаты ');
						var $labelX = $('<label />', {
							'text' : 'x: '
						}).appendTo($wrapCoords);
						var $inputX = $('<input>', {
							'class'        : 'obj-input obj-input_x',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][x]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.x,
							'data-parametr': 'x'
						}).appendTo($labelX);
		
						var $labelY = $('<label />', {
							'text' : 'y: '
						}).appendTo($wrapCoords);
						var $inputY = $('<input>', {
							'class'        : 'obj-input obj-input_y',
							'type'         : 'number',
							'name'         : objParam.type + '['+objParam.id+'][y]',
							'min'          : 0,
							'max'          : 1000000,
							'value'        : objParam.y,
							'data-parametr': 'y'
						}).appendTo($labelY);
						break;
				}
			};
		}



		/*
		*******************************************
		*************** Бар кнопок ****************
		*******************************************
		*/
		function ButtonsBlock() {
			var $wrap = $('<div />', {
				'class': 'bnav_buttons'
			}).appendTo($form);

			var $delete = $('<button />', {
				'type' : 'button',
				'class': 'bnav_delete',
				'text' : 'Удалить'
			});
			if(isUpdatePart)
				$delete.appendTo($wrap);

			var $save = $('<button />', {
				'type' : 'button',
				'class': 'bnav_save',
				'text' : 'Сохранить'
			}).appendTo($wrap);



			/**
			 * Обработчик нажатия на кнопку сохранения
			 * @param {*} e -- событие нажатия на кнопку
			 */
			function save(e) {
				requestData = $form.serializeArray();
				requestData.push({
					'name'  : 'part',
					'value' : editorParams.part
				});

				model.saveEditorData(requestData, function(data) {
					if(!isUpdatePart) {
						var baseAddrSlice = pageAddress.structure.slice(0, pageAddress.structure.length - 1);
						var baseAddr      = [];
						for(i in baseAddrSlice) {
							if(typeof baseAddrSlice[i] === 'object')
								baseAddr.push(baseAddrSlice[i].object + '-' + baseAddrSlice[i].id);
							else if(typeof baseAddr[i] === 'string')
								baseAddr.push(baseAddrSlice[i]);
						}

						router('/' + baseAddr.join('/') + '/' + data.object);
					}
					else {
						alert('Данные обновлены');
						menu.choose(pageAddress.address);
					}
				});
			}
			$save.on('click', save);



			/**
			 * Обработчик нажатия на кнопку удаления
			 * @param {*} e -- событие нажатия на кнопку
			 */
			function remove(e) {
				if(isUpdatePart && confirm('Вы действительно хотите удалить данный объект?')) {
					model.deleteEditorData({'id': editorParams.id, 'object': editorParams.part}, function() {
						router('/');
					});
				}
			}
			$delete.on('click', remove);
		}


		this.resize = function() {
			canvas.resize();
			metrage.resize();
		}


		/*
		 *******************************************
		 ************ Погрузка объектов ************
		 *******************************************
		*/
		if(editorParams.data && editorParams.data.inactiveObjects)
			canvas.loadInactive(editorParams.data.inactiveObjects);

		if(editorParams.data && editorParams.data.objects)
			canvas.load(editorParams.data.objects);
	}



	/*
	 *******************************************
	 ************ Обработка resize ************
	 *******************************************
	*/
	window.addEventListener('resize', function(e) {
		if(window.innerWidth < 900)
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
