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

( ! ) *Selecione uma opção abaixo para continuar.*`;

    // Create native flow message with buttons for better iOS compatibility
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        nativeFlowMessage: {
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '📋 Full Menu',
                id: `${prefix}fullmenu`
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '👨‍💻 Dev',
                id: `${prefix}dev`
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '📊 Status',
                id: `${prefix}ping`
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '⚙ Settings',
                id: `${prefix}settings`
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Website',
                url: 'https://9bot.com.br'
              })
            }
          ],
          messageParamsJson: JSON.stringify({
            title: `${botname} - Menu Principal`,
            body: menuText,
            footer: `Powered by ${botname}`,
            limited_time_offer: {
              text: '9BOT',
              url: 'https://9bot.com.br',
              copy_code: '9BOT'
            }
          })
        }
      },
      { quoted: m }
    );

    await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    // Alternative approach: Send interactive message separately if native flow doesn't work
    try {
      // Send image with caption as fallback
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
            }
          ]
        },
        { quoted: m }
      );
    } catch (error) {
      console.log('Error sending interactive message:', error);
    }

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