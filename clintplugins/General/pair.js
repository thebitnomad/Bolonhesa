const {
    default: Toxic_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    const formatStylishReply = (msg) => (
        `◈━━━━━━━━━━━━━━━━◈
│❒ ${msg}
◈━━━━━━━━━━━━━━━━◈`
    );

    try {
        const safePrefix = prefix || '.';

        if (!text) {
            return await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Por favor, informe um número para gerar o código de pareamento.\n\nExemplo:\n*${safePrefix}pair 5511999999999*`
                    )
                },
                { quoted: m }
            );
        }

        const number = text.replace(/[^0-9]/g, '');
        if (number.length < 6 || number.length > 20) {
            return await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        'Número inválido. Envie um número de WhatsApp válido com entre 6 e 20 dígitos.'
                    )
                },
                { quoted: m }
            );
        }

        // Criar pasta temporária para a sessão
        const tempPath = path.join(__dirname, 'temps', number);
        if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath, { recursive: true });

        // Configuração Baileys
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(tempPath);

        const Toxic_MD_Client = Toxic_Tech({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['Ubuntu', 'Chrome'],
            syncFullHistory: false,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
        });

        Toxic_MD_Client.ev.on('creds.update', saveCreds);

        await delay(1500);
        const code = await Toxic_MD_Client.requestPairingCode(number);

        if (!code) throw new Error('Não foi possível obter o código de pareamento.');

        // Enviar código de pareamento com botões de ação
        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: formatStylishReply('Código de Pareamento Toxic-MD'),
                    title: `◈━━━━━━━━━━━━━━━━◈
│❒ Código de pareamento para: *${number}*
│❒
│❒ Use este código no WhatsApp para conectar o bot:
│❒ > ${code}
│❒
│❒ Toque no botão abaixo para ver o guia de uso. 👇
◈━━━━━━━━━━━━━━━━◈`,
                    footer: formatStylishReply('Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ'),
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Copiar código de pareamento',
                                id: `copy_${Date.now()}`,
                                copy_code: code,
                            }),
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Abrir guia de pareamento',
                                url: 'https://youtube.com/shorts/0G_lBt7DhWI?feature=share',
                            }),
                        },
                    ],
                },
            },
            { quoted: m }
        );

        await Toxic_MD_Client.ws.close();
        setTimeout(() => {
            if (fs.existsSync(tempPath)) {
                fs.rmSync(tempPath, { recursive: true, force: true });
            }
        }, 5000);
    } catch (error) {
        console.error('Error in pair command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `Não foi possível gerar o código de pareamento.\n\nDetalhes: ${error.message}\n\nSe o erro continuar, consulte:\nhttps://github.com/xhclintohn/Toxic-MD`
                )
            },
            { quoted: m }
        );
    }
};
