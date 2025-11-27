const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

const formatReply = (msg) =>
  `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, participants, botname } = context;

    // Verifica botname
    if (!botname) {
      console.error(`Botname not set.`);
      return m.reply(formatReply("Bot sem identificação. Verifique a configuração do botname."));
    }

    // Verifica se é grupo
    if (!m.isGroup) {
      return m.reply(formatReply("Este comando só pode ser usado em grupos."));
    }

    try {
      const maxMentions = 50;
      const mentions = participants.slice(0, maxMentions).map(a => a.id);

      await client.sendMessage(
        m.chat,
        {
          text: formatReply(
            `${botname} está saindo do grupo.\n` +
            `Foi um prazer ajudar! ${mentions.length < participants.length ? '\nObs: muitos membros para mencionar.' : ''}`
          ),
          mentions
        },
        { quoted: m }
      );

      console.log(`[LEAVE-DEBUG] Leaving group ${m.chat}, mentioned ${mentions.length} participants`);

      await client.groupLeave(m.chat);

    } catch (error) {
      console.error(`[LEAVE-ERROR] Could not leave group: ${error.stack}`);
      await m.reply(
        formatReply(
          `Não consegui sair do grupo.\n` +
          `Detalhes: ${error.message}\n` +
          `Tente novamente mais tarde.`
        )
      );
    }
  });
};
