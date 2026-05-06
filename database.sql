CREATE TABLE IF NOT EXISTS `lifeos_inventory` (
  `identifier` varchar(50) NOT NULL,
  `items` longtext DEFAULT '[]',
  `slots` int(11) DEFAULT 100,
  PRIMARY KEY (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
