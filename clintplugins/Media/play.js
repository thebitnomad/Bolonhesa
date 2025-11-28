const fs = require("fs");
const path = require("path");
const yts = require("yt-search");
const axios = require("axios");

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const isValidYouTubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?[A-Za-z0-9_-]{11}(\?.*)?$/.test(
    url
  );
};

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
          "Envie o nome de uma música para eu procurar pra você. 🎵\nExemplo: .play Not Like Us"
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
          "Tente usar um nome de música mais curto.\nO limite é de 100 caracteres. 📝"
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
            "Não encontrei nenhuma música com esse nome. 😕\nTente outro termo de pesquisa."
          ),
        },
        { quoted: m, ad: true }
      );
    }

    if (!isValidYouTubeUrl(video.url)) {
      throw new Error("URL inválida do YouTube.");
    }

    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(
      video.url
    )}`;

    const response = await axios.get(apiUrl);
    const apiData = response.data;

    if (!apiData.status || !apiData.result || !apiData.result.downloadUrl) {
      throw new Error("A API não conseguiu processar o vídeo.");
    }

    const timestamp = Date.now();
    const fileName = `audio_${timestamp}.mp3`;
    const filePath = path.join(tempDir, fileName);

    const audioResponse = await axios({
      method: "get",
      url: apiData.result.downloadUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    audioResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      throw new Error("Falha no download ou arquivo vazio.");
    }

    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Enviando *${apiData.result.title}* para você. Aperte o play e aproveite! 🔥🎧`
        ),
      },
      { quoted: m, ad: true }
    );

    await client.sendMessage(
      m.chat,
      {
        audio: { url: filePath },
        mimetype: "audio/mpeg",
        fileName: `${apiData.result.title.substring(0, 100)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: apiData.result.title,
            body: `${video.author.name || "Artista desconhecido"} | Powered by 9bot.com.br`,
            thumbnailUrl:
              apiData.result.thumbnail ||
              video.thumbnail ||
              "https://via.placeholder.com/120x90",
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m, ad: true }
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Tivemos um problema ao tentar enviar a música.\n\nDetalhes: ${error.message}\nTente outra faixa. 😎`
        ),
      },
