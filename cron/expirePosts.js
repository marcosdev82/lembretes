const cron = require('node-cron');
const { Reminder } = require('../models/Reminder');
const { Op } = require('sequelize');

// Agenda a tarefa para rodar a cada hora
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        await Reminder.update(
            { post_status: 'expired' },
            {
                where: {
                    post_expire: { [Op.lt]: now },
                    post_status: { [Op.ne]: 'expired' }
                }
            }
        );
        console.log(`[CRON] Lembretes expirados atualizados às ${now.toISOString()}`);
    } catch (err) {
        console.error('[CRON] Erro ao atualizar lembretes expirados:', err);
    }
});
