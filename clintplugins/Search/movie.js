module.exports = async (context) => {
  const { client, m, text } = context;
  const axios = require("axios");

  const formatReply = (msg) => {
    return (
      "◈━━━━━━━━━━━━━━━━◈\n" +
      `│❒ ${msg}\n` +
      "◈━━━━━━━━━━━━━━━━◈"
    );
  };

  if (!text) {
    return m.reply(
      formatReply("Por favor, informe o nome de um filme ou série para buscar. 🎬")
    );
  }

  try {
    const res = await axios.get(
      `http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(text)}&plot=full`
    );
    const data = res.data;

    if (!data || data.Response === "False") {
      return m.reply(
        formatReply(`Nenhum resultado encontrado para: "${text}". Tente outro título. 🔍`)
      );
    }

    const caption =
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ 9BOT • MOVIE SEARCH 🎬\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      `│ 🎞 Título       : ${data.Title || "N/A"}\n` +
      `│ 📅 Ano          : ${data.Year || "N/A"}\n` +
      `│ ⭐ Classificação : ${data.Rated || "N/A"}\n` +
      `│ 📆 Lançado      : ${data.Released || "N/A"}\n` +
      `│ ⏳ Duração      : ${data.Runtime || "N/A"}\n` +
      `│ 🌀 Gênero       : ${data.Genre || "N/A"}\n` +
      `│ 🎬 Diretor      : ${data.Director || "N/A"}\n` +
      `│ ✍️ Roteirista   : ${data.Writer || "N/A"}\n` +
      `│ 👥 Atores       : ${data.Actors || "N/A"}\n` +
      `│ 📜 Sinopse      : ${data.Plot || "N/A"}\n` +
      `│ 🌐 Idioma       : ${data.Language || "N/A"}\n` +
      `│ 🌍 País         : ${data.Country || "N/A"}\n` +
      `│ 🏆 Prêmios      : ${data.Awards || "N/A"}\n` +
      `│ 💰 Bilheteria   : ${data.BoxOffice || "N/A"}\n` +
      `│ 🏭 Produção     : ${data.Production || "N/A"}\n` +
      `│ ⭐ Nota IMDb     : ${data.imdbRating || "N/A"}\n` +
      `│ 🗳️ Votos IMDb    : ${data.imdbVotes || "N/A"}\n` +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈";

    await client.sendMessage(
      m.chat,
      {
        image: { url: data.Poster },
        caption,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Movie search error:", error);
    return m.reply(
      formatReply("Não consegui encontrar esse título agora. Tente novamente mais tarde. ❌")
    );
  }
};
