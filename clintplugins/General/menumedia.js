const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menumedia',
  aliases: ['midia'],
  description: 'Comandos de mídia',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Media').filter(file => file.endsWith('.js'));
    
    let menuText = `*🎬 COMANDOS DE MÍDIA*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};