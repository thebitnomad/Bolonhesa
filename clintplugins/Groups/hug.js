module.exports = {
  name: 'hug',
  aliases: ['cuddle', 'embrace'],
  description: 'Envia um “abraço” de interação para um usuário marcado ou citado (apenas zoeira no grupo).',
  run: async (context) => {
    const { client, m } = context;

    const formatStylishReply = (message) => {
      const lines = String(message || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const body = lines.map((l) => `│❒ ${l}`).join('\n');
      return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
      console.log(
        formatStylishReply(
          `Comando de abraço iniciado.\n` +
          `isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
        )
      );

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error(
            formatStylishReply(
              'Nenhum usuário marcado ou mensagem citada para o comando de abraço.'
            )
          );
          return m.reply(
            formatStylishReply(
              `Ei, coração mole! 💞\n` +
              `Marque alguém ou responda a uma mensagem para mandar um abraço.\n` +
              `Sem alvo, sem abraço. 😅`
            )
          );
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(
        formatStylishReply(
          `Usuário alvo do abraço: ${targetUser || 'nenhum'}`
        )
      );

      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(
          formatStylishReply(
            `Usuário alvo inválido: ${JSON.stringify(targetUser)}`
          )
        );
        return m.reply(
          formatStylishReply(
            `Não consegui reconhecer o usuário.\n` +
            `Marque ou responda alguém real do grupo para mandar o abraço. 😊`
          )
        );
      }

      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];
      if (!targetNumber || !senderNumber) {
        console.error(
          formatStylishReply(
            `Falha ao extrair números: target=${targetUser}, sender=${m.sender}`
          )
        );
        return m.reply(
          formatStylishReply(
            `Algo deu errado ao identificar quem vai abraçar quem.\n` +
            `Tente de novo em alguns instantes.`
          )
        );
      }

      const huggingMsg = await client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ @${senderNumber} está se aproximando para dar um abraço em @${targetNumber}... 🤗\n` +
            `│❒ Calma, é só zoeira de grupo, ninguém está sendo forçado a nada. 😅\n` +
            `◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      const intensities = [
        {
          level: 'Constrangido',
          description:
            'um abraço meio estranho, todo sem jeito, que deixou @TARGET sem saber se ria ou abraçava de volta. @SENDER claramente tentou, e isso já vale ponto. 😅',
          emoji: '😅',
        },
        {
          level: 'Aconchegante',
          description:
            'um abraço bem confortável, daquele que deixa @TARGET mais calmo. @SENDER mandou bem e espalhou um pouco de carinho no grupo. 🤗',
          emoji: '🤗',
        },
        {
          level: 'Quebra-costela',
          description:
            'um abraço tão apertado que quase tirou o ar de @TARGET. @SENDER mostrou força e carinho na mesma medida. 💪',
          emoji: '💪',
        },
      ];
      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const verdictText = intensity.description
        .replace('@TARGET', `@${targetNumber}`)
        .replace('@SENDER', `@${senderNumber}`);

      const resultMsg =
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ *RELATÓRIO DE ABRAÇO* ${intensity.emoji}\n` +
        `│\n` +
        `│❒ *Quem abraçou:* @${senderNumber}\n` +
        `│❒ *Quem recebeu:* @${targetNumber}\n` +
        `│❒ *Intensidade:* ${intensity.level}\n` +
        `│\n` +
        `│❒ *Resumo:* ${verdictText}\n` +
        `│\n` +
        `│❒ *AVISO:* Este comando é apenas uma brincadeira de interação no grupo.\n` +
        `│❒ Se alguém se sentir desconfortável, é só avisar que a galera pega mais leve. 💛\n` +
        `◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      if (huggingMsg && huggingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: huggingMsg.key });
        } catch (deleteError) {
          console.error(
            formatStylishReply(
              `Falha ao tentar apagar a mensagem inicial do abraço: ${deleteError.message}`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao executar o comando de abraço: ${error.message}`
        ),
        error
      );
      await m.reply(
        formatStylishReply(
          `Não consegui completar o comando de abraço agora.\n` +
          `Tente novamente em alguns instantes.`
        )
      );
    }
  },
};
