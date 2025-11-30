const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menuplus18',
  aliases: ['+18'],
  description: 'Comandos +18',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    let menuText = `*🔞 COMANDOS +18*\n\n`;
    menuText += `• ${prefix}xvideo\n`;
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};