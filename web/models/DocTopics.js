module.exports = function(sequelize, DataTypes) {
    var DocTopic = sequelize.define("DocTopic", {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        doc_id : {
            type : DataTypes.STRING,
            allowNull: false,
            unique: true
        },
       	Topics: {
            type : DataTypes.TEXT
        }
    });
    return DocTopic;
};
