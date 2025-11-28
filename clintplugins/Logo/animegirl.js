const axios = require("axios");

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  try {
    const query = (text && text.trim()) ? text.trim().slice(0, 50) : "9bot";

    const apiUrl = `https://api.zenzxz.my.id/api/maker/animegirl/image?text=${encodeURIComponent(
      query
    )}`;

    await m.reply(
      formatStylishReply(
        `🎨 Gerando sua imagem em estilo anime com o texto: *${query}*...\nAguarde um instante.`
      )
    );

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    await client.sendMessage(
      m.chat,
      {
        image: Buffer.from(response.data),
        caption: formatStylishReply(
          `✨ Imagem em estilo *anime* criada para: *${query}* ✨`
        ),
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("AnimeGirl command error:", error);
    await m.reply(
      formatStylishReply(
        `❌ Não consegui gerar a imagem em estilo anime.\n\nDetalhes: ${error.message}`
      )
    );
  }
};
