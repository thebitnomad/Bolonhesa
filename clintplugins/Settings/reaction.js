const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newEmoji = args[0];

    const settings = await getSettings();
    const prefix = settings.prefix;
    const currentEmoji = settings.reactEmoji || 'Nenhum emoji configurado.';

    if (newEmoji) {
      // RANDOM MODE
      if (newEmoji === 'random') {
        if (currentEmoji === 'random') {
          return await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ O modo *random* já está ativado. 😊\n` +
            `│❒ Reagindo com emojis aleatórios como sempre!\n` +
            `┗━━━━━━━━━━━━━━━┛`
          );
        }

        await updateSetting('reactEmoji', 'random');
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Modo *random* ativado! 🔥\n` +
          `│❒ Agora cada reação será uma surpresa. 😄\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      // CUSTOM EMOJI
      if (currentEmoji === newEmoji) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Este emoji já está configurado como padrão. 😊\n` +
          `│❒ Caso queira trocar, escolha outro.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateSetting('reactEmoji', newEmoji);
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Emoji de reação atualizado para ${newEmoji}! 🔥\n` +
        `│❒ Agora todas as reações serão com este emoji.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    // SHOW CURRENT CONFIG
    await m.reply(
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ Emoji atual de reação: ${currentEmoji}\n` +
      `│❒ Use: \n` +
      `│❒ ➤ *${prefix}reaction random* para modo aleatório\n` +
      `│❒ ➤ *${prefix}reaction <emoji>* para definir um emoji específico\n` +
      `┗━━━━━━━━━━━━━━━┛`
    );
  });
};
