module.exports = {
  name: 'gaycheck',
  aliases: ['gaymeter', 'gcheck', 'howgay'],
  description: 'Mostra o nível de energia arco-íris de alguém',
  run: async (context) => {
    const { client, m } = context;

    try {
      let targetUser = null;
      let targetNumber = null;

      console.log(
        `Message context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(
          m.mentionedJid
        )}, quotedSender=${m.quoted?.sender || 'none'}`
      );

      // Se for grupo e tiver @marcação, usa o marcado
      if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        console.log(`Tagged JIDs: ${JSON.stringify(m.mentionedJid)}`);
        targetUser = m.mentionedJid[0];
      } else if (m.quoted && m.quoted.sender) {
        // Senão, usa o autor da mensagem respondida
        console.log(`Quoted sender: ${m.quoted.sender}`);
        targetUser = m.quoted.sender;
      } else {
        // Senão, usa o próprio autor do comando
        console.log(`No tags or quoted message, using sender: ${m.sender}`);
        targetUser = m.sender;
      }

      // Validar alvo
      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Quem eu devo analisar, hein? Marque alguém ou responda a uma mensagem pra rodar o medidor. 😏
◈━━━━━━━━━━━━━━━━◈`
        );
      }

      // Extrair número
      targetNumber = targetUser.split('@')[0];
      if (!targetNumber) {
        console.error(`Failed to extract target number from JID: ${targetUser}`);
        return m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui identificar o alvo. Tenta de novo respondendo a uma mensagem ou marcando a pessoa.
◈━━━━━━━━━━━━━━━━◈`
        );
      }

      // Mensagem inicial
      const checkingMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈
│❒ Escaneando a aura arco-íris de @${targetNumber}… 🌈
│❒ Segura a emoção, isso é totalmente “científico”. 😌
◈━━━━━━━━━━━━━━━━◈`,
          mentions: [targetUser]
        },
        { quoted: m }
      );

      // Draminha
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      const percentage = Math.floor(Math.random() * 101);

      let roast;
      let emoji;

      // Faixas de resultado – zoeira leve, sem ofensa à orientação
      if (percentage === 0) {
        roast =
          'Zero brilho detectado. Tá vivendo em modo cinza, bora colocar um pouco de cor nessa vida aí. 😌';
        emoji = '⚪';
      } else if (percentage <= 10) {
        roast =
          'Tem uma faísca discreta aí. Finge que é sério, mas o coração vibra quando vê um look bem montado. 😉';
        emoji = '✨';
      } else if (percentage <= 20) {
        roast =
          'Nivel “eu respeito, mas…”. Já deu aquele sorriso escondido vendo casal fofinho na rua. 😏';
        emoji = '😊';
      } else if (percentage <= 30) {
        roast =
          'Tem um pezinho no arco-íris. Fala que é só “boa energia”, mas a playlist entrega tudo. 🎧🌈';
        emoji = '🎶';
      } else if (percentage <= 40) {
        roast =
          'Modo “suspeito porém fofo”. Dá like em meme gay e finge que caiu sem querer. 👀';
        emoji = '👀';
      } else if (percentage <= 50) {
        roast =
          'Equilíbrio perfeito: metade caos, metade arco-íris. O multiverso da personalidade. ⚖️';
        emoji = '⚖️';
      } else if (percentage <= 60) {
        roast =
          'A energia tá forte. Se tivesse parada de orgulho na esquina, você já tava lá tirando foto. 📸';
        emoji = '📸';
      } else if (percentage <= 70) {
        roast =
          'Brilho considerável detectado. Andar contigo é tipo andar com filtro de glitter ativado. ✨';
        emoji = '💫';
      } else if (percentage <= 80) {
        roast =
          'Nível “ícone da novela”. Dramático, expressivo e cheio de trejeito estiloso. O protagonismo é seu. 🎭';
        emoji = '🎭';
      } else if (percentage <= 90) {
        roast =
          'Você não entra num ambiente, você ESTREIA. Presença de diva, carisma de palco e alma de glitter. 💅';
        emoji = '👑';
      } else if (percentage <= 98) {
        roast =
          'Energia arco-íris no talo. Se tivesse um medidor oficial, você já estaria no hall da fama. 🌈';
        emoji = '🌈🔥';
      } else {
        roast =
          'Você é praticamente a personificação da parada inteira. Se o arco-íris tivesse CPF, ia ser o seu. 🌈👑';
        emoji = '🌌👑';
      }

      // Complemento de zoeira geral (sem atingir orientação)
      let extra;
      if (percentage < 20) {
        extra =
          ' Nível low profile: dá pra começar com um emoji colorido no status, vai com calma. 😌';
      } else if (percentage > 80) {
        extra =
          ' Aqui é over delivery de carisma: todo grupo precisa de alguém com essa energia. ✨';
      } else {
        const extras = [
          ' Você claramente é o caos organizado do rolê. 🤝',
          ' Sua energia grita “eu tô bem, mas poderia estar melhor com um pouco de drama”. 😌',
          ' Dá pra sentir daqui o potencial de figurão do grupo. 😎',
          ' Você é a prova viva de que a vida sem cor é perda de tempo. 🖍️',
          ' Energia de protagonista que roubou a cena sem perceber. 🎬',
          ' Se tivesse ranking de presença, você tava no top 3 fácil. 📊',
          ' Dá pra ver que o espelho da sua casa já ouviu muitos desabafos e ensaios. 🪞',
          ' O algoritmo das redes sociais já entendeu seu gosto faz tempo. 📲'
        ];
        extra = ' ' + extras[Math.floor(Math.random() * extras.length)];
      }

      const resultMsg = `◈━━━━━━━━━━━━━━━━◈
│❒ *GAY METER – RESULTADO* ${emoji}
│❒
│❒ *Alvo:* @${targetNumber}
│❒ *Nível de energia arco-íris:* ${percentage}%
│❒
│❒ *Veredito:* ${roast}${extra}
│❒
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [targetUser]
        },
        { quoted: m }
      );

      // Tentar apagar a mensagem de "checando..."
      if (checkingMsg && checkingMsg.key) {
        try {
          await client.sendMessage(m.chat, {
            delete: checkingMsg.key
          });
        } catch (deleteError) {
          console.error(
            `Failed to delete checking message: ${deleteError.stack}`
          );
        }
      }
    } catch (error) {
      console.error(`Gaycheck command error: ${error.stack}`);
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Deu ruim aqui no medidor, mas relaxa: o bug é do código, não seu. 😂
◈━━━━━━━━━━━━━━━━◈`
      );
    }
  }
};
