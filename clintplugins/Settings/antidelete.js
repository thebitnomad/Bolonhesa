const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Nenhuma configuração encontrada no banco de dados. Verifique as definições do bot.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.antidelete === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`O Antidelete já está definido como ${value.toUpperCase()}. 😉`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('antidelete', action);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Antidelete ${value.toUpperCase()} atualizado com sucesso! 🔥 ${
                action
                  ? 'Mensagens apagadas serão exibidas novamente no chat. 🦁'
                  : 'Mensagens apagadas não serão mais exibidas. 😴'
              }`
            )
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}antidelete on`, buttonText: { displayText: "ON 🦁" }, type: 1 },
        { buttonId: `${prefix}antidelete off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status do Antidelete: ${settings.antidelete ? 'ON 🦁' : 'OFF 😴'}.\nEscolha uma opção abaixo:`
          ),
          footer: "> Powered by *9bot*",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            "Ocorreu um erro ao atualizar o Antidelete. Verifique o banco de dados ou tente novamente mais tarde."
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
