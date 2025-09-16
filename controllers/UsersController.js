module.exports = class UsersController {

    static async showUsers(req, res) {
    
        res.render('users/home');

    }

}