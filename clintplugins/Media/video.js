const fs = require("fs");
const path = require("path");
const yts = require("yt-search");
const axios = require("axios");

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  if (!text) {
    return client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          "Envie o nome de um vídeo para eu procurar no YouTube pra você. 🎬\nExemplo: .video Alone ft Ava Max"
        ),
      },
      { quoted: m, ad: true }
    );
  }

  if (text.length > 100) {
    return client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          "Tente usar um nome de vídeo mais curto. 📝\nO limite é de 100 caracteres."
        ),
      },
      { quoted: m, ad: true }
    );
  }

  try {
    const searchQuery = `${text} official`;
    const searchResult = await yts(searchQuery);
    const video = searchResult.videos[0];

    if (!video) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            "Não encontrei nenhum vídeo com esse nome. 😕\nTente outro termo de busca."
          ),
        },
        { quoted: m, ad: true }
      );
    }

    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp4?url=${encodeURIComponent(
      video.url
    )}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.status || !data.result || !data.result.downloadUrl) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    const result = data.result;

    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Encontrado! 🎥\nVou enviar o vídeo *${result.title}* para você, aguarde um instante... 🔥`
        ),
      },
      { quoted: m, ad: true }
    );

    await client.sendMessage(
      m.chat,
      {
        video: { url: result.downloadUrl },
        mimetype: "video/mp4",
        fileName: `${result.title}.mp4`,
        caption: formatStylishReply(
          `🎬 *${result.title}*\n📊 Qualidade: ${result.quality}\n⏳ Duração: ${result.duration}s`
        ),
        contextInfo: {
          externalAdReply: {
            title: result.title,
            body: "Powered by Toxic-MD",
            thumbnailUrl: result.thumbnail,
            sourceUrl: video.url,
            mediaType: 2,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m, ad: true }
    );
  } catch (error) {
    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Tivemos um problema ao tentar enviar esse vídeo. 😔\n\nDetalhes: ${error.message}\nTente outro vídeo ou tente novamente mais tarde.`
        ),
      },
      { quoted: m, ad: true }
    );
  }
};
