module.exports = {
  name: 'del',
  aliases: ['delete', 'd'],
  description: 'Apaga a mensagem respondida ou citada com cuidado',
  run: async (context) => {
    const { client, m, botname } = context;

    if (!botname) {
      console.error(`Botname not set in context.`);
      return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Ops! Nome do bot não configurado. Avise o suporte para ajustar.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    try {
      // Validate m.sender
      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        console.error(`Invalid m.sender: ${JSON.stringify(m.sender)}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui ler seu número. Tente novamente ou consulte https://github.com/xhclintohn/Toxic-MD para ajuda.\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const userNumber = m.sender.split('@')[0];
      const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
      const isGroup = m.key.remoteJid.endsWith('@g.us');

      // Check for replied-to or quoted message
      let deleteKey = null;
      let quotedSender = null;

      // Try replied-to message (contextInfo)
      if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = m.message.extendedTextMessage.contextInfo;
        if (contextInfo.stanzaId && contextInfo.participant) {
          deleteKey = {
            remoteJid: contextInfo.remoteJid || m.key.remoteJid,
            fromMe: contextInfo.participant === botJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
          };
          quotedSender = contextInfo.participant;
        }
      }

      // Fallback to quoted message (m.quoted)
      if (!deleteKey && m.quoted && m.quoted.message) {
        deleteKey = {
          remoteJid: m.quoted.key.remoteJid,
          fromMe: m.quoted.fromMe,
          id: m.quoted.key.id,
          participant: m.quoted.key.participant || m.quoted.sender
        };
        quotedSender = m.quoted.sender;
      }

      // If no replied-to or quoted message
      if (!deleteKey) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Responda ou cite uma mensagem para apagá-la. 😇\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // If in group, check bot admin status for non-bot messages
      if (isGroup && !deleteKey.fromMe) {
        const groupMetadata = await client.groupMetadata(m.key.remoteJid);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin != null).map(p => p.id);
        const isBotAdmin = groupAdmins.includes(botJid);

        if (!isBotAdmin) {
          return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Preciso ser admin para apagar a mensagem de @${quotedSender.split('@')[0]}.\n│❒ Promova o bot, @${userNumber}, e tente novamente.\n◈━━━━━━━━━━━━━━━━◈`, {
            mentions: [quotedSender, m.sender]
          });
        }
      }

      // Delete the message
      await client.sendMessage(m.key.remoteJid, { delete: deleteKey });

      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Mensagem apagada com sucesso, @${userNumber}! 🗑️\n│❒ Feito por *${botname}*\n◈━━━━━━━━━━━━━━━━◈`, {
        mentions: [m.sender]
      });

    } catch (error) {
      console.error(`Del command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui apagar a mensagem, @${m.sender.split('@')[0]}.\n│❒ Tente novamente e consulte https://github.com/xhclintohn/Toxic-MD se precisar.\n◈━━━━━━━━━━━━━━━━◈`, {
        mentions: [m.sender]
      });
    }
  }
};