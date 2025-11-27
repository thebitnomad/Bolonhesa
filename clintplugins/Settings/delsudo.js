const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSettings, getSudoUsers, removeSudoUser } = require('../../Database/config');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;

        try {
            let numberToRemove;

            if (m.quoted) {
                numberToRemove = m.quoted.sender.split('@')[0];
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                numberToRemove = m.mentionedJid[0].split('@')[0];
            } else {
                numberToRemove = args[0];
            }

            if (!numberToRemove || !/^\d+$/.test(numberToRemove)) {
                return await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Por favor, forneça um número válido ou responda uma mensagem.
┗━━━━━━━━━━━━━━━┛`
                );
            }

            const settings = await getSettings();
            if (!settings) {
                return await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ As configurações não foram encontradas.
│❒ Verifique sua database.
┗━━━━━━━━━━━━━━━┛`
                );
            }

            const sudoUsers = await getSudoUsers();

            if (!sudoUsers.includes(numberToRemove)) {
                return await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Este número não está na lista de usuários Sudo.
┗━━━━━━━━━━━━━━━┛`
                );
            }

            await removeSudoUser(numberToRemove);

            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ ${numberToRemove} foi removido da lista de Sudo Users com sucesso.
┗━━━━━━━━━━━━━━━┛`
            );

        } catch (error) {
            console.error('[RemoveSudo] Error:', error);
            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao remover o usuário Sudo.
│❒ Tente novamente mais tarde.
┗━━━━━━━━━━━━━━━┛`
            );
        }
    });
};
