const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getBannedUsers, unbanUser } = require('../../Database/config');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
        };

        let numberToUnban;

        // Verifica usuário citado, mencionado ou passado no argumento
        if (m.quoted) {
            numberToUnban = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToUnban = m.mentionedJid[0];
        } else {
            numberToUnban = args[0];
        }

        if (!numberToUnban) {
            return await m.reply(
                formatStylishReply('Por favor, forneça um número válido ou cite um usuário.')
            );
        }

        // Remove sufixos do WhatsApp
        numberToUnban = numberToUnban.replace('@s.whatsapp.net', '').trim();

        const bannedUsers = await getBannedUsers();

        if (!bannedUsers.includes(numberToUnban)) {
            return await m.reply(
                formatStylishReply('Esse usuário não estava banido.')
            );
        }

        await unbanUser(numberToUnban);

        await m.reply(
            formatStylishReply(`O usuário ${numberToUnban} foi desbanido com sucesso!`)
        );
    });
};
