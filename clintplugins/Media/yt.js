const fs = require("fs");
const path = require("path");
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

const getVideoIdFromUrl = (url) => {
  // Tenta pegar pelo parâmetro v=
  const vMatch = url.match(/[?&]v=([^&]+)/);
  if (vMatch && vMatch[1]) return vMatch[1];

  // Tenta pegar pelo formato youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Tenta pegar pelo /shorts/ID ou /embed/ID
  const pathMatch = url.match(/\/(shorts|embed)\/([A-Za-z0-9_-]{11})/);
  if (pathMatch && pathMatch[2]) return pathMatch[2];

  return null;
};

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
  };

  if (!text || !isValidYouTubeUrl(text)) {
    return client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          "Envie um link válido do YouTube para eu baixar o áudio pra você. 🎵\nExemplo: .yt https://youtu.be/60ItHLz5WEA"
        ),
      },
      { quoted: m, ad: true }
    );
  }

  try {
    const timestamp = Date.now();
    const fileName = `audio_${timestamp}.mp3`;
    const filePath = path.join(tempDir, fileName);

    const videoId = getVideoIdFromUrl(text);
    const thumbnailUrl =
      videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "https://via.placeholder.com/120x90";

    await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          "Estou baixando o áudio desse vídeo pra você. 🎶\nAssim que terminar, é só dar o play!"
        ),
      },
      { quoted: m, ad: true }
    );

    const apiUrl = `https://ytdownloader-aie4qa.fly.dev/download/audio?song=${encodeURIComponent(
      text
    )}&quality=128K&cb=${timestamp}`;

    const response = await axios({
      method: "get",
      url: apiUrl,
      responseType: "stream",
      timeout: 600000,
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      throw new Error("Falha no download do áudio ou arquivo vazio.");
    }

    await client.sendMessage(
      m.chat,
      {
        audio: { url: filePath },
        mimetype: "audio/mpeg",
        fileName: "song.mp3",
        contextInfo: {
          externalAdReply: {
            title: "Áudio do YouTube",
            body: "Qualidade: 128K | Powered by Toxic-MD",
            thumbnailUrl,
            sourceUrl: text,
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
          `Tivemos um problema ao processar esse link. 😥\n\nDetalhes: ${error.message}\nVerifique o URL e tente novamente.`
        ),
      },
      { quoted: m, ad: true }
    );
  }
};
