module.exports = class SettingsController {
    static async showSettings(req, res) {
        res.render('reminder/home');
    }

    static async dashboard(req, res) {
        res.render('settings/dashboard')
    }
}