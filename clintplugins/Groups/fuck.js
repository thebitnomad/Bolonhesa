const middleware = require("../../utility/botUtil/middleware");

module.exports = {
  name: 'fuck',
  aliases: ['screw', 'bang'],
  description: 'Envia uma reação “tóxica/brincadeira” para um usuário marcado ou citado (apenas interação de grupo).',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m } = context;

      const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
      };

      try {
        console.log(
          formatStylishReply(
            `Comando de interação (fuck) acionado. isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(
              m.mentionedJid
            )}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
          )
        );

        if (!m.mentionedJid || m.mentionedJid.length === 0) {
          if (!m.quoted || !m.quoted.sender) {
            console.error(
              formatStylishReply(
                'Nenhum usuário marcado ou mensagem citada para interação.'
              )
            );
            return m.reply(
              formatStylishReply(
                `Marque alguém ou responda a uma mensagem para usar este comando de interação.\n` +
                `Exemplo: *@usuario* ou responda uma mensagem e use o comando.`
              )
            );
          }
        }

        const targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
        console.log(
          formatStylishReply(
            `Usuário alvo identificado: ${targetUser || 'nenhum'}`
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
              `Não consegui identificar um usuário válido.\n` +
              `Marque ou responda a alguém do grupo para usar este comando.`
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
              `Algo deu errado ao identificar os participantes.\n` +
              `Tente novamente em alguns instantes.`
            )
          );
        }

        const initialMsg = await client.sendMessage(
          m.chat,
          {
            text:
              `◈━━━━━━━━━━━━━━━━◈\n` +
              `│❒ @${senderNumber} resolveu zoar um pouco com @${targetNumber}... 😈\n` +
              `│❒ Calma, é só brincadeira de grupo, nada aqui é sério. 😅\n` +
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
            level: 'Leve',
            description:
              'uma zoeira básica que fez @TARGET dar risada e @SENDER passar recibo na frente de todo mundo. Clima de boa! 😂',
            emoji: '😂',
          },
          {
            level: 'Tensa',
            description:
              'uma resenha pesada que deixou @TARGET sem resposta por alguns segundos. @SENDER mandou bem demais na zoeira! 🔥',
            emoji: '🔥',
          },
          {
            level: 'Lendária',
            description:
              'uma interação tão absurda que o grupo inteiro parou para ler. @SENDER entrou oficialmente para o hall da fama das zoeiras do grupo! 💥',
            emoji: '💥',
          },
        ];

        const intensity =
          intensities[Math.floor(Math.random() * intensities.length)];

        const resultMsg =
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ *RELATÓRIO DE ZOEIRA* ${intensity.emoji}\n` +
          `│\n` +
          `│❒ *Iniciador:* @${senderNumber}\n` +
          `│❒ *Alvo da zoeira:* @${targetNumber}\n` +
          `│❒ *Nível:* ${intensity.level}\n` +
          `│\n` +
          `│❒ *Resumo:* ${intensity.description
            .replace('@TARGET', `@${targetNumber}`)
            .replace('@SENDER', `@${senderNumber}`)}\n` +
          `│\n` +
          `│❒ *AVISO:* Isso é apenas uma brincadeira de interação no grupo.\n` +
          `│❒ Se alguém se sentir incomodado, é só avisar e o comando não será usado.\n` +
          `◈━━━━━━━━━━━━━━━━◈`;

        await client.sendMessage(
          m.chat,
          {
            text: resultMsg,
            mentions: [m.sender, targetUser],
          },
          { quoted: m }
        );

        if (initialMsg && initialMsg.key) {
          try {
            await client.sendMessage(m.chat, { delete: initialMsg.key });
          } catch (deleteError) {
            console.error(
              formatStylishReply(
                `Falha ao apagar mensagem inicial de interação: ${deleteError.message}`
              )
            );
          }
        }
      } catch (error) {
        console.error(
          formatStylishReply(
            `Erro ao executar o comando de interação (fuck): ${error.message}`
          ),
          error
        );
        await m.reply(
          formatStylishReply(
            `Não foi possível completar a interação agora.\n` +
            `Tente novamente em alguns instantes.`
          )
        );
      }
    });
  },
};
