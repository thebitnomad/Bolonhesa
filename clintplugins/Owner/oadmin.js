const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

const formatReply = (msg) =>
  `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, isBotAdmin } = context;

    // Verifica se é grupo
    if (!m.isGroup) {
      return m.reply(formatReply("Este comando só pode ser usado em grupos."));
    }

    // Verifica se o bot é admin
    if (!isBotAdmin) {
      return m.reply(formatReply("Preciso de privilégios de administrador para continuar."));
    }

    try {
      await client.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
      await m.reply(formatReply("Você foi promovido(a) no grupo. 🥇"));
    } catch (error) {
      console.error("Promote error:", error);
      await m.reply(formatReply(`Não foi possível realizar a promoção.\nDetalhes: ${error.message}`));
    }
  });
};
