const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (context) => {
  const { client, m, text, botname } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  async function MediaFire(url, options = {}) {
    try {
      const res = await axios.get(url, options);
      const $ = cheerio.load(res.data);

      const hasil = [];
      const link = $("a#downloadButton").attr("href");

      if (!link) {
        return [];
      }

      const sizeRaw = $("a#downloadButton").text() || "";
      const size = sizeRaw
        .replace("Download", "")
        .replace("(", "")
        .replace(")", "")
        .replace(/\s+/g, " ")
        .trim();

      const parts = link.split("/");
      const nama = parts[5] || "arquivo_desconhecido";
      let mimeParts = nama.split(".");
      let mime = mimeParts[mimeParts.length - 1] || "octet-stream";

      hasil.push({ nama, mime, size, link });
      return hasil;
    } catch (err) {
      throw err;
    }
  }

  if (!text) {
    return m.reply(
      formatStylishReply(
        "Por favor, envie um link válido do *MediaFire* para que eu possa baixar o arquivo para você. 📁"
      )
    );
  }

  if (!text.includes("mediafire.com")) {
    return m.reply(
      formatStylishReply(
        "Esse link não parece ser do *MediaFire*. Verifique o endereço e tente novamente. 😉"
      )
    );
  }

  await m.reply(
    formatStylishReply("Um instante, estou verificando o arquivo para você... ⏳")
  );

  try {
    const fileInfo = await MediaFire(text);

    if (
      !Array.isArray(fileInfo) ||
      !fileInfo.length ||
      !fileInfo[0].link ||
      !fileInfo[0].nama
    ) {
      return m.reply(
        formatStylishReply(
          "Não encontrei esse arquivo no *MediaFire*.\nEle pode ter sido removido ou estar temporariamente indisponível."
        )
      );
    }

    const file = fileInfo[0];

    await client.sendMessage(
      m.chat,
      {
        document: {
          url: file.link,
        },
        fileName: file.nama,
        mimetype: `application/${file.mime}`,
        caption: formatStylishReply(
          `📁 Arquivo: *${file.nama}*\n💾 Tamanho: ${file.size || "não informado"}\n🤖 Enviado via *${botname}*`
        ),
      },
      { quoted: m }
    );
  } catch (error) {
    return m.reply(
      formatStylishReply(
        `Ocorreu um erro ao tentar baixar o arquivo do *MediaFire*.\n\nDetalhes: ${error.message || error}`
      )
    );
  }
};
