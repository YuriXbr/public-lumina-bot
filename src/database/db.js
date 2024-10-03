const { Sequelize, DataTypes } = require('sequelize');
const mongoose = require('mongoose');
const config = require('../private/config.json');

const dbConfig = config.database;

let sequelize = null;
let Guilds = null;
let MuteList = null;
let BanList = null;
let WarnList = null;

async function initializeDatabase() {
    if (dbConfig.moongose) {
        // Conexão MongoDB
        await mongoose.connect(`mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`, dbConfig.mongoOptions);
        console.log('Conectado ao MongoDB');

        // Defina o esquema do MongoDB
        const guildSchema = new mongoose.Schema({
            guildId: { type: String, required: true, unique: true },
            guildReferenceName: { type: String, required: true },
            muteRoleId: { type: String, required: true },
            banRoleId: { type: String, required: true },
            moderationChannelId: { type: String, required: true },
            guildOwnerId: { type: String, required: true },
            prefix: { type: String, default: 'l!' },
            blockedChannels: { type: [String], default: [] },
            djEnabled: { type: Boolean, default: false },
            djRoleId: { type: String, default: '' },
            persistentMute: { type: Boolean, default: true },
            persistentWarns: { type: Boolean, default: true },
            warnsToTimeOut: { type: Number, default: 0 },
            warnsToMute: { type: Number, default: 0 },
            warnsToKick: { type: Number, default: 0 },
            warnsToBan: { type: Number, default: 0 },
            autoWarnPunishment: { type: Boolean, default: false },
            botInfoChannelId: { type: String, default: '' },
            eventLogChannelId: { type: String, default: '' },
            guildLocale: { type: String, default: 'en-US' },
            canPunishStaff: { type: Boolean, default: true },
            memberDmToggle: { type: Boolean, default: false },
            memberWelcomeToggle: { type: Boolean, default: false },
            memberJoinChannelId: { type: String, default: '' },
            memberJoinMessage: { type: String, default: '' },
            memberLeaveChannelId: { type: String, default: '' },
            memberLeaveMessage: { type: String, default: '' },
            memberJoinDmMessage: { type: String, default: '' },
            warnDuration: { type: Number, default: 3 * 30 * 24 * 60 * 60 * 1000 } // 3 meses em milissegundos
        });

        const muteListSchema = new mongoose.Schema({
            guildId: { type: String, required: true },
            targetId: { type: String, required: true },
            staffId: { type: String, required: true },
            reason: { type: String, default: '' },
            startTime: { type: Date, default: Date.now },
            endTime: { type: Date, default: null }
        });

        const banListSchema = new mongoose.Schema({
            guildId: { type: String, required: true },
            targetId: { type: String, required: true },
            staffId: { type: String, required: true },
            reason: { type: String, default: '' },
            startTime: { type: Date, default: Date.now },
            endTime: { type: Date, default: null }
        });

        const warnListSchema = new mongoose.Schema({
            guildId: { type: String, required: true },
            targetId: { type: String, required: true },
            staffId: { type: String, required: true },
            reason: { type: String, default: '' },
            startTime: { type: Date, default: Date.now },
            endTime: { type: Date, default: null }
        });

        Guilds = mongoose.model('Guilds', guildSchema);
        MuteList = mongoose.model('MuteList', muteListSchema);
        BanList = mongoose.model('BanList', banListSchema);
        WarnList = mongoose.model('WarnList', warnListSchema);
    } else {
        // Conexão MySQL
        sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
            host: dbConfig.host,
            dialect: 'mysql',
            logging: false
        });

        await sequelize.authenticate();
        console.log('Conectado ao MySQL');

        // Defina o modelo MySQL
        Guilds = sequelize.define('Guilds', {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            guildReferenceName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            muteRoleId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            banRoleId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            moderationChannelId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            guildOwnerId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            prefix: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'l!'
            },
            blockedChannels: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            },
            djEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            djRoleId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            persistentMute: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            persistentWarns: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            warnsToTimeOut: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            warnsToMute: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            warnsToKick: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            warnsToBan: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            autoWarnPunishment: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            botInfoChannelId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            eventLogChannelId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            guildLocale: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'en-US'
            },
            canPunishStaff: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            memberDmToggle: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            memberWelcomeToggle: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            memberJoinChannelId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            memberJoinMessage: {
                type: DataTypes.STRING,
                allowNull: true
            },
            memberLeaveChannelId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            memberLeaveMessage: {
                type: DataTypes.STRING,
                allowNull: true
            },
            memberJoinDmMessage: {
                type: DataTypes.STRING,
                allowNull: true
            },
            warnDuration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3 * 30 * 24 * 60 * 60 * 1000 // 3 meses em milissegundos
            }
        });

        MuteList = sequelize.define('MuteList', {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            targetId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            staffId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: true
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });

        BanList = sequelize.define('BanList', {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            targetId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            staffId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: true
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });

        WarnList = sequelize.define('WarnList', {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            targetId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            staffId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: true
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });

        // Sincronize os modelos com o banco de dados
        await sequelize.sync({ alter: true });
        console.log('Tabelas sincronizadas com sucesso');
    }
}

