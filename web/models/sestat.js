module.exports = function(sequelize, DataTypes) {
    var SEStat = sequelize.define("SEStat", {
        time : {
            type : DataTypes.STRING,
            primaryKey: true
        },
        search: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        null_search: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        search_with_click: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        click: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        first_ctp_sum: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        first_ctt_sum: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        pagenation: {
            type : DataTypes.BIGINT,
            allowNull: false
        },
        pagenation_sum: {
            type : DataTypes.BIGINT,
            allowNull: false
        }
    });
    return SEStat;
};