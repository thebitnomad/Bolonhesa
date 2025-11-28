const { DateTime } = require('luxon');
const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menu',
  aliases: ['allmenu', 'commandslist'],
  description: 'Exibe o menu completo de comandos do bot por categoria',
  run: async (context) => {
    const { client, m, totalCommands, mode, pict } = context;
    const botname = '9bot'; 

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const categories = [
      { name: 'General', display: 'GERAL', emoji: '📜' },
      { name: 'Settings', display: 'CONFIGURAÇÕES', emoji: '🛠️' },
      { name: 'Owner', display: 'DONO', emoji: '👑' },
      { name: 'Heroku', display: 'HEROKU', emoji: '☁️' },
      { name: 'Wa-Privacy', display: 'PRIVACIDADE', emoji: '🔒' },
      { name: 'Groups', display: 'GRUPOS', emoji: '👥' },
      { name: 'AI', display: 'INTELIGÊNCIA ARTIFICIAL', emoji: '🧠' },
      { name: 'Media', display: 'MÍDIA', emoji: '🎬' },
      { name: 'Editting', display: 'EDIÇÃO', emoji: '✂️' },
      { name: 'Logo', display: 'LOGO', emoji: '🎨' },
      { name: '+18', display: '+18', emoji: '🔞' },
      { name: 'Utils', display: 'UTILITÁRIOS', emoji: '🔧' }
    ];

    const getGreeting = () => {
      const currentHour = DateTime.now().setZone('Africa/Nairobi').hour;
      if (currentHour >= 5 && currentHour < 12) return 'Bom dia';
      if (currentHour >= 12 && currentHour < 18) return 'Boa tarde';
      if (currentHour >= 18 && currentHour < 22) return 'Boa noite';
      return 'Boa madrugada';
    };

    const getCurrentTimeInNairobi = () => {
      return DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);
    };

    const toFancyFont = (text, isUpperCase = false) => {
      const fonts = {
        'A': '𝘼','B': '𝘽','C': '𝘾','D': '𝘿','E': '𝙀','F': '𝙁','G': '𝙂','H': '𝙃','I': '𝙄','J': '𝙅','K': '𝙆','L': '𝙇','M': '𝙈',
        'N': '𝙉','O': '𝙊','P': '𝙋','Q': '𝙌','R': '𝙍','S': '𝙎','T': '𝙏','U': '𝙐','V': '𝙑','W': '𝙒','X': '𝙓','Y': '𝙔','Z': '𝙕',
        'a': '𝙖','b': '𝙗','c': '𝙘','d': '𝙙','e': '𝙚','f': '𝙛','g': '𝙜','h': '𝙝','i': '𝙞','j': '𝙟','k': '𝙠','l': '𝙡','m': '𝙢',
        'n': '𝙣','o': '𝙤','p': '𝙥','q': '𝙦','r': '𝙧','s': '𝙨','t': '𝙩','u': '𝙪','v': '𝙫','w': '𝙬','x': '𝙭','y': '𝙮','z': '𝙯'
      };
      return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    // Even though menuText is created, you asked for NO TEXT output.
    // It is kept here only to avoid breaking the plugin logic.
    let menuText = "";

    let commandCount = 0;
    for (const category of categories) {
      let commandFiles = fs
        .readdirSync(`./clintplugins/${category.name}`)
        .filter(file => file.endsWith('.js'));

      if (commandFiles.length === 0 && category.name !== '+18') continue;

      if (category.name === '+18') {
        const plus18Commands = ['xvideo'];
        for (const cmd of plus18Commands) {
          const fancyCommandName = toFancyFont(cmd);
          commandCount++;
        }
      }

      for (const file of commandFiles) {
        const commandName = file.replace('.js', '');
        const fancyCommandName = toFancyFont(commandName);
        commandCount++;
      }
    }

    // **OUTPUT** → Buttons only
    await client.sendMessage(
      m.chat,
      {
        text: "",
        footer: "",
        buttons: [
          { buttonId: ".settings", buttonText: { displayText: "⚙ SETTINGS" }, type: 1 },
          { buttonId: ".fullmenu", buttonText: { displayText: "📜 FULL MENU" }, type: 1 },
          { buttonId: ".support", buttonText: { displayText: "🛠 SUPPORT" }, type: 1 }
        ],
        headerType: 1,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: `Toxic-MD`,
            body: `Open Dashboard`,
            thumbnail: pict,
            sourceUrl: `https://toxicmd.site`,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );
  }
};