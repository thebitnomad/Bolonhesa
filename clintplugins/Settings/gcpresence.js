const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        formatStylishReply(
          'Este comando só pode ser usado em grupos.\n│❒ Use em um grupo para ativar/desativar a presença fake do bot. 😉'
        )
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.gcpresence === true || groupSettings?.gcpresence === 'true';

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
          formatStylishReply(
            `A GCPresence já está ${value.toUpperCase()} neste grupo.\n│❒ Nenhuma alteração necessária. 😉`
          )
        );
      }

      await updateGroupSetting(jid, 'gcpresence', action ? 'true' : 'false');

      return await m.reply(
        formatStylishReply(
          `GCPresence ${value.toUpperCase()} para este grupo.\n` +
          (action
            ? '│❒ O bot agora vai simular digitando e gravando de vez em quando. 🎭'
            : '│❒ O bot não vai mais simular presença neste grupo. 😴')
        )
      );
    } else {
      await m.reply(
        formatStylishReply(
          `Configuração atual da GCPresence neste grupo: ${isEnabled ? 'ON ✅' : 'OFF ❌'}\n` +
          `│❒ Use *${prefix}gcpresence on* ou *${prefix}gcpresence off* para alterar.`
        )
      );
    }
  });
};
