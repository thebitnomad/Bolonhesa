const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Function to upload image to qu.ax and get a URL
async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders()
        });

        const link = response.data?.files?.[0]?.url;
        if (!link) {
            throw new Error('Nenhuma URL foi retornada pelo servidor de upload.');
        }

        return { url: link };
    } catch (error) {
        throw new Error(`Erro no upload da imagem: ${error.message}`);
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = async (context) => {
    const { client, mime, m } = context;

    // Escolhe entre mensagem citada ou direta
    const quoted = m.quoted ? m.quoted : m;
    const quotedMime = quoted.mimetype || mime || '';

    if (!/image/.test(quotedMime)) {
        return m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Envie ou responda a este comando com uma imagem.
│❒ Exemplo: responda à foto e envie o comando.
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Criando sua imagem em estilo “figure”...
│❒ Por favor, aguarde alguns instantes. ✨
◈━━━━━━━━━━━━━━━━◈`
    );

    try {
        // 1. Baixar o buffer da imagem
        const media = await quoted.download();
        if (!media) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível baixar a imagem enviada.
│❒ Tente novamente com outra foto.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // 2. Limitar tamanho a 10MB
        if (media.length > 10 * 1024 * 1024) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ A imagem é muito grande.
│❒ Tamanho máximo permitido: 10MB.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // 3. Fazer upload para obter URL pública
        const { url: imageUrl } = await uploadImage(media);

        // 4. Chamar a API tofigur
        const apiURL = `https://api.fikmydomainsz.xyz/imagecreator/tofigur?url=${encodeURIComponent(
            imageUrl
        )}`;
        const response = await axios.get(apiURL);

        // 5. Validar resposta da API
        if (!response.data || !response.data.status || !response.data.result) {
            throw new Error('Resposta inválida recebida da API de conversão.');
        }

        const resultUrl = response.data.result;

        // 6. Baixar a imagem gerada em estilo figure
        const figureBuffer = (
            await axios.get(resultUrl, { responseType: 'arraybuffer' })
        ).data;

        // 7. Enviar a imagem de volta
        await client.sendMessage(
            m.chat,
            {
                image: Buffer.from(figureBuffer),
                caption: `◈━━━━━━━━━━━━━━━━◈
│❒ Sua imagem foi convertida para o estilo “figure”. 🎨
│❒ Se quiser, envie outra foto para transformar também.
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    } catch (err) {
        console.error(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Erro ao gerar imagem em estilo figure: ${err.message}
◈━━━━━━━━━━━━━━━━◈`
        );

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao gerar a imagem em estilo “figure”.
│❒ Detalhes: ${err.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
