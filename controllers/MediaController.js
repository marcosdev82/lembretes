const sequelizePaginate = require('sequelize-paginate');
const User = require('../models/User');
const renderPagination = require('../components/pagination');
const slugify = require('slugify');
const { Op } = require('sequelize'); 
const { isValid, parseISO } = require('date-fns');
const { formatForDatetimeLocal } = require('../helpers/parseFormat')

// sequelizePaginate.paginate(Reminder);

module.exports = class MediaController {
    static async showMedias(req, res) {
        if (!req.session.userid) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        res.render('media/home');
    }
}