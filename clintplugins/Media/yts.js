const yts = require("yt-search");

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  const query = (text || "").trim();

  if (!query) {
    return client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          "Envie um termo para eu pesquisar no YouTube para você. 🔍\n\nExemplo: .yts Alan Walker Alone"
        ),
      },
      { quoted: m, ad: true }
    );
  }

  try {
    const searchResult = await yts(query);

    if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            "Não encontrei resultados no YouTube para essa pesquisa. 😕\nTente outro termo ou ajuste o nome da música/vídeo."
          ),
        },
        { quoted: m, ad: true }
      );
    }

    const videos = searchResult.videos.slice(0, 5);

    let replyText = `🔎 *Resultados da busca no YouTube para:* ${query}\n\n`;

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      replyText += `◈━━━━━━━━━━━━━━━━◈\n`;
      replyText += `🎬 *Título:* ${v.title}\n`;
      replyText += `📎 *Link:* ${v.url}\n`;
      replyText += `👤 *Canal:* ${v.author.name} (${v.author.url})\n`;
      replyText += `👁 *Visualizações:* ${v.views.toLocaleString()}\n`;
      replyText += `⏳ *Duração:* ${v.timestamp}\n`;
      replyText += `📅 *Enviado há:* ${v.ago}\n\n`;
    }

    replyText += `◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m, ad: true }
    );

    await client.sendMessage(
      m.chat,
      {
        image: { url: videos[0].thumbnail },
        caption: formatStylishReply(
          `🎬 Primeiro resultado:\n*${videos[0].title}*\n📎 ${videos[0].url}`
        ),
      },
      { quoted: m }
    );
  } catch (error) {
    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Ocorreu um erro ao buscar no YouTube. 😥\n\nDetalhes: ${error.message}`
        ),
      },
      { quoted: m, ad: true }
    );
  }
};
