const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Este comando só pode ser usado em grupos.\n` +
        `│❒ Tente novamente em um grupo. 😊\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antidemote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ O Antidemote já está definido como ${value.toUpperCase()}.\n` +
          `│❒ Nenhuma alteração foi necessária. 😉\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateGroupSetting(jid, 'antidemote', action ? 'true' : 'false');
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Antidemote definido para ${value.toUpperCase()}! 🔥\n` +
        `│❒ Agora as remoções de admin serão monitoradas neste grupo.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Status do Antidemote: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}\n` +
        `│❒ Use "${prefix}antidemote on" ou "${prefix}antidemote off" para alterar.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
