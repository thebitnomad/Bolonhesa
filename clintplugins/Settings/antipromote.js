const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    // Apenas grupos
    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Este comando só pode ser usado em grupos.\n` +
        `│❒ Tente novamente dentro de um grupo. 😄\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antipromote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      // Já está nesse estado
      if (isEnabled === action) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ O Antipromote já está definido como ${value.toUpperCase()} neste grupo.\n` +
          `│❒ Nenhuma alteração foi necessária. 😉\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      // Atualiza configuração
      await updateGroupSetting(jid, 'antipromote', action ? 'true' : 'false');
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Antipromote definido para ${value.toUpperCase()}! 🔥\n` +
        `│❒ A promoção de administradores agora será monitorada pelo bot.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      // Mostra status atual + instrução de uso
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Status do Antipromote: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}\n` +
        `│❒ Use: "${prefix}antipromote on" ou "${prefix}antipromote off" para alterar.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
