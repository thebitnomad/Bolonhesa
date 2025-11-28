const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports = async (context) => {
    const { client, m } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
    };

    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime) {
            return m.reply(
                formatStylishReply(
                    "Por favor, responda ou envie um arquivo de mídia para eu fazer o upload pra você. 📤"
                )
            );
        }

        const mediaBuffer = await q.download();

        if (mediaBuffer.length > 256 * 1024 * 1024) {
            return m.reply(
                formatStylishReply(
                    "Esse arquivo é muito grande para upload.\nO tamanho máximo permitido é de *256MB*."
                )
            );
        }

        const tempFilePath = path.join(__dirname, `temp_${Date.now()}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        const form = new FormData();
        form.append("files[]", fs.createReadStream(tempFilePath));

        const response = await axios.post("https://qu.ax/upload.php", form, {
            headers: {
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        const files = response.data?.files;
        if (!files || !files[0]?.url) {
            throw new Error("A API não retornou o link do arquivo enviado.");
        }

        const link = files[0].url;
        const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: "Upload concluído com sucesso ✅",
                    title: `Link da mídia:\n${link}\n\nTamanho: ${fileSizeMB} MB`,
                    footer: "> Powered by 9bot.com.br",
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Copiar link",
                                id: `copy_${Date.now()}`,
                                copy_code: link,
                            }),
                        },
                    ],
                },
            },
            { quoted: m }
        );

        await m.reply(
            formatStylishReply(
                `Seu arquivo foi enviado com sucesso! ✅\n\nLink gerado:\n${link}\n\nTamanho: ${fileSizeMB} MB`
            )
        );
    } catch (err) {
        console.error(formatStylishReply(`Erro no upload: ${err.message}`));
        m.reply(
            formatStylishReply(
                `Ocorreu um erro ao tentar enviar o arquivo. 😥\n\nDetalhes: ${err.message}`
            )
        );
    }
};
