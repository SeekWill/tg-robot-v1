import { Bot, webhookCallback, InlineKeyboard } from "https://deno.land/x/grammy@v1.20.0/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

const bot = new Bot(BOT_TOKEN);

// ========== 设置底部菜单按钮（命令列表） ==========
await bot.api.setMyCommands([
  { command: "start", description: "打开主菜单" },
  { command: "channels", description: "浏览频道" },
  { command: "list", description: "全部内容" },
  { command: "my", description: "已购内容" },
  { command: "help", description: "帮助" },
]);

// ========== /start 命令：发送内联键盘面板 ==========
bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("📺 浏览频道", "menu_channels")
    .row()
    .text("📋 全部内容 all", "menu_list")
    .row()
    .text("📦 已购内容", "menu_my")
    .row()
    .text("❓ 帮助", "menu_help");

  await ctx.reply("🎛️ 欢迎来到主菜单，请选择功能：", {
    reply_markup: keyboard,
  });
});

// 各命令的独立入口（底部菜单点击时触发）
bot.command("channels", async (ctx) => {
  await ctx.reply("📺 频道浏览功能开发中...");
});

bot.command("list", async (ctx) => {
  await ctx.reply("📋 内容列表功能开发中...");
});

bot.command("my", async (ctx) => {
  await ctx.reply("📦 已购内容功能开发中...");
});

bot.command("help", async (ctx) => {
  await ctx.reply("❓ 使用 /start 打开主菜单。");
});

// ========== 处理内联键盘按钮回调 ==========
bot.callbackQuery(/^menu_/, async (ctx) => {
  const action = ctx.callbackQuery.data;
  let text = "";
  switch (action) {
    case "menu_channels":
      text = "📺 频道浏览功能开发中...";
      break;
    case "menu_list":
      text = "📋 内容列表功能开发中...";
      break;
    case "menu_my":
      text = "📦 已购内容功能开发中...";
      break;
    case "menu_help":
      text = "❓ 使用 /start 打开主菜单。";
      break;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(text);
});

// 兜底处理
bot.on("message:text", async (ctx) => {
  await ctx.reply("发送 /start 打开主菜单。");
});

// 导出 fetch 处理器
const handle = webhookCallback(bot, "std/http");
export default {
  fetch(req: Request) {
    return handle(req);
  },
};
