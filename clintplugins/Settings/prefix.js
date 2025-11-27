const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newPrefix = args[0];

    const settings = await getSettings();

    // Remover prefixo (prefixo "null")
    if (newPrefix === 'null') {
      if (!settings.prefix) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ O bot já está sem prefixo no momento. 😉\n` +
          `│❒ Nada para mudar por aqui.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateSetting('prefix', '');
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Prefixo removido com sucesso! 🔥\n` +
        `│❒ Agora o bot funciona sem prefixo.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    // Definir novo prefixo
    if (newPrefix) {
      if (settings.prefix === newPrefix) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ O prefixo já é "${newPrefix}". 😊\n` +
          `│❒ Se quiser, escolha um símbolo diferente.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateSetting('prefix', newPrefix);
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Novo prefixo definido como: "${newPrefix}" 🔥\n` +
        `│❒ Use esse símbolo antes dos comandos a partir de agora.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    // Exibir prefixo atual e instruções
    const currentPrefix = settings.prefix || '';
    await m.reply(
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ Prefixo atual: ${currentPrefix ? `"${currentPrefix}"` : 'sem prefixo definido.'}\n` +
      `│❒ Use "${currentPrefix || '.'}prefix null" para remover o prefixo,\n` +
      `│❒ ou "${currentPrefix || '.'}prefix <símbolo>" para definir um novo.\n` +
      `┗━━━━━━━━━━━━━━━┛`
    );
  });
};
