const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, Owner, generateProfilePicture, botNumber, mime, msgToxic } = context;

        try {
            const fs = require("fs");

            if (!msgToxic) {
                m.reply(
                    "◈━━━━━━━━━━━━━━━━◈\n" +
                    "│❒ Responda a uma imagem para usar este comando.\n" +
                    "◈━━━━━━━━━━━━━━━━◈"
                );
                return;
            }

            let media;
            if (msgToxic.imageMessage) {
                media = msgToxic.imageMessage;
            } else {
                m.reply(
                    "◈━━━━━━━━━━━━━━━━◈\n" +
                    "│❒ Isto não é uma imagem.\n" +
                    "│❒ Por favor, responda a uma imagem válida.\n" +
                    "◈━━━━━━━━━━━━━━━━◈"
                );
                return;
            }

            const medis = await client.downloadAndSaveMediaMessage(media);

            const { img } = await generateProfilePicture(medis);

            await client.query({
                tag: 'iq',
                attrs: {
                    target: undefined,
                    to: S_WHATSAPP_NET,
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [
                    {
                        tag: 'picture',
                        attrs: { type: 'image' },
                        content: img
                    }
                ]
            });

            fs.unlinkSync(medis);

            m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Foto de perfil do bot atualizada com sucesso.\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );

        } catch (error) {
            m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Ocorreu um erro ao atualizar a foto de perfil do bot.\n" +
                "│❒ Detalhes: " + error + "\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );
        }
    });
};
