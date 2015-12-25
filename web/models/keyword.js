module.exports = function(sequelize, DataTypes) {
    var Keyword = sequelize.define("Keyword", {
        word : {
            type : DataTypes.STRING,
            primaryKey: true
        },
        freq: {
            type : DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Keyword;
};