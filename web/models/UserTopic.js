
module.exports = function(sequelize, DataTypes) {
    var UserTopic = sequelize.define("UserTopic", {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uid : {
            type : DataTypes.STRING,
            allowNull: false,
            unique: true
        },
       	topics: {
            type : DataTypes.TEXT
        }
    });
    return UserTopic;
};
