const axios = require('axios');

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (msg) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  if (!text) {
    return m.reply(
      formatStylishReply(
        "Informe *título*, *ideia* e *slogan*.\nFormato: _logogen Título|Ideia|Slogan_\n\nExemplo:\n_logogen 9bot|Assistente para grupos no WhatsApp|Automação simples e poderosa_"
      )
    );
  }

  const [title, idea, slogan] = text.split("|");

  if (!title || !idea || !slogan) {
    return m.reply(
      formatStylishReply(
        "Formato incorreto.\nUse: _logogen Título|Ideia|Slogan_\nExemplo: _logogen 9bot|Bot para comunidades cripto|Automação, notícias e comandos em um só lugar_"
      )
    );
  }

  try {
    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea,
      industry_index: "N",
      industry_index_id: "",
      pagesize: 4,
      session_id: "",
      slogan,
      title,
      whiteEdge: 80,
      width: 400,
    };

    const { data } = await axios.post(
      "https://www.sologo.ai/v1/api/logo/logo_generate",
      payload
    );

    if (!data.data.logoList || data.data.logoList.length === 0) {
      return m.reply(
        formatStylishReply(
          "Não foi possível gerar o logo. Tente novamente em alguns instantes."
        )
      );
    }

    for (const logo of data.data.logoList) {
      await client.sendMessage(
        m.chat,
        {
          image: { url: logo.logo_thumb },
          caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Logo gerado para: *${title.trim()}*
◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m }
      );
    }
  } catch (err) {
    console.error("Logo generation error:", err);
    await m.reply(
      formatStylishReply(
        "Ocorreu um erro ao gerar o logo. Tente novamente em alguns instantes."
      )
    );
  }
};
