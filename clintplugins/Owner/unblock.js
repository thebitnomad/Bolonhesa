const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text } = context;

        // Verifica se um usuário foi marcado, citado ou informado
        if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
            return m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Por favor, marque ou mencione um usuário para desbloquear.\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );
        }

        // Captura o usuário alvo
        let users = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        const parts = users.split('@')[0];

        // Realiza o desbloqueio
        await client.updateBlockStatus(users, 'unblock');

        // Mensagem de retorno estilosa
        await m.reply(
            "◈━━━━━━━━━━━━━━━━◈\n" +
            `│❒ O número *${parts}* foi desbloqueado com sucesso.\n` +
            "◈━━━━━━━━━━━━━━━━◈"
        );
    });
};
