const prisma = require('../models/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ConfigController = {
    async getConfig(res) {
      try{
        const configs = await prisma.config.findMany();
        res.json({message: 'Success', data: configs});
      }catch(err){
        res.status(500).json({ message: err.message });
      }
    },
    async createConfig(req, res) {

    },
    async updateConfig(req, res) {

    },
    async deleteConfig(req, res) {

    }
}

module.exports = ConfigController;