<?php
require_once('./config.php');
$revision = true ? rand(1, 1000000) : '';
$title    = 'Карта зданий';
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title><?= $title ?></title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link type="text/css" href="<?= FRONTEND_DIR ?>styles/buildingnav/buildingnav.css?<?= $revision ?>" rel="stylesheet">
		<style type="text/css">
			body {margin: 0;}
		</style>
	</head>
	<body>
		<main>
			<!-- ~~~~~~~~ Блок редактора ~~~~~~~~ -->
			<div class="building_nav">
				<p style="color: red;"><!-- placeholder -->
					Модуль навигации не работает
				</p>
			</div>
			<!-- ~~~~~~~~ \Блок редактора ~~~~~~~~ -->
		</main>



		<!-- ~~~~~~~~ Скрипты ~~~~~~~~ -->
		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/fabric.min.js"></script>
		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/jquery.min.js"></script>
		<script type="text/javascript" src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=<?= ''/* <ваш API-ключ> */ ?>"></script>
		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/buildingnav.js?<?= $revision ?>"></script>
		<script>
			document.addEventListener("DOMContentLoaded", function() {
				$(document).ready(function() {
					window.bna = buildingNav({
						// 'debug': false,
						'urls' : {
							'images'        : '<?= FRONTEND_DIR ?>images/buildingnav/', // url адрес директории изображений объектов канвы (лестниц, дверей)
							'loadingBuilds' : '<?= FRONTEND_DIR ?>load_builds.php',    // url адрес для подгрузки данных о зданиях
						},
						'city'  : 'Брянск', // Город
						// 'height': 320, // Высота по умолчанию (default '0' -- автоматическое подстраивание под высоту окна)
						// 'width' : 320, // Ширина по умолчанию (default '0' -- автоматическое подстраивание под ширину родительского блока)
						// 'open'  : '/build-1/floor-1/room-4' // адрес изначально открываемого пункта (default '/')
					});
				});
			});
		</script>
		<!-- ~~~~~~~~ \Скрипты ~~~~~~~~ -->
	</body>
</html>
