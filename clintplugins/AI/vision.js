const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, text } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
        if (!m.quoted) {
            return m.reply(
                formatStylishReply(
                    'Responda a uma imagem para que eu possa analisá-la.'
                )
            );
        }

        if (!text) {
            return m.reply(
                formatStylishReply(
                    'Você precisa dizer o que deseja que eu analise na imagem.'
                )
            );
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || '';

        if (!mime.startsWith('image/')) {
            return m.reply(
                formatStylishReply(
                    'O conteúdo respondido não é uma imagem. Por favor, envie ou responda a uma imagem.'
                )
            );
        }

        // Download da mídia
        const mediaBuffer = await q.download();

        // Salva temporariamente
        const tempFile = path.join(__dirname, `temp_${Date.now()}`);
        fs.writeFileSync(tempFile, mediaBuffer);

        // Upload para qu.ax
        const form = new FormData();
        form.append('files[]', fs.createReadStream(tempFile));

        const upload = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        // Remove arquivo temporário
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }

        const uploadedURL = upload.data?.files?.[0]?.url;
        if (!uploadedURL) {
            return m.reply(
                formatStylishReply(
                    'Não foi possível enviar a imagem para análise. Tente novamente em instantes.'
                )
            );
        }

        await m.reply(
            formatStylishReply(
                'Analisando a imagem... 🧠\nAguarde um momento enquanto preparo o resultado.'
            )
        );

        // Chamada para GPTNano Vision
        const api = `https://api.ootaizumi.web.id/ai/gptnano?prompt=${encodeURIComponent(
            text
        )}&imageUrl=${encodeURIComponent(uploadedURL)}`;
        const result = await axios.get(api);

        if (result.data?.result) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Resultado da análise de imagem:
◈━━━━━━━━━━━━━━━━◈

${result.data.result}

◈━━━━━━━━━━━━━━━━◈`,
                },
                { quoted: m }
            );
        }

        m.reply(
            formatStylishReply(
                'A API não retornou uma resposta válida para a análise da imagem.'
            )
        );

    } catch (err) {
        await m.reply(
            formatStylishReply(
                `Ocorreu um erro ao processar a imagem.\nDetalhes: ${err.message}`
            )
        );
    }
};
