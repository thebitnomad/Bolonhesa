const middleware = require("../../utility/botUtil/middleware");

module.exports = async (context) => {
  await middleware(context, async () => {
    const {
      client,
      m,
      args,
      participants,
      mycode
    } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    // Filtra participantes que não são admin e cujo código não começa com o código padrão (mycode)
    const filteredMembers = participants
      .filter((p) => !p.admin)
      .map((p) => p.id)
      .filter(
        (jid) =>
          !jid.startsWith(mycode) &&
          jid !== client.decodeJid(client.user.id)
      );

    // Sem argumentos: apenas listar
    if (!args || !args[0]) {
      if (filteredMembers.length === 0) {
        return m.reply(
          formatStylishReply(
            `Nenhum número com código diferente de *${mycode}* foi encontrado neste grupo.`
          )
        );
      }

      let message =
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Foram encontrados *${filteredMembers.length}* números cujo código não corresponde ao padrão *${mycode}*.\n` +
        `│❒ Lista de membros identificados:\n`;

      for (const jid of filteredMembers) {
        message += `│❒ 🚫 @${jid.split("@")[0]}\n`;
      }

      message +=
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Para remover todos esses membros, envie: *.foreigners -x*\n` +
        `◈━━━━━━━━━━━━━━━━◈`;

      return client.sendMessage(
        m.chat,
        {
          text: message,
          mentions: filteredMembers
        },
        { quoted: m }
      );
    }

    // Com argumento "-x": remover
    if (args[0] === "-x") {
      if (filteredMembers.length === 0) {
        return m.reply(
          formatStylishReply(
            `Não há membros com código diferente de *${mycode}* para serem removidos.`
          )
        );
      }

      setTimeout(() => {
        client.sendMessage(
          m.chat,
          {
            text:
              `◈━━━━━━━━━━━━━━━━◈\n` +
              `│❒ O bot irá remover *${filteredMembers.length}* membros cujo código é diferente de *${mycode}* deste grupo.\n` +
              `│❒ Esta ação será executada em instantes.\n` +
              `◈━━━━━━━━━━━━━━━━◈`
          },
          { quoted: m }
        );

        setTimeout(() => {
          client.groupParticipantsUpdate(m.chat, filteredMembers, "remove");

          setTimeout(() => {
            m.reply(
              formatStylishReply(
                `Pronto. Todos os membros com código diferente de *${mycode}* foram removidos do grupo.`
              )
            );
          }, 1000);
        }, 1000);
      }, 1000);
    }
  });
};
