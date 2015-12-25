module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type : DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nickname: {
            type : DataTypes.STRING,
            allowNull: false,
            unique: false
        },
        avatar: {
            type : DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        password: {
            type : DataTypes.STRING,
            allowNull: false
        },
        isstaff : {
            type : DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
    return User;
};