const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menugeral',
  aliases: ['geral'],
  description: 'Comandos gerais',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/General').filter(file => file.endsWith('.js'));
    
    let menuText = `*📜 COMANDOS GERAIS*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};