const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

// Fila para processar um comando por vez (segurança e estabilidade)
const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`Sticker-to-image error: ${error.message}`);
    }
    callback();
}, 1);

module.exports = async (context) => {
    const { client, m, mime } = context;

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    commandQueue.push({
        context,
        run: async ({ client, m, mime }) => {
            try {
                // O usuário deve responder a um sticker
                if (!m.quoted) {
                    return m.reply(
                        formatStylishReply(
                            "Responda a um *sticker* para convertê-lo em imagem."
                        )
                    );
                }

                const quotedMime = m.quoted.mimetype || "";
                if (!/webp/.test(quotedMime)) {
                    return m.reply(
                        formatStylishReply(
                            "A mensagem respondida não é um sticker válido."
                        )
                    );
                }

                await m.reply(
                    formatStylishReply(
                        "Convertendo o sticker para imagem...\nAguarde alguns instantes."
                    )
                );

                // Caminhos temporários
                const tempSticker = path.join(
                    __dirname,
                    `temp-sticker-${Date.now()}.webp`
                );
                const outputImage = path.join(
                    __dirname,
                    `converted-${Date.now()}.jpg`
                );

                // Baixa o sticker
                const media = await client.downloadAndSaveMediaMessage(
                    m.quoted,
                    tempSticker
                );

                // Converte usando ffmpeg
                const { exec } = require("child_process");
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i "${media}" "${outputImage}" -y`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Lê a imagem convertida
                const imageBuffer = await fs.readFile(outputImage);

                // Envia a imagem para o usuário
                await client.sendMessage(
                    m.chat,
                    {
                        image: imageBuffer,
                        caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Sticker convertido para imagem com sucesso! 
◈━━━━━━━━━━━━━━━━◈`,
                    },
                    { quoted: m }
                );

                // Remove arquivos temporários
                await fs.unlink(tempSticker).catch(() => {});
                await fs.unlink(outputImage).catch(() => {});

            } catch (error) {
                console.error(`Picture error: ${error.message}`);

                await m.reply(
                    formatStylishReply(
                        "Ocorreu um erro durante a conversão do sticker. Tente novamente."
                    )
                );
            }
        },
    });
};
