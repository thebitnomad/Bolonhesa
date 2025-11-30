const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menusettings',
  aliases: ['configuracoes'],
  description: 'Comandos de configurações',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Settings').filter(file => file.endsWith('.js'));
    
    let menuText = `*🛠️ COMANDOS DE CONFIGURAÇÕES*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};