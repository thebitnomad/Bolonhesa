const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menulogo',
  aliases: ['logo'],
  description: 'Comandos de logo',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Logo').filter(file => file.endsWith('.js'));
    
    let menuText = `*🎨 COMANDOS DE LOGO*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};