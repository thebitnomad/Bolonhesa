const fetch = require('node-fetch');

/**
 * Gera um vídeo usando Sora AI a partir de um prompt de texto.
 * @module sora
 */
module.exports = {
  name: 'sora',
  aliases: ['soraai', 'genvideo'],
  description: 'Gera um vídeo com a Sora AI usando o seu prompt de texto',
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
      /**
       * Garante que um prompt foi informado.
       */
      const prompt = m.body
        .replace(new RegExp(`^${prefix}(sora|soraai|genvideo)\\s*`, 'i'), '')
        .trim();

      if (!prompt) {
        return client.sendMessage(
          m.chat,
          {
            text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, @${m.sender.split('@')[0]}!
│❒ Você esqueceu de enviar o prompt.
│❒ Exemplo: ${prefix}sora Um gato azul dançando no espaço
◈━━━━━━━━━━━━━━━━◈`,
            mentions: [m.sender]
          },
          { quoted: m }
        );
      }

      /**
       * Envia mensagem de carregamento.
       */
      const loadingMsg = await client.sendMessage(
        m.chat,
        {
          text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Gerando seu vídeo com a Sora AI...
│❒ Prompt: *"${prompt}"*
│❒ Isso pode levar alguns instantes. ⏳
◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m }
      );

      /**
       * Chama a API da Sora AI.
       */
      const apiUrl = `https://anabot.my.id/api/ai/sora?prompt=${encodeURIComponent(
        prompt
      )}&apikey=freeApikey`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.success || !data.data?.result?.url) {
        throw new Error(data.message || 'Não foi possível gerar o vídeo.');
      }

      const videoUrl = data.data.result.url;

      /**
       * Envia o vídeo gerado.
       */
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Vídeo gerado pela *Sora AI*.
│❒ Prompt: _${prompt}_
◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`,
          gifPlayback: false
        },
        { quoted: m }
      );

      /**
       * Apaga a mensagem de carregamento.
       */
      await client.sendMessage(m.chat, { delete: loadingMsg.key });

    } catch (error) {
      console.error('Sora command error:', error);
      await client.sendMessage(
        m.chat,
        {
          text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível gerar o vídeo no momento.
│❒ Erro: ${error.message}
◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender]
        },
        { quoted: m }
      );
    }
  }
};
