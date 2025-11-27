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
          {
            text: formatStylishReply(
              "Não foi possível encontrar as configurações no banco de dados.\n│❒ Verifique as definições do bot antes de tentar novamente."
            )
          },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';

        if (settings.autolike === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `O Autolike já está definido como ${value.toUpperCase()}. 😉`
              )
            },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autolike', action);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Autolike definido para ${value.toUpperCase()} com sucesso! 🔥\n` +
              (action
                ? "O bot vai reagir automaticamente aos status com curtidas. 💬"
                : "As reações automáticas aos status foram desativadas. 😴")
            )
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autolike on`, buttonText: { displayText: "ON 🥶" }, type: 1 },
        { buttonId: `${prefix}autolike off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status do Autolike: ${settings.autolike ? 'ON 🥶' : 'OFF 😴'}\n` +
            `│❒ Escolha uma opção abaixo para ativar ou desativar as reações automáticas de status.`
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
            "Ocorreu um erro ao atualizar o Autolike.\n│❒ Verifique o banco de dados ou tente novamente em alguns instantes."
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
