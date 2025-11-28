const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Função para fazer upload da imagem no qu.ax e obter uma URL pública
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
            throw new Error('Nenhuma URL foi retornada na resposta do servidor.');
        }

        return { url: link };
    } catch (error) {
        throw new Error(`Erro ao enviar a imagem para o servidor: ${error.message}`);
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = async (context) => {
    const { client, mime, m } = context;

    // Detectar se a imagem vem da mensagem atual ou de uma mensagem respondida
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
│❒ Criando sua arte no estilo *Studio Ghibli*...
│❒ Por favor, aguarde alguns instantes. 🎨
◈━━━━━━━━━━━━━━━━◈`
    );

    try {
        // Passo 1: Baixar a imagem
        const media = await quoted.download();
        if (!media) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível baixar a imagem enviada.
│❒ Tente novamente com outra foto.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Passo 2: Verificação de limite de tamanho (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (media.length > maxSize) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ A imagem é muito grande.
│❒ Tamanho máximo permitido: 10MB.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Passo 3: Upload da imagem para obter uma URL pública
        const { url: imageUrl } = await uploadImage(media);

        // Passo 4: Chamada para a API toGhibli
        const response = await axios.get('https://fgsi.koyeb.app/api/ai/image/toGhibli', {
            params: {
                apikey: 'fgsiapi-2dcdfa06-6d',
                url: imageUrl
            },
            responseType: 'arraybuffer',
            timeout: 90000
        });

        const ghibliImage = Buffer.from(response.data);

        // Passo 5: Enviar a imagem no estilo Ghibli de volta ao usuário
        await client.sendMessage(
            m.chat,
            {
                image: ghibliImage,
                caption: `◈━━━━━━━━━━━━━━━━◈
│❒ Sua imagem foi reimaginada no estilo *Studio Ghibli*! 🌸
│❒ Se quiser, envie outra foto para transformar também.
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    } catch (err) {
        console.error(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Erro ao gerar imagem no estilo Ghibli: ${err.message}
◈━━━━━━━━━━━━━━━━◈`
        );

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao gerar a imagem no estilo *Studio Ghibli*.
│❒ Detalhes: ${err.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
