const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatReply = (msg) => {
    return (
      "◈━━━━━━━━━━━━━━━━◈\n" +
      `│❒ ${msg}\n` +
      "◈━━━━━━━━━━━━━━━━◈"
    );
  };

  if (!text) {
    return m.reply(
      formatReply(
        "Informe o nome de uma música para buscar a letra. 🎵\nExemplo: .lyrics Into Your Arms"
      )
    );
  }

  try {
    const encoded = encodeURIComponent(text);
    const apiUrl = `https://api.deline.web.id/tools/lyrics?title=${encoded}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check if data is valid
    if (!data.status || !data.result || data.result.length === 0) {
      return m.reply(
        formatReply(`Nenhuma letra encontrada para: "${text}". Tente outro nome.`)
      );
    }

    // Pick result with longest lyrics
    const song = data.result.reduce((best, current) => {
      return (current.plainLyrics?.length || 0) > (best.plainLyrics?.length || 0)
        ? current
        : best;
    }, data.result[0]);

    const { plainLyrics, artistName, name } = song;
    const lyrics = plainLyrics || "Letra não disponível.";

    const header =
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ 9BOT • LYRICS SEARCH 🎤\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      `│ 🎵 Música : ${name || "N/A"}\n` +
      `│ 👤 Artista: ${artistName || "N/A"}\n` +
      "◈━━━━━━━━━━━━━━━━◈\n\n";

    await m.reply(header + lyrics);

  } catch (error) {
    console.error("Lyrics API error:", error.message);
    return m.reply(
      formatReply("Não consegui buscar essa letra agora. Tente novamente mais tarde. ❌")
    );
  }
};
