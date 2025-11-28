module.exports = async (context) => {
    const { client, m, text } = context;
    const googleTTS = require('google-tts-api');

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    // Verificar se o usuário enviou texto
    if (!text) {
        return m.reply(
            formatStylishReply(
                'Cadê o texto para conversão em áudio?'
            )
        );
    }

    try {
        // Gerar URL do áudio em hindi (hi-IN)
        const url = googleTTS.getAudioUrl(text, {
            lang: 'hi-IN',
            slow: false,
            host: 'https://translate.google.com'
        });

        // Enviar áudio como mensagem de voz (PTT)
        await client.sendMessage(
            m.chat,
            {
                audio: { url },
                mimetype: 'audio/mp4',
                ptt: true
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(
            formatStylishReply(`Erro ao gerar áudio TTS: ${err.message}`)
        );

        await m.reply(
            formatStylishReply(
                'Ocorreu um erro ao gerar o áudio. 😞\nTente novamente mais tarde.'
            )
        );
    }
};
