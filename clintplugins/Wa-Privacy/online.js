module.exports = async (context) => {

    const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

    await ownerMiddleware(context, async () => {

        const { client, m, text } = context;

        if (!text) {
            m.reply("Por favor, informe a opção que deseja atualizar.\nExemplo:\nonline all");
            return;
        }

        const availablepriv = ['all', 'match_last_seen'];

        if (!availablepriv.includes(text)) {
            return m.reply(`Escolha uma opção válida: ${availablepriv.join(' / ')}`);
        }

        await client.updateOnlinePrivacy(text);
        await m.reply(`Configuração de privacidade de online atualizada para *${text}* com sucesso.`);
    });

};
