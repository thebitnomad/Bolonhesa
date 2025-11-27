const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, prefix, pict, botname } = context;

    if (!botname) {
        console.error(`Botname not set in context.`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Ops! Nome do bot não configurado. Avise o suporte para ajustar.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    if (!pict) {
        console.error(`Pict not set in context.`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Sem imagem para enviar agora. Reenvie o comando ou fale com o suporte.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    try {
        const caption = `◈━━━━━━━━━━━━━━━━◈\n│❒ Olá, ${m.pushName}! *${botname}* está ON e pronto para ajudar. 😄\n│❒ \n│❒ Envie *${prefix}menu* para ver o que posso fazer por você.\n◈━━━━━━━━━━━━━━━━◈\n│❒ Energizado por *xh_clinton*`;

        // Handle pict (image) input
        let imageOptions;
        if (Buffer.isBuffer(pict)) {
            console.log(`[ALIVE-DEBUG] pict is a Buffer, saving to temp file`);
            const tempImagePath = path.join(__dirname, 'temp_alive_image.jpg');
            try {
                fs.writeFileSync(tempImagePath, pict);
                imageOptions = { url: tempImagePath };
            } catch (err) {
                console.error(`[ALIVE-ERROR] Failed to save temp image: ${err.stack}`);
                throw new Error(`Não foi possível processar o buffer da imagem: ${err.message}`);
            }
        } else if (typeof pict === 'string') {
            console.log(`[ALIVE-DEBUG] pict is a string: ${pict}`);
            // Validate if pict is a valid URL or file path
            if (pict.startsWith('http://') || pict.startsWith('https://') || fs.existsSync(pict)) {
                imageOptions = { url: pict };
            } else {
                throw new Error(`Invalid pict path or URL: ${pict}`);
            }
        } else {
            throw new Error(`Tipo de pict inesperado: ${typeof pict}`);
        }

        // Send the image with toxic caption
        await client.sendMessage(m.chat, {
            image: imageOptions,
            caption: caption,
            mentions: [m.sender]
        }, { quoted: m });

        // Clean up temp image if created
        if (imageOptions.url.startsWith(__dirname)) {
            try {
                fs.unlinkSync(imageOptions.url);
                console.log(`[ALIVE-DEBUG] Cleaned up temp image: ${imageOptions.url}`);
            } catch (err) {
                console.error(`[ALIVE-ERROR] Failed to clean up temp image: ${err.stack}`);
            }
        }

        // Audio file paths with extra toxicity
        const possibleAudioPaths = [
            path.join(__dirname, 'xh_clinton', 'test.mp3'),
            path.join(process.cwd(), 'xh_clinton', 'test.mp3'),
            path.join(__dirname, '..', 'xh_clinton', 'test.mp3'),
        ];

        let audioFound = false;
        for (const audioPath of possibleAudioPaths) {
            console.log(`[ALIVE-DEBUG] Checking audio path: ${audioPath}`);
            try {
                if (fs.existsSync(audioPath)) {
                    await client.sendMessage(m.chat, {
                        audio: { url: audioPath },
                        ptt: true,
                        mimetype: 'audio/mpeg',
                        fileName: 'alive-note.mp3'
                    }, { quoted: m });
                    audioFound = true;
                    console.log(`[ALIVE-DEBUG] Sent audio from: ${audioPath}`);
                    break;
                } else {
                    console.log(`[ALIVE-DEBUG] Audio not found at: ${audioPath}`);
                }
            } catch (err) {
                console.error(`[ALIVE-ERROR] Failed to send audio from ${audioPath}: ${err.stack}`);
            }
        }

        if (!audioFound) {
            console.error('❌ Audio file not found at any path');
            await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ ${m.pushName}, não encontrei o áudio de boas-vindas.\n│❒ Verifique o arquivo xh_clinton/test.mp3.\n◈━━━━━━━━━━━━━━━━◈`);
        }

    } catch (error) {
        console.error(`[ALIVE-ERROR] ${error.stack}`);
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Algo deu errado, ${m.pushName}.\n│❒ Detalhes: ${error.message}\n│❒ Tente novamente em instantes.\n◈━━━━━━━━━━━━━━━━◈`);
    }
};