module.exports = async (context) => {

    const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

    await ownerMiddleware(context, async () => {

        const { client, m, text } = context;

        if (!text) {
            m.reply("Por favor, informe a opção que deseja atualizar.\nExemplo:\nmystatus all");
            return;
        }

        const availablepriv = ['all', 'contacts', 'contact_blacklist', 'none'];

        if (!availablepriv.includes(text)) {
            return m.reply(`Escolha uma opção válida: ${availablepriv.join('/')}`);
        }

        await client.updateStatusPrivacy(text);
        await m.reply(`Configuração de privacidade do status atualizada para *${text}*.`);
    });

}
