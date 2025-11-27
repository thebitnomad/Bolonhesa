const { getSettings, getGroupSettings, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const jid = m.chat;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      if (!jid.endsWith('@g.us')) {
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              'Este comando só funciona em grupos.\n│❒ Use em um grupo para gerenciar os eventos. 😉'
            )
          },
          { quoted: m, ad: true }
        );
      }

      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              'Não foi possível encontrar as configurações no banco de dados.\n│❒ Verifique a configuração do bot antes de tentar novamente.'
            )
          },
          { quoted: m, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      let groupSettings = await getGroupSettings(jid);
      console.log('9bot: Group settings for', jid, ':', groupSettings);

      let isEnabled =
        groupSettings?.events === true || groupSettings?.events === 'true';

      if (value === 'on' || value === 'off') {
        const action = value === 'on';

        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Os eventos já estão ${value.toUpperCase()} neste grupo.\n│❒ Nada para atualizar por aqui. 😉`
              )
            },
            { quoted: m, ad: true }
          );
        }

        await updateGroupSetting(jid, 'events', action);

        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Events ${value.toUpperCase()}! 🔥\n` +
              (action
                ? 'Mensagens de boas-vindas e saída foram ativadas neste grupo. 🎉'
                : 'Eventos desativados. O grupo segue sem notificações de entrada/saída. 😴')
            )
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}events on`, buttonText: { displayText: 'ON ✅' }, type: 1 },
        { buttonId: `${prefix}events off`, buttonText: { displayText: 'OFF ❌' }, type: 1 }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status dos eventos neste grupo: ${isEnabled ? 'ON ✅' : 'OFF ❌'}\n│❒ Escolha uma opção abaixo para alterar.`
          ),
          footer: '> Powered by *9bot*',
          buttons,
          headerType: 1,
          viewOnce: true
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('9bot: Error in events.js:', error.stack);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            'Ocorreu um erro ao atualizar as configurações de eventos.\n│❒ Tente novamente em alguns instantes.'
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
