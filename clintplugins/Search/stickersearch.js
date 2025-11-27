module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  description: 'Fetches GIF stickers from Tenor based on your search term',
  run: async (context) => {
    const { client, m, text, botname } = context;
    const axios = require('axios');
    const { Sticker, StickerTypes } = require('wa-sticker-formatter');

    // Check botname
    if (!botname) {
      console.error(`Botname is missing.`);
      return m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Botname não configurado ainda.
│❒ Ajuste isso antes de continuar.
┗━━━━━━━━━━━━━━━┛`
      );
    }

    try {
      // Validate sender
      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        console.error(`Invalid m.sender: ${JSON.stringify(m.sender)}`);
        return m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui identificar seu número corretamente.
│❒ Por favor, tente novamente.
┗━━━━━━━━━━━━━━━┛`
        );
      }

      const userNumber = m.sender.split('@')[0];

      // Validate search term
      if (!text) {
        return m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ ${userNumber}, você precisa informar um termo para pesquisa.
│❒ Exemplo: .sticker gato dançando
┗━━━━━━━━━━━━━━━┛`,
          { mentions: [m.sender] }
        );
      }

      // If group, notify that response will go to DM
      if (m.isGroup) {
        await m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Envio de sticker solicitado!
│❒ Verifique seu privado, ${userNumber}. 😉
┗━━━━━━━━━━━━━━━┛`,
          { mentions: [m.sender] }
        );
      }

      const tenorApiKey = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';

      // Fetch GIFs
      const gifResponse = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          text
        )}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
      );

      const results = gifResponse.data.results;
      if (!results || results.length === 0) {
        return m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Nada encontrado para: "${text}".
│❒ Tente variar o termo e tente novamente.
┗━━━━━━━━━━━━━━━┛`,
          { mentions: [m.sender] }
        );
      }

      // Send up to 8 stickers
      for (let i = 0; i < Math.min(8, results.length); i++) {
        const gifUrl = results[i].media_formats.gif.url;

        const stickerMess = new Sticker(gifUrl, {
          pack: botname,
          author: '9bot.com.br',
          type: StickerTypes.FULL,
          categories: ['🤩', '🎉'],
          id: `sticker-${i}`,
          quality: 60,
          background: 'transparent'
        });

        const stickerBuffer = await stickerMess.toBuffer();
        await client.sendMessage(
          m.sender,
          { sticker: stickerBuffer },
          { quoted: m }
        );
      }

    } catch (error) {
      console.error(`Sticker command error: ${error.stack}`);
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui gerar o sticker agora.
│❒ Tente novamente em alguns instantes.
┗━━━━━━━━━━━━━━━◈`
      );
    }
  }
};
