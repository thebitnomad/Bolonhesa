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
│❒ Erro ao processar figurinha: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
    callback();
}, 1);

module.exports = async (context) => {
    const { client, m, mime, packname, author } = context;

    commandQueue.push({
        context,
        run: async ({ client, m, mime, packname, author }) => {
            try {
                const quoted = m.quoted ? m.quoted : m;
                const quotedMime = quoted.mimetype || mime || '';

                if (!/image|video/.test(quotedMime)) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ Não encontrei nenhuma imagem ou vídeo curto na sua mensagem. 😑
◈━━━━━━━━━━━━━━━━◈`
                    );
                }

                if (quoted.videoMessage && quoted.videoMessage.seconds > 30) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ O vídeo precisa ter no máximo 30 segundos para virar figurinha.
◈━━━━━━━━━━━━━━━━◈`
                    );
                }

                const tempFile = path.join(
                    __dirname,
                    `temp-sticker-${Date.now()}.${
                        /image/.test(quotedMime) ? 'jpg' : 'mp4'
                    }`
                );

                const media = await client.downloadAndSaveMediaMessage(quoted, tempFile);

                const sticker = new Sticker(media, {
                    pack: packname || '9BOT PACK',
                    author: author || '9bot.com.br',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '99',
                    quality: 50,
                    background: 'transparent'
                });

                const buffer = await sticker.toBuffer();
                await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

                await fs.unlink(tempFile).catch(() => {});
            } catch (error) {
                console.error(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ Erro ao criar figurinha: ${error.message}
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
