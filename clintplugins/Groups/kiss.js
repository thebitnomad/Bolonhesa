module.exports = {
  name: 'kiss',
  aliases: ['smooch', 'peck'],
  description: 'Envia um “beijo” de interação para um usuário marcado ou citado (zoeira de grupo com aviso).',
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
          `Comando de beijo iniciado.\n` +
          `isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
        )
      );

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error(
            formatStylishReply(
              'Nenhum usuário marcado ou mensagem citada para o comando de beijo.'
            )
          );
          return m.reply(
            formatStylishReply(
              `Ei, romântico perdido! 💋\n` +
              `Marque alguém ou responda a uma mensagem para mandar um beijo.\n` +
              `Sem alvo, não tem beijo. 😅`
            )
          );
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(
        formatStylishReply(
          `Usuário alvo do beijo: ${targetUser || 'nenhum'}`
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
            `Marque ou responda alguém real do grupo para mandar o beijo. 😉`
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
            `Algo deu errado ao identificar quem está mandando o beijo.\n` +
            `Tente novamente em alguns instantes.`
          )
        );
      }

      const kissingMsg = await client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ @${senderNumber} está se aproximando para dar um beijo em @${targetNumber}... 💋\n` +
            `│❒ Calma, é só brincadeira de grupo, nada aqui é sério. 😄\n` +
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
          level: 'Constrangedor',
          description:
            'um beijo todo sem jeito que deixou @TARGET sem saber se ria ou fingia que nada aconteceu. @SENDER claramente tentou, e isso já vale história pro grupo. 😖',
          emoji: '😖',
        },
        {
          level: 'Doce',
          description:
            'um beijo leve e carinhoso que deixou @TARGET um pouco corado. @SENDER mandou bem, mas sem subir pra cabeça, hein. 😘',
          emoji: '😘',
        },
        {
          level: 'Intenso',
          description:
            'um beijo tão intenso que deixou @TARGET sem palavras por alguns segundos. @SENDER virou oficialmente o(a) romântico(a) do grupo. 🔥💋',
          emoji: '🔥💋',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const verdictText = intensity.description
        .replace('@TARGET', `@${targetNumber}`)
        .replace('@SENDER', `@${senderNumber}`);

      const resultMsg =
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ *RELATÓRIO DE BEIJO* ${intensity.emoji}\n` +
        `│\n` +
        `│❒ *Quem beijou:* @${senderNumber}\n` +
        `│❒ *Quem recebeu:* @${targetNumber}\n` +
        `│❒ *Intensidade:* ${intensity.level}\n` +
        `│\n` +
        `│❒ *Resumo:* ${verdictText}\n` +
        `│\n` +
        `│❒ *AVISO:* Este comando é apenas uma brincadeira de interação no grupo.\n` +
        `│❒ Se alguém se sentir desconfortável, é só avisar que a zoeira diminui ou o comando não é mais usado. 💛\n` +
        `◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      if (kissingMsg && kissingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: kissingMsg.key });
        } catch (deleteError) {
          console.error(
            formatStylishReply(
              `Falha ao tentar apagar a mensagem inicial do beijo: ${deleteError.message}`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao executar o comando de beijo: ${error.message}`
        ),
        error
      );
      await m.reply(
        formatStylishReply(
          `Não foi possível completar o comando de beijo agora.\n` +
          `Tente novamente em alguns instantes.`
        )
      );
    }
  },
};
