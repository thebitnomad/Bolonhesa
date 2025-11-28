module.exports = async (context) => {
  const { client, m, text, botname, fetchJson } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  const userName = m.pushName || "usuário";

  if (!text || text.trim() === "") {
    return m.reply(
      formatStylishReply(
        `Envie um texto para eu criar o logo *Underwater* para você. 🌊\n\nExemplo: !underwater Seu Texto`
      )
    );
  }

  try {
    const cleanedText = text
      .trim()
      .slice(0, 50)
      .replace(/[^a-zA-Z0-9\s]/g, "");

    if (cleanedText.length < 3) {
      return m.reply(
        formatStylishReply(
          `O texto está muito curto, ${userName}. 😊\nUse pelo menos 3 caracteres para gerar o logo.`
        )
      );
    }

    const encodedText = encodeURIComponent(cleanedText);
    const data = await fetchJson(
      `https://api.giftedtech.web.id/api/ephoto360/underwater?apikey=gifted&text=${encodedText}`
    );

    if (data && data.success && data.result && data.result.image_url) {
      const caption = formatStylishReply(
        `Aqui está o seu logo *Underwater*, ${userName}! 🌊✨\n\n📸 *Texto:* ${cleanedText}\n🔗 *Fonte:* Ephoto360\n🤖 Gerado por *${botname}*`
      );

      await client.sendMessage(
        m.chat,
        {
          image: { url: data.result.image_url },
          caption,
        },
        { quoted: m }
      );
    } else {
      await m.reply(
        formatStylishReply(
          "Não consegui gerar o logo *Underwater* agora.\nA API pode estar indisponível. Tente novamente em alguns instantes. 😔"
        )
      );
    }
  } catch (error) {
    console.error("Underwater API error:", error);
    await m.reply(
      formatStylishReply(
        `Ocorreu um erro ao gerar o logo *Underwater*, ${userName}.\n\nDetalhes: ${error.message}`
      )
    );
  }
};
