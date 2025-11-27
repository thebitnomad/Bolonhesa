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

        if (settings.autobio === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `O Autobio já está definido como ${value.toUpperCase()}. 😉`
              )
            },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autobio', action);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Autobio definido para ${value.toUpperCase()} com sucesso! 🔥\n` +
              (action
                ? "O status do bot será atualizado automaticamente a cada 10 segundos. 🦁"
                : "O status automático foi desativado. 😴")
            )
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autobio on`, buttonText: { displayText: "ON 🦁" }, type: 1 },
        { buttonId: `${prefix}autobio off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status do Autobio: ${settings.autobio ? 'ON 🦁' : 'OFF 😴'}\n` +
            `│❒ Escolha uma opção abaixo para ativar ou desativar o status automático.`
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
            "Ocorreu um erro ao atualizar o Autobio.\n│❒ Verifique o banco de dados ou tente novamente em alguns instantes."
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
