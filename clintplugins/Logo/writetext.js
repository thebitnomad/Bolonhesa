module.exports = async (context) => {
  const { client, m, text, botname, fetchJson } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  const userName = m.pushName || "usuário";

  // Verificação do texto enviado
  if (!text || text.trim() === "") {
    return m.reply(
      formatStylishReply(
        `Envie um texto para gerar o logo *Underwater* 🌊\n\nExemplo: !underwater Seu Texto`
      )
    );
  }

  try {
    // Limpeza e segurança do texto
    const cleanedText = text
      .trim()
      .slice(0, 50)
      .replace(/[^a-zA-Z0-9\s]/g, "");

    if (cleanedText.length < 3) {
      return m.reply(
        formatStylishReply(
          `O texto está muito curto, ${userName}. 😊\nUse pelo menos 3 caracteres.`
        )
      );
    }

    const encodedText = encodeURIComponent(cleanedText);

    // Chamada à API
    const data = await fetchJson(
      `https://api.giftedtech.web.id/api/ephoto360/underwater?apikey=gifted&text=${encodedText}`
    );

    // Validação do retorno
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
          "Não consegui gerar o logo *Underwater* no momento.\nA API pode estar indisponível. Tente novamente mais tarde. 😔"
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
