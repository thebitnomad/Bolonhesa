const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Função para fazer upload da imagem para qu.ax e retornar a URL
async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
        });

        const link = response.data?.files?.[0]?.url;
        if (!link) throw new Error('No URL returned in response');

        fs.unlinkSync(tempFilePath);
        return { url: link };
    } catch (error) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw new Error(`Upload error: ${error.message}`);
    }
}

module.exports = {
    name: 'hd',
    aliases: ['enhance', 'upscale'],
    description: 'Melhora a qualidade da imagem para HD usando IA (upscaling)',
    run: async (context) => {
        const { client, m, mime } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        // Verifica se a imagem vem da mensagem respondida ou da própria mensagem
        const quoted = m.quoted ? m.quoted : m;
        const quotedMime = quoted.mimetype || mime || '';

        if (!/image/.test(quotedMime)) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Envie ou responda a uma *imagem* junto com este comando.
│❒ Exemplo: responda a uma imagem com *.hd*
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );
        }

        // Mensagem de carregamento
        let loadingMsg = await client.sendMessage(
            m.chat,
            {
                text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Melhorando a sua imagem para HD...
│❒ Isso pode levar alguns instantes ⏳
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );

        try {
            // 1) Baixar a imagem
            const media = await quoted.download();

            if (!media) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível baixar a imagem.
│❒ Tente novamente com outra imagem.
◈━━━━━━━━━━━━━━━━◈`
                    },
                    { quoted: m }
                );
            }

            // 2) Verificar limite de tamanho (10MB)
            if (media.length > 10 * 1024 * 1024) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`◈━━━━━━━━━━━━━━━━◈
│❒ A imagem é muito grande.
│❒ Tamanho máximo permitido: *10 MB*.
◈━━━━━━━━━━━━━━━━◈`
                    },
                    { quoted: m }
                );
            }

            // 3) Upload da imagem para obter URL pública
            const { url: imageUrl } = await uploadImage(media);

            // 4) Chamar a API de upscaling
            const encodedUrl = encodeURIComponent(imageUrl);
            const upscaleApiUrl = `https://api.zenzxz.my.id/api/tools/upscale?url=${encodedUrl}`;
            
            const response = await axios.get(upscaleApiUrl, {
                headers: { 
                    accept: 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 60000
            });

            // Validar resposta da API
            if (!response.data.success || !response.data.data?.url) {
                throw new Error('Upscale API failed to process the image');
            }

            const enhancedImageUrl = response.data.data.url;

            // 5) Baixar a imagem melhorada
            const enhancedResponse = await axios.get(enhancedImageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const enhancedImage = Buffer.from(enhancedResponse.data);

            // 6) Apagar mensagem de carregamento e enviar imagem melhorada
            await client.sendMessage(m.chat, { delete: loadingMsg.key });

            await client.sendMessage(
                m.chat,
                { 
                    image: enhancedImage, 
                    caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Imagem melhorada para HD! 🎨
│❒ Qualidade aprimorada com sucesso.
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error('HD enhancement error:', err);
            
            // Tenta apagar a mensagem de carregamento em caso de erro
            try {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            } catch (e) {
                // Ignora erros ao apagar
            }

            let errorMessage = 'Ocorreu um erro inesperado.';

            if (err.message.includes('timeout')) {
                errorMessage = 'O processamento excedeu o tempo limite. A imagem pode ser muito grande ou o servidor está ocupado.';
            } else if (err.message.includes('Network Error')) {
                errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
            } else if (err.message.includes('Upload error')) {
                errorMessage = 'Falha ao enviar a imagem para processamento.';
            } else if (err.message.includes('Upscale API failed')) {
                errorMessage = 'O serviço de aprimoramento não conseguiu processar a sua imagem.';
            } else {
                errorMessage = err.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível melhorar a imagem para HD.
│❒ Erro: ${errorMessage}
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );
        }
    }
};
