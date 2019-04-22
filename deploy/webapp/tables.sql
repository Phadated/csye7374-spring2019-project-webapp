use csye6225

create table IF NOT EXISTS user(
    ID INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY ( ID )
);

create table IF NOT EXISTS transaction(
    ID VARCHAR(500) NOT NULL,
    description VARCHAR(100) NOT NULL,
    merchant VARCHAR(100) NOT NULL,
    amount VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    user_id int NOT NULL,
    PRIMARY KEY ( ID ),
    foreign key (user_id) references user (ID)
    );

create table IF NOT EXISTS attachment(
    ID VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(500) NOT NULL,
    PRIMARY KEY ( ID ),
    foreign key (transaction_id) references transaction (ID)
    )
