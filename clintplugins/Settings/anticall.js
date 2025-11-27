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
      const isEnabled = settings.anticall === true;

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Anticall já está definido como ${value.toUpperCase()}. 😉`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('anticall', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Anticall definido para ${value.toUpperCase()} com sucesso. 📞`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}anticall on`, buttonText: { displayText: "ON 🥶" }, type: 1 },
        { buttonId: `${prefix}anticall off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Status do Anticall: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}. Escolha uma opção:`),
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
        { text: formatStylishReply("Ocorreu um erro ao atualizar o Anticall. Tente novamente mais tarde.") },
        { quoted: m, ad: true }
      );
    }
  });
};
