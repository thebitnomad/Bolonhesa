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
              'Não foi possível encontrar as configurações no banco de dados.\n│❒ Verifique as definições do bot antes de tentar novamente. 😴'
            )
          },
          { quoted: m, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      const validOptions = ['on', 'off'];

      if (validOptions.includes(value)) {
        const newState = value === 'on';

        if (settings.autoview === newState) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `O Autoview já está em ${value.toUpperCase()} neste momento. 😉`
              )
            },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autoview', newState);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Autoview definido para *${value.toUpperCase()}* com sucesso! 🔥\n` +
              (newState
                ? 'Vou visualizar automaticamente os status, tudo sob controle. 😈'
                : 'Visualização automática de status desativada. 😴')
            )
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autoview on`, buttonText: { displayText: 'ON ✅' }, type: 1 },
        { buttonId: `${prefix}autoview off`, buttonText: { displayText: 'OFF ❌' }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status atual do Autoview: ${settings.autoview ? 'ON ✅ (visualizando todos os status)' : 'OFF ❌ (ignorando status)'}\n` +
            `│❒ Escolha uma opção abaixo para alterar o comportamento do bot. 😄`
          ),
          footer: '> Powered by *9bot*',
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
            'Ocorreu um erro ao atualizar o Autoview.\n│❒ Verifique o banco de dados ou tente novamente em alguns instantes. 😴'
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
