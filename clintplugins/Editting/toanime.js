const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders()
        });

        const link = response.data.files?.[0]?.url;
        if (!link) {
            throw new Error('Nenhuma URL foi retornada pelo servidor de upload.');
        }

        return { url: link };
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = {
    name: 'toanime',
    aliases: ['anime', 'toon', 'cartoon'],
    description: 'Convert a replied image to anime style',
    run: async (context) => {
        const { client, m } = context;

        // === 1. OBRIGATÓRIO RESPONDER UMA IMAGEM ===
        if (!m.quoted) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Você precisa *responder* a uma imagem.
│❒ Exemplo: responda à foto e envie \`.toanime\`.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        const quoted = m.quoted;

        // === 2. VALIDAÇÃO SEGURA DO MIMETYPE ===
        let quotedMime = '';
        if (quoted.mtype === 'imageMessage' && quoted.msg?.mimetype) {
            quotedMime = quoted.msg.mimetype;
        } else if (quoted.mimetype) {
            quotedMime = quoted.mimetype;
        }

        if (!quotedMime || !quotedMime.startsWith('image/')) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ A mensagem respondida *não é uma imagem*.
│❒ Por favor, responda a uma *foto* para continuar.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // === 3. MENSAGEM DE PROCESSAMENTO ===
        const processing = await m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Convertendo sua foto para estilo anime...
│❒ Por favor, aguarde um instante.
◈━━━━━━━━━━━━━━━━◈`
        );

        try {
            // === 4. DOWNLOAD DA MÍDIA ===
            const media = await quoted.download();
            if (!media || media.length === 0) {
                throw new Error('Não foi possível baixar a imagem enviada.');
            }

            // === 5. LIMITE DE TAMANHO ===
            if (media.length > 10 * 1024 * 1024) {
                await client.sendMessage(m.chat, { delete: processing.key }).catch(() => {});
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ A imagem é muito grande.
│❒ Tamanho máximo permitido: 10MB.
◈━━━━━━━━━━━━━━━━◈`
                );
            }

            // === 6. UPLOAD DA IMAGEM ===
            const { url: imageUrl } = await uploadImage(media);

            // === 7. CHAMADA À API DE ANIME ===
            const apiResponse = await axios.get('https://fgsi.koyeb.app/api/ai/image/toAnime', {
                params: {
                    apikey: 'fgsiapi-2dcdfa06-6d',
                    url: imageUrl
                },
                responseType: 'arraybuffer',
                timeout: 90000
            });

            const animeBuffer = Buffer.from(apiResponse.data);

            // === 8. ENVIO DO RESULTADO ===
            await client.sendMessage(
                m.chat,
                {
                    image: animeBuffer,
                    caption: `◈━━━━━━━━━━━━━━━━◈
│❒ Transformação em anime concluída! ✨
│❒ Olha só como ficou em estilo anime. 👀
◈━━━━━━━━━━━━━━━━◈`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

            // === 9. REMOVER MENSAGEM DE PROCESSAMENTO ===
            await client.sendMessage(m.chat, { delete: processing.key }).catch(() => {});
        } catch (err) {
            console.error(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Erro no comando toanime: ${err.message}
◈━━━━━━━━━━━━━━━━◈`
            );

            const errorMsg = err.response
                ? `Erro na API: código ${err.response.status}.`
                : err.message.includes('timeout')
                ? 'A requisição para a API demorou demais (timeout).'
                : `Falha ao processar a imagem: ${err.message}`;

            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ ${errorMsg}
◈━━━━━━━━━━━━━━━━◈`
            );
        }
    }
};
