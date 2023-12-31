const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const TAROT_JSON = fs.readFileSync('tarot.json') // jsonデータを読み込み
const TAROT_JSON_STRING = TAROT_JSON.toString() // データを文字列に変換
const TAROT = JSON.parse(TAROT_JSON_STRING) //JSONのデータをJavascriptのオブジェクトに変換
// const USER_LAST_FT_DATE_LIST = new Map(); // ユーザー毎の最後の占い日を記録

// シャッフル関数を作成(Fisher-Yates シャッフルアルゴリズム)
function ft_shuffle(min, max) {
    // 整数の配列を生成
    const array = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  
    // Fisher-Yates シャッフルアルゴリズムを使用して配列をシャッフル
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  
    return array;
}
  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('one_oracle')
        .setDescription('ワンオラクルのタロット占いを実行する')
        .addStringOption((option) => option
            .setName('question')
            .setDescription('占いする事柄を事前に設定します')
            .setRequired(false) //trueで必須、falseで任意
        ),

    async execute(interaction) {
        // const user_id = interaction.user.id;
        const user_name = interaction.member.displayName;
        const question = interaction.options.getString("question") ?? '今日の運勢';
    
        // ユーザーの最後のおみくじ引き日を取得
        // const last_ft_date = USER_LAST_FT_DATE_LIST.get(user_id);
    
        // if (last_ft_date) {
        //     // 現在の日付を取得
        //     const current_date = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    
        //     // 最後の占い日と現在の日付を比較
        //     if (last_ft_date.getDay() >= current_date.getDay()) {
        //         await interaction.reply("同じ占いは1日に1回しか出来ません😌");
        //         return;
        //     }
        // }
    
        // 占いの実行
        const card = ft_shuffle(0, TAROT.length-1)

        const image1 = new AttachmentBuilder()
            .setName(TAROT[card[0]].イメージ)
            .setFile(`img/${TAROT[card[0]].イメージ}`)

        await interaction.reply({
            content : `# [ワンオラクル]\n質問：${question}\n${user_name}の占い結果🔮は...\n\n## [結果]\n**${TAROT[card[0]].カード名}**： \n➡︎「${TAROT[card[0]].意味}」`,
            files: [image1] 
        });
    
        // ユーザーの最後の占い日を更新
        // USER_LAST_FT_DATE_LIST.set(user_id, new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    },
};