const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, prefix, pict, botname } = context;

    const formatStylish = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!botname) {
        console.error(
            formatStylish('Configuração ausente: o nome do bot (botname) não foi definido no contexto.')
        );
        return m.reply(
            formatStylish('Houve um problema com a configuração do bot. O nome do bot não está definido no contexto. Peça ao desenvolvedor para ajustar isso.')
        );
    }

    if (!pict) {
        console.error(
            formatStylish('Configuração ausente: nenhuma imagem (pict) foi fornecida no contexto.')
        );
        return m.reply(
            formatStylish('Não encontrei nenhuma imagem configurada para o comando. Verifique a configuração e tente novamente.')
        );
    }

    try {
        const caption = `◈━━━━━━━━━━━━━━━━◈
│❒ Olá, ${m.pushName}! *${botname}* está online e pronto para ajudar. 😄
│❒ 
│❒ Envie *${prefix}menu* para ver tudo o que posso fazer.
◈━━━━━━━━━━━━━━━━◈
│❒ Powered by 9bot.com.br
◈━━━━━━━━━━━━━━━━◈`;

        // Tratamento da imagem (pict)
        let imageOptions;
        if (Buffer.isBuffer(pict)) {
            console.log(
                formatStylish('[ALIVE-DEBUG] A imagem (pict) é um Buffer, salvando em arquivo temporário.')
            );
            const tempImagePath = path.join(__dirname, `temp_alive_image_${Date.now()}.jpg`);
            try {
                fs.writeFileSync(tempImagePath, pict);
                imageOptions = { url: tempImagePath };
            } catch (err) {
                console.error(
                    formatStylish(
                        `Erro ao salvar a imagem temporária: ${err.message}`
                    )
                );
                throw new Error(`Não foi possível processar a imagem enviada: ${err.message}`);
            }
        } else if (typeof pict === 'string') {
            console.log(formatStylish(`[ALIVE-DEBUG] pict é uma string: ${pict}`));
            // Verificar se é URL ou caminho de arquivo válido
            if (pict.startsWith('http://') || pict.startsWith('https://') || fs.existsSync(pict)) {
                imageOptions = { url: pict };
            } else {
                throw new Error(`Caminho ou URL de imagem inválido: ${pict}`);
            }
        } else {
            throw new Error(`Tipo de dado inesperado para pict: ${typeof pict}`);
        }

        // Enviar imagem com legenda
        await client.sendMessage(
            m.chat,
            {
                image: imageOptions,
                caption,
                mentions: [m.sender]
            },
            { quoted: m }
        );

        // Remover imagem temporária (se tiver sido criada localmente)
        if (imageOptions.url && imageOptions.url.startsWith(__dirname)) {
            try {
                fs.unlinkSync(imageOptions.url);
                console.log(
                    formatStylish(`[ALIVE-DEBUG] Arquivo temporário removido: ${imageOptions.url}`)
                );
            } catch (err) {
                console.error(
                    formatStylish(
                        `Falha ao remover a imagem temporária: ${err.message}`
                    )
                );
            }
        }

        // Possíveis caminhos do áudio
        const possibleAudioPaths = [
            path.join(__dirname, 'xh_clinton', 'test.mp3'),
            path.join(process.cwd(), 'xh_clinton', 'test.mp3'),
            path.join(__dirname, '..', 'xh_clinton', 'test.mp3')
        ];

        let audioFound = false;
        for (const audioPath of possibleAudioPaths) {
            console.log(formatStylish(`[ALIVE-DEBUG] Verificando caminho do áudio: ${audioPath}`));
            try {
                if (fs.existsSync(audioPath)) {
                    await client.sendMessage(
                        m.chat,
                        {
                            audio: { url: audioPath },
                            ptt: true,
                            mimetype: 'audio/mpeg',
                            fileName: 'alive-note.mp3'
                        },
                        { quoted: m }
                    );
                    audioFound = true;
                    console.log(
                        formatStylish(`[ALIVE-DEBUG] Áudio enviado a partir de: ${audioPath}`)
                    );
                    break;
                } else {
                    console.log(
                        formatStylish(`[ALIVE-DEBUG] Áudio não encontrado em: ${audioPath}`)
                    );
                }
            } catch (err) {
                console.error(
                    formatStylish(
                        `Erro ao enviar o áudio a partir de ${audioPath}: ${err.message}`
                    )
                );
            }
        }

        if (!audioFound) {
            console.error(
                formatStylish(
                    'Arquivo de áudio não foi encontrado em nenhum dos caminhos configurados.'
                )
            );
            await m.reply(
                formatStylish(
                    `Não consegui localizar a nota de voz configurada, ${m.pushName}.
│❒ Verifique o arquivo em: xh_clinton/test.mp3 e tente novamente.`
                )
            );
        }
    } catch (error) {
        console.error(
            formatStylish(
                `Erro no comando ALIVE: ${error.message}`
            )
        );
        await m.reply(
            formatStylish(
                `Opa, algo deu errado ao executar o comando de status, ${m.pushName}.
│❒ Detalhes: ${error.message}
│❒ Tente novamente em alguns instantes.`
            )
        );
    }
};
