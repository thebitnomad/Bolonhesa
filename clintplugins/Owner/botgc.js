const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m } = context;

    try {
      const allGroups = await client.groupFetchAllParticipating();
      const groups = Object.entries(allGroups).map(entry => entry[1]);
      const groupIds = groups.map(v => v.id);

      await m.reply(
        "◈━━━━━━━━━━━━━━━━◈\n" +
        `│❒ O bot está em ${groupIds.length} grupos.\n` +
        "│❒ Buscando informações e listando todos os JIDs...\n" +
        "◈━━━━━━━━━━━━━━━━◈"
      );

      let resultText = "◈━━━━━━━━━━━━━━━━◈\n" +
                       "│❒ LISTA DE GRUPOS DO BOT\n" +
                       "◈━━━━━━━━━━━━━━━━◈\n\n";

      const promises = groupIds.map(groupId => {
        return new Promise((resolve) => {
          client.groupMetadata(groupId)
            .then(metadata => {
              setTimeout(() => {
                resultText += `🔹 *Nome:* ${metadata.subject}\n`;
                resultText += `👥 *Membros:* ${metadata.participants.length}\n`;
                resultText += `🆔 *JID:* ${groupId}\n`;
                resultText += "◈━━━━━━━━━━━━━━━━◈\n\n";
                resolve();
              }, 500);
            })
            .catch(() => resolve()); // ignora erro de um grupo específico, continua nos demais
        });
      });

      await Promise.all(promises);

      await m.reply(resultText || "◈━━━━━━━━━━━━━━━━◈\n│❒ Não foi possível obter os grupos do bot.\n◈━━━━━━━━━━━━━━━━◈");

    } catch (e) {
      await m.reply(
        "◈━━━━━━━━━━━━━━━━◈\n" +
        "│❒ Ocorreu um erro ao acessar os grupos do bot.\n" +
        `│❒ Detalhes: ${e.message || e}\n` +
        "◈━━━━━━━━━━━━━━━━◈"
      );
    }

  });
};
