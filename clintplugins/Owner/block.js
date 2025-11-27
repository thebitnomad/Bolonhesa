const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, text } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    // Verifica se tem usuário marcado, respondido ou número no texto
    if (
      !m.quoted &&
      (!m.mentionedJid || m.mentionedJid.length === 0) &&
      !text
    ) {
      return m.reply(
        formatStylishReply(
          "Marque, responda a uma mensagem ou informe um número para bloquear."
        )
      );
    }

    let targetJid;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetJid = m.mentionedJid[0];
    } else if (m.quoted) {
      targetJid = m.quoted.sender;
    } else if (text) {
      const cleanedNumber = text.replace(/[^0-9]/g, '');
      if (!cleanedNumber) {
        return m.reply(
          formatStylishReply(
            "Não consegui identificar um número válido. Tente novamente informando apenas dígitos."
          )
        );
      }
      targetJid = cleanedNumber + '@s.whatsapp.net';
    }

    if (!targetJid) {
      return m.reply(
        formatStylishReply(
          "Não foi possível identificar o usuário. Verifique a marcação ou o número informado."
        )
      );
    }

    const numberView = targetJid.split('@')[0];

    await client.updateBlockStatus(targetJid, 'block');

    await m.reply(
      formatStylishReply(
        `O número *${numberView}* foi bloqueado com sucesso.`
      )
    );
  });
};
