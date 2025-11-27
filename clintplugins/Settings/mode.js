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
          { text: formatStylishReply("Banco de dados indisponível, nenhuma configuração encontrada. Verifique as configurações e tente novamente.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();
      const validModes = ['public', 'private'];

      if (validModes.includes(value)) {
        if (settings.mode === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`O bot já está no modo *${value.toUpperCase()}*. Nenhuma alteração necessária. 😉`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('mode', value);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Modo do bot definido para *${value.toUpperCase()}*! 🔥`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}mode public`, buttonText: { displayText: "PUBLIC 🌐" }, type: 1 },
        { buttonId: `${prefix}mode private`, buttonText: { displayText: "PRIVATE 🔒" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Modo atual: *${settings.mode ? settings.mode.toUpperCase() : 'NÃO DEFINIDO'}*.\n│❒ Use os botões abaixo ou *${prefix}mode public/private* para alterar.`
          ),
          footer: "> Powered by 9bot",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Algo deu errado ao atualizar o modo. Tente novamente em alguns instantes.") },
        { quoted: m, ad: true }
      );
    }
  });
};
