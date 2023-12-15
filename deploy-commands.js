// ライブラリ インポート
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

// 接続情報
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENTID;
const guildId = process.env.DISCORD_GUILDID;
// const { clientId, guildId, token } = require('./config.json');

// スラッシュコマンド読み込み
const commands = [];
// フォルダ読み込み
const foldersPath = path.join(__dirname, 'commands');
// console.log(foldersPath);
const commandFolders = fs.readdirSync(foldersPath).filter(file => file.endsWith('utility'));
// console.log(commandFolders);

for (const folder of commandFolders) {
    // フォルダ内ファイル読み込み
    const commandsPath = path.join(foldersPath, folder);
    console.log(commandsPath);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    console.log(commandFiles);
    // コマンドファイル内のスラッシュコマンドを取り出し、commandsリストに保管する
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        console.log(filePath);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// console.log(commands);

// RESTモジュールの準備
const rest = new REST().setToken(token);

// スラッシュコマンドの登録を実行
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // commandsリストに保管されたスラッシュコマンドが全て登録される
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // 登録失敗時のエラーログ
        console.error(error);
    }
})();