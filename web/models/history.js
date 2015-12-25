
module.exports = function(sequelize, DataTypes) {
    var History = sequelize.define("History", {
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
       	history: {
            type : DataTypes.TEXT
        }
    });
    return History;
};
