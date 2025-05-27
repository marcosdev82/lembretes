module.exports = class SettingsController {
    static async showSettings(req, res) {
        res.render('settings/home');
    }
}
// This controller handles the settings page of the application.