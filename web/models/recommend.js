module.exports = function(sequelize, DataTypes) {
    var Recommend = sequelize.define("Recommend", {
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
        recommend: {
            type : DataTypes.TEXT
        }
    });
    return Recommend;
};
