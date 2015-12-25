
module.exports = function(sequelize, DataTypes) {
    var ModelView = sequelize.define("ModelView", {
        Topic : {
            type : DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
            unique: true
        },
        Rate : {
            type : DataTypes.STRING,
            allowNull: false,
            autoIncrement: false,
            primaryKey: false,
            unique: false
        },
       	Context: {
            type : DataTypes.TEXT
        }
    });
    return ModelView;
};
