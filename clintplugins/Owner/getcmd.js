const fs = require('fs').promises;

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    try {
        // Restrito apenas ao número do dono
        const allowedNumber = '254735342808@s.whatsapp.net';
        if (m.sender !== allowedNumber) {
            return await client.sendMessage(m.chat, {
                text: `❌ *Acesso negado!*  
Este comando é restrito ao proprietário do bot.

◈━━━━━━━━━━━━━━━━◈
> Powered by *9bot*`
            }, { quoted: m });
        }

        if (!text) {
            return await client.sendMessage(m.chat, {
                text: `📜 *Por favor, informe o nome do comando!*  
Exemplo: *${prefix}getcmd* ou *${prefix}cmd ping*

◈━━━━━━━━━━━━━━━━◈
> Powered by *9bot*`
            }, { quoted: m });
        }

        const categories = [
            { name: 'General' },
            { name: 'Settings' },
            { name: 'Owner' },
            { name: 'Heroku' },
            { name: 'Wa-Privacy' },
            { name: 'Groups' },
            { name: 'AI' },
            { name: '+18' },
            { name: 'Logo' },
            { name: 'Search' },
            { name: 'Coding' },
            { name: 'Media' },
            { name: 'Editing' },
            { name: 'Utils' }
        ];

        let fileFound = false;
        const commandName = text.endsWith('.js') ? text.slice(0, -3) : text;

        for (const category of categories) {
            const filePath = `./clintplugins/${category.name}/${commandName}.js`;

            try {
                const data = await fs.readFile(filePath, 'utf8');
                const replyText = `✅ *Arquivo do comando:* ${commandName}.js

\`\`\`javascript
${data}
\`\`\`

◈━━━━━━━━━━━━━━━━◈
> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;

                await client.sendMessage(m.chat, { text: replyText }, { quoted: m });
                fileFound = true;
                break;
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    await client.sendMessage(m.chat, {
                        text: `⚠️ *Erro ao ler o arquivo do comando:* ${err.message}

◈━━━━━━━━━━━━━━━━◈
> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`
                    }, { quoted: m });
                    return;
                }
            }
        }

        if (!fileFound) {
            await client.sendMessage(m.chat, {
                text: `❌ *Comando não encontrado:* ${commandName}

Tente um nome de comando válido.

◈━━━━━━━━━━━━━━━━◈
> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error in getcmd command:', error);
        await client.sendMessage(m.chat, {
            text: `⚠️ *Ops! Não foi possível processar o comando:*  
${error.message}

◈━━━━━━━━━━━━━━━━◈
Powered by *9bot*`
        }, { quoted: m });
    }
};
