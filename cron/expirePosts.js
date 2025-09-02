const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { Op } = require('sequelize');

// parametrizar tempo no config
cron.schedule('1 * * * * *', async () => { 
    console.log('Executando tarefa CRON...');
    try {
        const now = new Date();

        const result = await Reminder.update(
            { post_status: 'expired' },
            {
                where: {
                    post_expire: {
                        [Op.lt]: now,
                        [Op.not]: null, 
                    },
                    post_status: {
                        [Op.ne]: 'expired',
                    },
                },
            }
        );

        console.log(`[CRON] ${result[0]} lembrete(s) expirado(s) às ${now.toISOString()}`);
    } catch (err) {
        console.error('[CRON] Erro ao atualizar lembretes expirados:', err);
    }
}, {
    timezone: 'America/Fortaleza', // parametrizar timezone no config
});
