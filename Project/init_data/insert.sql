INSERT INTO routes (route_id, route_name, route_city, rating) VALUES
('1', 'Boulders Finest', 'Boulder', '8'),
('2', 'The FlatIrons', 'Boulder', '6'),
('3', 'The Boulder Carnival Wall', 'Boulder', '1'),
('4', 'Fort Collins Gym', 'Fort Collins', '5'),
('5', 'Golden Rock Wall', 'Golden', '6');

INSERT INTO users (username, password, photoid, user_bio, user_city) VALUES
('testuser', '$2b$10$qGERG4UYi5wuhbPO8krTEOsPr3jZZk6gNXSTYx.mZXBdlnaw/fEBK', 'img/black.png','This is a sample bio you can update', 'Boulder'),
('climb.bradley', 'bjlfiobtj', 'img/social.png', 'I love to climb mountains, rock climbing, and ice climbing. Ive climbed all over the world, from Yosemite to Elbrus to Annapurna.', 'Cheyenne'),
('clm10', 'bvijoreiore','img/yosemite.png', 'I also enjoy hiking, camping, and exploring nature. ', 'Boulder'),
('therock' , 'dfklrgkl', 'img/social.png', 'When im not fast or furious, im climbing', 'Los Angleles'),
('turbo_jeffrey', 'sdfkbkjlfrr', 'img/thailand.png', 'the worlds fastest human. He can run faster than the speed of sound', 'Boulder'),
('yogi.carl', 'fgkjgrkjlbvkln', 'img/thailand.png',  'Im a yoga teacher and I love helping people find their zen. Im also a bit of a foodie, and I love to cook. When Im not teaching yoga or cooking, you can find me hanging out with my cat, Mr. Tibbles.', 'Boulder'),
('samatha.cricket' , 'dfkjlaskl', 'img/everest.png', 'Getting older is like a box of chocolates: you never know what youre going to get.', 'Boulder'),
('chad_10', 'vngrrddvcd', 'img/everest.png', 'Is life attempting to bring me down? Great, Ill just use it as fuel.','Denver');

INSERT INTO friends (user_id_1, user_id_2) VALUES
('1', '4'),
('1', '3'),
('2', '6'),
('2', '1');