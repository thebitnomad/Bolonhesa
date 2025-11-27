const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../message_data');

// Criar diretório base caso não exista
if (!fs.existsSync(baseDir)) {
    try {
        fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {
        console.error('Erro no Store: Falha ao criar o diretório /app/message_data:', e);
    }
}

function loadChatData(remoteJid, messageId) {
    const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
    try {
        const data = fs.readFileSync(chatFilePath, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        return [];
    }
}

function saveChatData(remoteJid, messageId, chatData) {
    const chatDir = path.join(baseDir, remoteJid);

    if (!fs.existsSync(chatDir)) {
        try {
            fs.mkdirSync(chatDir, { recursive: true });
        } catch (e) {
            console.error('Erro no Store: Falha ao criar diretório:', e);
        }
    }

    const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);

    try {
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
    } catch (error) {
        console.error('Erro no Store: Falha ao salvar dados do chat:', error);
    }
}

/**
 * Limpa arquivos antigos (padrão: mais de 24 horas)
 */
function cleanupOldMessages(maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
        const now = Date.now();

        // Varre cada pasta de remoteJid
        fs.readdirSync(baseDir).forEach(remoteJid => {
            const chatDir = path.join(baseDir, remoteJid);

            if (!fs.lstatSync(chatDir).isDirectory()) return;

            fs.readdirSync(chatDir).forEach(file => {
                const filePath = path.join(chatDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtimeMs > maxAgeMs) {
                        fs.unlinkSync(filePath);
                        // console.log(`Store: Arquivo antigo removido ${filePath}`);
                    }
                } catch (err) {
                    console.error('Erro no Store (Cleanup):', err);
                }
            });

            // Remove pasta se ficou vazia
            if (fs.readdirSync(chatDir).length === 0) {
                fs.rmdirSync(chatDir, { recursive: true });
            }
        });
    } catch (err) {
        console.error('Erro Fatal no Store (Cleanup):', err);
    }
}

module.exports = { loadChatData, saveChatData, cleanupOldMessages };
