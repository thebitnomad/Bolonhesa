const acrcloud = require("acrcloud");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = async (context) => {
  const { client, m, text, qmsg, mime } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
  };

  try {
    let acr = new acrcloud({
      host: "identify-ap-southeast-1.acrcloud.com",
      access_key: "26afd4eec96b0f5e5ab16a7e6e05ab37",
      access_secret: "wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8",
    });

    if (!/video|audio/.test(mime)) {
      return m.reply(
        formatStylishReply(
          "Marque um vídeo curto ou um áudio para eu tentar reconhecer a música. 🎵"
        )
      );
    }

    let p = m.quoted ? m.quoted : m;
    let buffer = await p.download();

    let { status, metadata } = await acr.identify(buffer);

    if (status.code !== 0) {
      return m.reply(
        formatStylishReply(
          `Não consegui identificar essa música agora.\nDetalhes: ${status.msg || "tente novamente com outro trecho de áudio."}`
        )
      );
    }

    let { title, artists, album, genres, release_date } = metadata.music[0];

    let info =
      `🎵 *Música reconhecida!*\n\n` +
      `• Título: ${title}` +
      `${artists ? `\n• Artista(s): ${artists.map((v) => v.name).join(", ")}` : ""}` +
      `${album ? `\n• Álbum: ${album.name}` : ""}` +
      `${genres ? `\n• Gênero(s): ${genres.map((v) => v.name).join(", ")}` : ""}` +
      `${release_date ? `\n• Lançamento: ${release_date}` : ""}`;

    m.reply(formatStylishReply(info.trim()));
  } catch (error) {
    await m.reply(
      formatStylishReply(
        "Não consegui reconhecer essa música agora... 🎧\nTente enviar outro áudio ou um trecho diferente."
      )
    );
  }
};
