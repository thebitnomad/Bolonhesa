const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Erro no comando WatermarkSticker: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
    callback();
}, 1); // 1 at a time

module.exports = async (context) => {
    const { client, m, mime, pushname } = context;

    if (!m.sender.includes('your-owner-number@s.whatsapp.net')) {
        return m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Apenas o proprietário do bot pode usar este comando.
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    commandQueue.push({
        context,
        run: async ({ client, m, mime, pushname }) => {
            try {
                if (!m.quoted) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ Responda a uma imagem, vídeo curto ou figurinha para alterar a marca d'água.
◈━━━━━━━━━━━━━━━━◈`
                    );
                }

                const quotedMime = m.quoted.mimetype || mime || '';

                if (!/image|video|image\/webp/.test(quotedMime)) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ Isto não é uma figurinha, imagem nem um vídeo curto válido.
◈━━━━━━━━━━━━━━━━◈`
                    );
                }

                if (m.quoted.videoMessage && m.quoted.videoMessage.seconds > 30) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ O vídeo precisa ter no máximo 30 segundos para virar figurinha.
◈━━━━━━━━━━━━━━━━◈`
                    );
                }

                const extension = /image\/webp/.test(quotedMime)
                    ? 'webp'
                    : /image/.test(quotedMime)
                    ? 'jpg'
                    : 'mp4';

                const tempFile = path.join(
                    __dirname,
                    `temp-watermark-${Date.now()}.${extension}`
                );

                await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Um instante, o 9bot está criando a figurinha para você...
◈━━━━━━━━━━━━━━━━◈`
                );

                const media = await client.downloadAndSaveMediaMessage(m.quoted, tempFile);

                const stickerResult = new Sticker(media, {
                    pack: pushname || '9BOT',
                    author: pushname || '9bot.com.br',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: 50,
                    background: 'transparent'
                });

                const buffer = await stickerResult.toBuffer();
                await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

                await fs.unlink(tempFile).catch(() =>
                    console.warn(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ Aviso: não foi possível apagar o arquivo temporário de figurinha.
◈━━━━━━━━━━━━━━━━◈`
                    )
                );
            } catch (error) {
                console.error(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Erro ao criar a figurinha com nova marca d'água: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
                );
                await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao criar a figurinha. Tente novamente em instantes.
◈━━━━━━━━━━━━━━━━◈`
                );
            }
        }
    });
};