async function getGuildData(guildId) {
    if (dbConfig.moongose) {
        return await Guilds.findOne({ guildId });
    } else {
        return await Guilds.findOne({ where: { guildId } });
    }
}

async function createGuildData(guildId, guildOwnerId, guildReferenceName) {
    if (dbConfig.moongose) {
        return await Guilds.create({
            guildId,
            guildReferenceName,
            muteRoleId: '',
            banRoleId: '',
            moderationChannelId: '',
            guildOwnerId,
            prefix: 'l!',
            blockedChannels: [],
            djEnabled: false,
            djRoleId: '',
            persistentMute: true,
            persistentWarns: true,
            warnsToTimeOut: 0,
            warnsToMute: 0,
            warnsToKick: 0,
            warnsToBan: 0,
            autoWarnPunishment: false,
            botInfoChannelId: '',
            eventLogChannelId: '',
            guildLocale: 'en-US',
            canPunishStaff: true,
            memberDmToggle: false,
            memberWelcomeToggle: false,
            memberJoinChannelId: '',
            memberJoinMessage: '',
            memberLeaveChannelId: '',
            memberLeaveMessage: '',
            memberJoinDmMessage: '',
            warnDuration: 3 * 30 * 24 * 60 * 60 * 1000 // 3 meses em milissegundos
        });
    } else {
        return await Guilds.create({
            guildId,
            guildReferenceName,
            muteRoleId: '',
            banRoleId: '',
            moderationChannelId: '',
            guildOwnerId,
            prefix: 'l!',
            blockedChannels: [],
            djEnabled: false,
            djRoleId: '',
            persistentMute: true,
            persistentWarns: true,
            warnsToTimeOut: 0,
            warnsToMute: 0,
            warnsToKick: 0,
            warnsToBan: 0,
            autoWarnPunishment: false,
            botInfoChannelId: '',
            eventLogChannelId: '',
            guildLocale: 'en-US',
            canPunishStaff: true,
            memberDmToggle: false,
            memberWelcomeToggle: false,
            memberJoinChannelId: '',
            memberJoinMessage: '',
            memberLeaveChannelId: '',
            memberLeaveMessage: '',
            memberJoinDmMessage: '',
            warnDuration: 3 * 30 * 24 * 60 * 60 * 1000 // 3 meses em milissegundos
        });
    }
}

async function updateGuildData(guildId, data) {
    if (dbConfig.moongose) {
        return await Guilds.updateOne({ guildId }, data);
    } else {
        return await Guilds.update(data, { where: { guildId } });
    }
}

async function addMute(guildId, targetId, staffId, reason, endTime) {
    if (dbConfig.moongose) {
        return await MuteList.create({ guildId, targetId, staffId, reason, endTime });
    } else {
        return await MuteList.create({ guildId, targetId, staffId, reason, endTime });
    }
}

async function updateMute(guildId, targetId, data) {
    if (dbConfig.moongose) {
        return await MuteList.updateOne({ guildId, targetId }, data);
    } else {
        return await MuteList.update(data, { where: { guildId, targetId } });
    }
}

async function addBan(guildId, targetId, staffId, reason, endTime) {
    if (dbConfig.moongose) {
        return await BanList.create({ guildId, targetId, staffId, reason, endTime });
    } else {
        return await BanList.create({ guildId, targetId, staffId, reason, endTime });
    }
}

async function updateBan(guildId, targetId, data) {
    if (dbConfig.moongose) {
        return await BanList.updateOne({ guildId, targetId }, data);
    } else {
        return await BanList.update(data, { where: { guildId, targetId } });
    }
}

async function removeMute(guildId, targetId) {
    if (dbConfig.moongose) {
        return await MuteList.deleteOne({ guildId, targetId });
    } else {
        return await MuteList.destroy({ where: { guildId, targetId } });
    }
}

async function removeBan(guildId, targetId) {
    if (dbConfig.moongose) {
        return await BanList.deleteOne({ guildId, targetId });
    } else {
        return await BanList.destroy({ where: { guildId, targetId } });
    }
}

async function addWarn(guildId, targetId, staffId, reason, endTime) {
    if (dbConfig.moongose) {
        return await WarnList.create({ guildId, targetId, staffId, reason, endTime });
    } else {
        return await WarnList.create({ guildId, targetId, staffId, reason, endTime });
    }
}

async function removeWarn(guildId, targetId) {
    if (dbConfig.moongose) {
        return await WarnList.deleteOne({ guildId, targetId });
    } else {
        return await WarnList.destroy({ where: { guildId, targetId } });
    }
}

module.exports = {
    initializeDatabase,
    getGuildData,
    createGuildData,
    updateGuildData,
    addMute,
    updateMute,
    removeMute,
    addBan,
    updateBan,
    removeBan,
    addWarn,
    removeWarn,
    Guilds,
    MuteList,
    BanList,
    WarnList
};