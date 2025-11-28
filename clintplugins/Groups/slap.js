module.exports = {
  name: 'slap',
  aliases: ['smack', 'hit'],
  description: 'Dá um “tapa” de interação em um usuário marcado ou citado (zoeira de grupo com aviso).',
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
      // Log de contexto para depuração
      console.log(
        formatStylishReply(
          `Comando de tapa iniciado.\n` +
          `isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
        )
      );

      // Verifica se alguém foi marcado ou citado
      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error(
            formatStylishReply(
              'Nenhum usuário marcado ou mensagem citada para o comando de tapa.'
            )
          );
          return m.reply(
            formatStylishReply(
              `Ei, estrategista do caos! 😅\n` +
              `Marque alguém ou responda a uma mensagem para usar o comando de tapa.\n` +
              `Sem alvo, não tem como começar a zoeira.`
            )
          );
        }
      }

      // Define o alvo (marcado ou citado)
      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(
        formatStylishReply(
          `Usuário alvo do tapa: ${targetUser || 'nenhum'}`
        )
      );

      // Valida o alvo
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
            `Marque ou responda alguém real do grupo para usar o comando.`
          )
        );
      }

      // Extrai números
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
            `Algo deu errado ao identificar quem bate e quem “apanha” na zoeira.\n` +
            `Tente novamente em alguns instantes.`
          )
        );
      }

      // Mensagem inicial com suspense
      const slappingMsg = await client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ @${senderNumber} está se preparando para mandar um tapa em @${targetNumber}... 🖐️\n` +
            `│❒ Calma, é só zoeira de grupo, ninguém está machucando ninguém. 😄\n` +
            `◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Delay dramático entre 1–3 segundos
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Níveis de “intensidade” da zoeira
      const intensities = [
        {
          level: 'Fraco',
          description:
            'um tapinha tão leve que @TARGET quase nem sentiu. @SENDER, o grupo esperava mais dessa performance. 😴',
          emoji: '😴',
        },
        {
          level: 'Moderado',
          description:
            'um tapa bem dado que deixou a bochecha de @TARGET vermelha por alguns segundos. @SENDER mostrou que não está de brincadeira. 🖐️',
          emoji: '🖐️',
        },
        {
          level: 'Épico',
          description:
            'um tapa tão dramático que o grupo inteiro parou para olhar. @SENDER virou lenda oficial das zoeiras por alguns minutos. 💥',
          emoji: '💥',
        },
      ];
      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      // Monta o texto final com substituições
      const verdictText = intensity.description
        .replace('@TARGET', `@${targetNumber}`)
        .replace('@SENDER', `@${senderNumber}`);

      const resultMsg =
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ *RELATÓRIO DE TAPA* ${intensity.emoji}\n` +
        `│\n` +
        `│❒ *Quem deu o tapa:* @${senderNumber}\n` +
        `│❒ *Quem levou na zoeira:* @${targetNumber}\n` +
        `│❒ *Intensidade:* ${intensity.level}\n` +
        `│\n` +
        `│❒ *Resumo:* ${verdictText}\n` +
        `│\n` +
        `│❒ *AVISO:* Este comando é apenas uma brincadeira de interação no grupo.\n` +
        `│❒ Nada aqui é real, é tudo no clima de zoeira. Se alguém se sentir desconfortável, é só avisar que a gente pega leve. 💛\n` +
        `◈━━━━━━━━━━━━━━━━◈`;

      // Envia o resultado final
      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Tenta apagar a mensagem inicial para deixar o chat mais limpo
      if (slappingMsg && slappingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: slappingMsg.key });
        } catch (deleteError) {
          console.error(
            formatStylishReply(
              `Falha ao apagar a mensagem inicial do tapa: ${deleteError.message}`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao executar o comando de tapa: ${error.message}`
        ),
        error
      );
      await m.reply(
        formatStylishReply(
          `Não foi possível completar o comando de tapa agora.\n` +
          `Tente novamente em alguns instantes.`
        )
      );
    }
  },
};
