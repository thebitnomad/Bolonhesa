module.exports = {
  name: 'gaycheck',
  aliases: ['gaymeter', 'gcheck', 'howgay'],
  description: 'Checks gay percentage with playful, respectful messages',
  run: async (context) => {
    const { client, m } = context;

    try {
      let targetUser = null;
      let targetNumber = null;

      console.log(`Message context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);

      if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        console.log(`Tagged JIDs: ${JSON.stringify(m.mentionedJid)}`);
        targetUser = m.mentionedJid[0];
      } else if (m.quoted && m.quoted.sender) {
        console.log(`Quoted sender: ${m.quoted.sender}`);
        targetUser = m.quoted.sender;
      } else {
        console.log(`No tags or quoted message, using sender: ${m.sender}`);
        targetUser = m.sender;
      }

      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Marque alguém ou responda a uma mensagem para analisar.\n│❒ Tudo bem-humorado e sem ofensas!\n◈━━━━━━━━━━━━━━━━◈`);
      }

      targetNumber = targetUser.split('@')[0];
      if (!targetNumber) {
        console.error(`Failed to extract target number from JID: ${targetUser}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui ler o número deste perfil.\n│❒ Tente novamente marcando a pessoa.\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const checkingMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Analisando as vibes arco-íris de @${targetNumber}... 🌈\n│❒ Tudo em tom de brincadeira, segura aí!\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      const percentage = Math.floor(Math.random() * 101);

      const ranges = [
        { max: 10, roast: "Radar quase zerado: vibe bem hétero por aqui.", emoji: "📏" },
        { max: 25, roast: "Sinal leve de curiosidade — amigo de todos e tranquilo.", emoji: "🙂" },
        { max: 40, roast: "Vibe colorida surgindo! O arco-íris está no horizonte.", emoji: "🌈" },
        { max: 55, roast: "Equilíbrio total! Metade arco-íris, metade neutral. Tudo junto e misturado.", emoji: "⚖️" },
        { max: 70, roast: "Brilho garantido: o estilo já entrega muita cor e simpatia.", emoji: "✨" },
        { max: 85, roast: "Modo festa ativado! Energia cheia de orgulho e alegria.", emoji: "🎉" },
        { max: 100, roast: "Arco-íris máximo! Você espalha representatividade por onde passa.", emoji: "🌈🎉" },
      ];

      const match = ranges.find((range) => percentage <= range.max) || ranges[ranges.length - 1];

      const resultMsg = `◈━━━━━━━━━━━━━━━━◈
*GAY METER* ${match.emoji}

*Alvo:* @${targetNumber}
*Porcentagem:* ${percentage}%

*Resumo:* ${match.roast}

*Nota:* Resultado aleatório e feito só para diversão. Respeito sempre! 😄
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      if (checkingMsg && checkingMsg.key) {
        try {
          await client.sendMessage(m.chat, {
            delete: checkingMsg.key,
          });
        } catch (deleteError) {
          console.error(`Failed to delete checking message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Gaycheck command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui calcular agora.\n│❒ Tente novamente em instantes.\n◈━━━━━━━━━━━━━━━━◈`);
    }
  },
};
