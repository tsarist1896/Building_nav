CREATE DATABASE building_nav;

-- здания
CREATE TABLE IF NOT EXISTS `bn_buildings` (
  `id`        int          NOT NULL AUTO_INCREMENT,
  `name`      varchar(256) NOT NULL,
  `longitude` varchar(64)  NOT NULL,
  `latitude`  varchar(64)  NOT NULL,
  `borders`   text         NOT NULL, -- JSON объект
  PRIMARY KEY (`id`),
  UNIQUE KEY `bname` (`name`),
  UNIQUE KEY `nav_coord` (`longitude`,`latitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;



-- планировка этажей
CREATE TABLE IF NOT EXISTS `bn_floors` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `build_id`    int NOT NULL,
  `number`      int NOT NULL,
  `objects`     text         DEFAULT NULL, -- JSON объект
  PRIMARY KEY (`id`),
  FOREIGN KEY (`build_id`) REFERENCES `bn_buildings` (`id`)
  ON UPDATE RESTRICT
  ON DELETE CASCADE,
  UNIQUE KEY `bfloor` (`build_id`, `number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;



-- данные и границы помещений
CREATE TABLE IF NOT EXISTS `bn_rooms` (
  `id`        int          NOT NULL AUTO_INCREMENT,
  `build_id`  int          NOT NULL,
  `floor_id`  int          NOT NULL,
  `number`    int                   DEFAULT NULL,
  `name`      varchar(128)          DEFAULT NULL,
  `data`      text                  DEFAULT NULL, -- JSON объект
  PRIMARY KEY (`id`),
  FOREIGN KEY (`build_id`) REFERENCES `bn_buildings` (`id`)
  ON UPDATE RESTRICT
  ON DELETE CASCADE,
  FOREIGN KEY (`floor_id`) REFERENCES `bn_floors` (`id`)
  ON UPDATE RESTRICT
  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;