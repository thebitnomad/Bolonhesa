const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menuheroku',
  aliases: ['heroku'],
  description: 'Comandos do Heroku',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Heroku').filter(file => file.endsWith('.js'));
    
    let menuText = `*☁️ COMANDOS DO HEROKU*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};