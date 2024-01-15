const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const TAROT_JSON = fs.readFileSync('tarot.json'); // jsonデータを読み込み
const TAROT_JSON_STRING = TAROT_JSON.toString(); // データを文字列に変換
const TAROT = JSON.parse(TAROT_JSON_STRING); //JSONのデータをJavascriptのオブジェクトに変換
const GEMINI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // GEMINIのAPIキー
const USER_LAST_FT_DATE_LIST = new Map(); // ユーザー毎の最後の占い日を記録
const USER_FT_CONTENT_LIST = new Map(); // ユーザー毎の当日の占い内容を記録

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
        const user_id = interaction.user.id;
        const user_name = interaction.member.displayName;
        const question = interaction.options.getString("question") ?? '今日の運勢';
        const model = GEMINI.getGenerativeModel({ model: "gemini-pro" });
    
        // ユーザーの最後のおみくじ引き日を取得
        const last_ft_date = USER_LAST_FT_DATE_LIST.get(user_id);
        // 現在の日付を取得
        const current_date = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    
        if (last_ft_date) {
            if (last_ft_date.getDay() >= current_date.getDay()) { // 本日占っていた場合
                if (USER_FT_CONTENT_LIST.get(user_id).includes(question)) { // 同じ占いをしていた場合
                    await interaction.reply("同じ事柄に関する占いは1日に1回しか出来ません😌");
                    return;   
                }
            } else { // 本日占っていなかった場合
                // ユーザーの当日の占い内容を記録するメモリを確保
                USER_FT_CONTENT_LIST.set(user_id, new Array());
            }
        } else { // 本日占っていなかった場合
            // ユーザーの当日の占い内容を記録するメモリを確保
            USER_FT_CONTENT_LIST.set(user_id, new Array());
        }
    
        // 占いの実行
        let initial_message = await interaction.channel.send({
            content : `# [ワンオラクル]\n質問：${question}\n${user_name}の占い結果🔮は...\n\n`
        });
        await interaction.deferReply({ content : "占い中🔮..." });

        const card = ft_shuffle(0, TAROT.length-1)

        const image1 = new AttachmentBuilder()
            .setName(TAROT[card[0]].イメージ)
            .setFile(`img/${TAROT[card[0]].イメージ}`)

        const prompt = `
            あなたはタロット占いの占い師です。
            今から以下の条件で{名前}さんのタロット占いをしてもらいます。

            1. ${user_name}さんは「${question}」について、占い師であるあなたに占ってほしいと思っています。
            2. あなたは占い師として、占い師らしい言葉遣いや振る舞いが求められています。
            3. そのために使用するタロット占い方法は「ワンオラクル」です。
            4. 今デッキがシャッフルされ、引かれたカードは「${TAROT[card[0]].カード名}」でした。そのカードの意味は「${TAROT[card[0]].意味}」でした。
            5. 質問を引かれたカードの意味に基づいて解釈し、占い結果を語りかけるように出力してください。必要に応じて与えられたカードの意味だけではなくあなたが持っているタロットカードの知識を活用しても構いません。
            6. 回答内容は質問を深掘りし、最後に具体的なアドバイスを授けるように心がけてください。
            7. 全体の文章は挨拶を含めて300字以内に留めてください。あまりにも長い占いは読み手が疲れてしまうので、これは厳守でお願いします。

            以下に占い例を挙げますので、参考にしてください。

            「ようこそ、お越しくださいましたね、〇〇さん。

            ××について占いをご希望とのこと。

            それでは、カードを引いてみましょう。

            ・・・

            はい、引かれました。金貨の1／ペンタクルのエース＿正位置です。

            このカードは「的確で理性的な批評」を意味します。

            今日のあなたは、物事を客観的に観察することができ、鋭い洞察力と判断力を働かせることができます。

            これは、仕事や勉学など、あらゆる分野において良い結果をもたらすでしょう。

            ただ、あまりにも批判的になりすぎないように注意してください。

            他人の欠陥ばかりに目を向けるのではなく、その人の良いところにも目を向けると、より良い人間関係を築くことができるでしょう。

            また、このカードは「新しい始まり」を意味することもあります。

            何か新しいことを始めようとしているなら、今日はその絶好の機会です。

            思い切って行動を起こしてみてくださいね。

            最後に、今日のアドバイスです。

            それは、「自分の直感を信じてください」ということです。

            あなたは、今日鋭い直感力を持っています。

            その直感を信じて行動を起こせば、きっと良い結果が得られるでしょう。

            では、良い一日をお過ごしください。」

            では、占い師GEMINIさん、よろしくお願いします🔮
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        await initial_message.delete();
        await interaction.editReply({
            content : `# [ワンオラクル]\n質問：${question}\n${user_name}の占い結果🔮は...\n\n## [結果]\n**${TAROT[card[0]].カード名}**： \n➡︎「${TAROT[card[0]].意味}」\n\n## [解説]\n${text}`,
            files: [image1] 
        });

        // ユーザーの最後の占い日を更新
        USER_LAST_FT_DATE_LIST.set(user_id, new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })));
        // ユーザーの当日の占い内容を記録
        USER_FT_CONTENT_LIST.get(user_id).push(question);
    },
};