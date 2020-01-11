<?php
	require_once('../config.php');
	$revision = true ? mt_rand(0, 10000) : '';
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>building nav | Административная часть</title>
		<link type="text/css" href="<?= FRONTEND_DIR ?>styles/buildingnav/buildingnav_admin.css?<?= $revision ?>" rel="stylesheet">
	</head>
	<body>
		<div class="building_nav_admin">
			<p style="color: red;"><!-- placeholder -->
				Если вы видите эту надпись, то либо еще не подгрузился модуль админ панели, 
				либо в процессе подгрузки произошла ошибка.
			</p>
		</div>

		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/fabric.min.js"></script>
		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/jquery.min.js"></script>
		<script type="text/javascript" src="<?= FRONTEND_DIR ?>js/buildingnav_admin.js?<?= $revision ?>"></script>
		<script>
			document.addEventListener("DOMContentLoaded", function() {
				$(document).ready(function() {
					window.bna = buildingNavAdmin({
						// 'debug': true,
						'urls' : {
                            'images'           : '<?= FRONTEND_DIR ?>images/buildingnav/',    // url адрес директории изображений объектов канвы (лестниц, дверей)
                            'loadingBuilds'    : '<?= FRONTEND_DIR ?>load_builds.php',      // url адрес для подгрузки данных о зданиях
							'saveEditorData'   : '<?= FRONTEND_ADMIN_DIR ?>save_editor_data.php',  // url адрес для сохранения данных здания
							'loadingEditorData': '<?= FRONTEND_ADMIN_DIR ?>load_editor_data.php',  // url адрес для подгрузки данных для редактора
							'deleteEditorData' : '<?= FRONTEND_ADMIN_DIR ?>delete_editor_data.php' // url адрес для удаления данных здания
						},
						// 'height': 550, // Высота канвы
						// 'open'  : '/build-1/floor-1/room-4' // адрес изначально открываемого пункта (default '/')
					});
				});
			});
		</script>
	</body>
</html>