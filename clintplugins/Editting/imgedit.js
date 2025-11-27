const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  try {
    // Verifica se o usuário respondeu uma imagem e enviou um prompt
    if (!m.quoted) {
      return m.reply(
        formatStylishReply("Responda a uma imagem que você deseja editar.")
      );
    }

    if (!text) {
      return m.reply(
        formatStylishReply(
          "Por favor, envie um prompt de edição.\nExemplo: *.imgedit adicionar brilho neon*"
        )
      );
    }

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";

    if (!mime.startsWith("image/")) {
      return m.reply(
        formatStylishReply(
          "O conteúdo respondido não é uma imagem. Envie ou responda a uma imagem válida."
        )
      );
    }

    // Download da imagem respondida
    const mediaBuffer = await q.download();

    // Salva temporariamente
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload para qu.ax
    const form = new FormData();
    form.append("files[]", fs.createReadStream(tempFilePath));

    const uploadResponse = await axios.post("https://qu.ax/upload.php", form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Remove arquivo temporário
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Link da imagem enviada
    const uploaded = uploadResponse.data?.files?.[0]?.url;
    if (!uploaded) {
      return m.reply(
        formatStylishReply("Não foi possível enviar a imagem para edição.")
      );
    }

    await m.reply(
      formatStylishReply(
        "Editando sua imagem de acordo com o prompt...\nAguarde alguns instantes. 🎨"
      )
    );

    // Monta URL da API de edição
    const apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(
      uploaded
    )}&prompt=${encodeURIComponent(text)}`;

    // Busca a imagem editada
    const editResponse = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Envia a imagem editada
    await client.sendMessage(
      m.chat,
      {
        image: Buffer.from(editResponse.data),
        caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Imagem editada com sucesso! 🎨
│❒ Prompt usado: ${text}
◈━━━━━━━━━━━━━━━━◈
Powered by *9bot*`,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Erro no comando de edição de imagem:", error);
    await m.reply(
      formatStylishReply(
        `Não foi possível editar a imagem no momento.\nDetalhes: ${error.message}`
      )
    );
  }
};
