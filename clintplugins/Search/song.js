module.exports = async (context) => {
  const { client, m, text } = context;
  const yts = require("yt-search");

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
  };

  try {
    // Sem texto
    if (!text) {
      return m.reply(
        formatStylishReply(
          "Me diga o nome da música para eu buscar pra você. 🎵"
        )
      );
    }

    // Texto muito longo
    if (text.length > 100) {
      return m.reply(
        formatStylishReply(
          "Esse título está um pouco longo demais. Tente usar até 100 caracteres para uma busca mais precisa."
        )
      );
    }

    // Buscar no YouTube
    const { videos } = await yts(text);
    if (!videos || videos.length === 0) {
      return m.reply(
        formatStylishReply(
          "Não encontrei nenhuma música com esse nome. Tente outro termo ou revise a grafia. 🎧"
        )
      );
    }

    const song = videos[0];
    const title = song.title;
    const artist = song.author?.name || "Unknown Artist";
    const views = song.views?.toLocaleString() || "Unknown";
    const duration = song.duration?.toString() || "Unknown";
    const uploaded = song.ago || "Unknown";
    const thumbnail = song.thumbnail || "";
    const videoUrl = song.url;
    const callerName = m.pushName || "usuário";

    const response =
      `Música encontrada para ${callerName} 🎶\n\n` +
      `🎵 *Título*: ${title}\n` +
      `🎤 *Artista*: ${artist}\n` +
      `👀 *Visualizações*: ${views}\n` +
      `⏱ *Duração*: ${duration}\n` +
      `📅 *Enviada há*: ${uploaded}\n` +
      (thumbnail ? `🖼 *Thumbnail*: ${thumbnail}\n` : "") +
      `🔗 *Link*: ${videoUrl}\n\n` +
      `Powered by 9bot.com.br`;

    await m.reply(formatStylishReply(response));
  } catch (err) {
    console.error("YouTube search error:", err);
    return m.reply(
      formatStylishReply(
        "Ocorreu um erro ao tentar buscar a música. Tente novamente em alguns instantes. 🎧"
      )
    );
  }
};
