const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands', 'list'],
  description: 'Exibe o menu de comandos do 9bot com botões interativos',
  run: async (context) => {
    const { client, m, mode, pict, botname, text, prefix } = context;

    // Resposta quando o usuário digita algo além do comando
    if (text) {
      await client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈
│❒ Yo ${m.pushName}, pra que complicar?
│❒ É só usar *${prefix}menu* e tá tudo certo. 😉
◈━━━━━━━━━━━━━━━━◈`,
        },
        { quoted: m, ad: true }
      );
      return;
    }

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '.'; // Prefixo dinâmico do banco

    // Texto do menu principal
    const menuText =
      `◈━━━━━━━━━━━━━━━━◈
│❒ *( 💬 ) - Olá, @${m.pushName}*
│❒ Bem-vindo ao menu do bot.
│❒ Aqui você vê o que o *${botname}* sabe fazer. 
◈━━━━━━━━━━━━━━━━◈

- 計さ INFORMAÇÕES DO BOT ✓

⌬ *Bot*:
9bot

⌬ *Prefixo*:
${effectivePrefix} (decora isso direitinho 😌)

⌬ *Modo*:
${mode} ( ! )

◈━━━━━━━━━━━━━━━━◈

( ! ) *Use os botões abaixo ou digite os comandos manualmente.*`;

    // Use template buttons instead of nativeFlowMessage for better compatibility
    await client.sendMessage(
      m.chat,
      {
        image: { url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0&mms3=true' },
        caption: menuText,
        footer: `Powered by ${botname}`,
        templateButtons: [
          {
            index: 1,
            urlButton: {
              displayText: '🌐 Website',
              url: 'https://9bot.com.br'
            }
          },
          {
            index: 2,
            quickReplyButton: {
              displayText: '📋 Full Menu',
              id: `${prefix}fullmenu`
            }
          },
          {
            index: 3,
            quickReplyButton: {
              displayText: '👨‍💻 Dev',
              id: `${prefix}dev`
            }
          },
          {
            index: 4,
            quickReplyButton: {
              displayText: '📊 Status',
              id: `${prefix}ping`
            }
          },
          {
            index: 5,
            quickReplyButton: {
              displayText: '⚙ Settings',
              id: `${prefix}settings`
            }
          }
        ],
        contextInfo: {
          externalAdReply: {
            title: `${botname}`,
            body: `Yo, ${m.pushName}! Bora ver o que o bot sabe fazer? 😈`,
            mediaType: 1,
            thumbnail: pict,
            sourceUrl: 'https://9bot.com.br',
            showAdAttribution: false,
            renderLargerThumbnail: true,
          },
        }
      },
      { quoted: m }
    );

    // Lógica de áudio aleatório
    const audioLinks = [
      'https://qu.ax/crnMP',
      'https://qu.ax/caeeD',
      'https://qu.ax/CXWfS',
      'https://qu.ax/ytTHs',
      'https://qu.ax/JGkPc',
      'https://qu.ax/aESvq',
    ];

    const randomAudio = audioLinks[Math.floor(Math.random() * audioLinks.length)];

    await client.sendMessage(
      m.chat,
      {
        audio: { url: randomAudio },
        ptt: true,
        mimetype: 'audio/mpeg',
        fileName: 'toxic-menu.mp3',
      },
      { quoted: m }
    );
  },
};