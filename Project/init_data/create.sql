CREATE TABLE Users(
    user_id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(20) UNIQUE, --added UNIQUE to stop people signing up w/ same usernames in RegisterPath/zachBranch commit
    password VARCHAR, 
    user_bio VARCHAR(200),
    user_city VARCHAR(20)
);

CREATE TABLE Routes(
    route_id SERIAL NOT NULL PRIMARY KEY,
    route_name VARCHAR(45),
    route_city VARCHAR(20),
    rating FLOAT
);

CREATE TABLE Route_Messages(
    route_id INT,
    user_id INT,
    message VARCHAR(100),

    CONSTRAINT fk_trail
    FOREIGN KEY(route_id)
    REFERENCES Routes(route_id),

    CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES Users(user_id)
);

CREATE TABLE User_Routes(
    user_id INT,
    route_id INT,
    
    CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES Users(user_id),

    CONSTRAINT fk_route
    FOREIGN KEY(route_id)
    REFERENCES Routes(route_id)
);

CREATE TABLE Friends(
    friendship_id SERIAL NOT NULL PRIMARY KEY,
    user_id_1 INT,
    user_id_2 INT,

    CONSTRAINT fk_user_1
    FOREIGN KEY(user_id_1)
    REFERENCES Users(user_id),

    CONSTRAINT fk_user_2
    FOREIGN KEY(user_id_2)
    REFERENCES Users(user_id)
);

CREATE TABLE Messages(
    friendship_id INT,
    user_id_sent_by INT,
    message VARCHAR(100),

    CONSTRAINT fk_friendship
    FOREIGN KEY(friendship_id)
    REFERENCES Friends(friendship_id),

    CONSTRAINT fk_sender
    FOREIGN KEY(user_id_sent_by)
    REFERENCES Users(user_id)
);