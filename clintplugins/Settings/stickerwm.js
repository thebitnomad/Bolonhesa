const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newStickerWM = args.join(" ") || null;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    let settings = await getSettings();

    if (!settings) {
      return await m.reply(formatStylishReply('As configurações não foram encontradas. Verifique o banco de dados.'));
    }

    if (newStickerWM !== null) {
      // Remover marca d’água
      if (newStickerWM === 'null') {
        if (!settings.packname) {
          return await m.reply(formatStylishReply('O bot já está sem marca d’água nas figurinhas.'));
        }
        await updateSetting('packname', '');
        await m.reply(formatStylishReply('A marca d’água das figurinhas foi removida com sucesso.'));
      } else {
        // Definir/alterar marca d’água
        if (settings.packname === newStickerWM) {
          return await m.reply(formatStylishReply(`A marca d’água já está definida como: ${newStickerWM}`));
        }
        await updateSetting('packname', newStickerWM);
        await m.reply(formatStylishReply(`A marca d’água das figurinhas foi atualizada para: ${newStickerWM}`));
      }
    } else {
      await m.reply(
        formatStylishReply(
          `Marca d’água atual: ${settings.packname || 'Nenhuma definida.'}\n\n` +
          `Use '${settings.prefix}stickerwm null' para remover a marca d’água ou ` +
          `'${settings.prefix}stickerwm <texto>' para definir uma nova.`
        )
      );
    }
  });
};
