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
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ GOOGLE SEARCH • ERROR\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ 🚫 Por favor, informe um termo para pesquisa.\n" +
      "│ ❒ Exemplo: .google 9bot\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
    );
  }

  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        text
      )}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`
    );

    if (!data.items || data.items.length === 0) {
      return m.reply(
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        "│ ❒ GOOGLE SEARCH\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        `│ ❌ Não encontrei resultados para: "${text}".\n` +
        "│ ❒ Tente refinar a pesquisa ou usar outros termos.\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
      );
    }

    const maxResults = Math.min(data.items.length, 5); // limita para não floodar
    let tex = "";
    tex += "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n";
    tex += "│ ❒ GOOGLE SEARCH\n";
    tex += "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n";
    tex += `│ 🔍 Termo: ${text}\n`;
    tex += "│ ❒ Mostrando até " + maxResults + " resultado(s).\n";
    tex += "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n";

    for (let i = 0; i < maxResults; i++) {
      const item = data.items[i];
      tex += `│ ❒ Resultado ${i + 1}\n`;
      tex += `│ 🪧 Título: ${item.title || "N/A"}\n`;
      tex += `│ 📝 Descrição: ${item.snippet || "N/A"}\n`;
      tex += `│ 🌐 Link: ${item.link || "N/A"}\n`;
      tex += "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n";
    }

    await m.reply(tex);
  } catch (e) {
    console.error("Google Search Error:", e.message);
    return m.reply(
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ GOOGLE SEARCH • ERROR\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❌ Ocorreu um erro ao tentar buscar no Google.\n" +
      `│ ❒ Detalhe: ${e.message}\n` +
      "│ ❒ Tente novamente em alguns instantes.\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
    );
  }
};
