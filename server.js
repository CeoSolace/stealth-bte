const express = require('express');
const next = require('next');
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const mongoose = require('mongoose');
const { connectToDatabase } = require('./lib/mongodb');
const { User } = require('./models/User');
const { Transaction } = require('./models/Transaction');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Discord Bot Setup
const bot = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Command Collection
bot.commands = new Collection();

// Discord Commands
const transferCommand = {
  name: 'transfer',
  description: 'Transfer coins to another user',
  async execute(message, args) {
    const [targetUserId, amount] = args;
    const senderId = message.author.id;
    
    if (!targetUserId || !amount || isNaN(amount) || amount <= 0) {
      return message.reply('Usage: /transfer <user_id> <amount>');
    }

    try {
      const sender = await User.findOne({ discordId: senderId });
      const target = await User.findOne({ discordId: targetUserId });

      if (!sender) return message.reply('You are not registered in the system.');
      if (!target) return message.reply('Target user not found.');

      if (sender.coins < amount) {
        return message.reply('Insufficient coins.');
      }

      // Transfer coins
      await User.updateOne({ discordId: senderId }, { $inc: { coins: -amount } });
      await User.updateOne({ discordId: targetUserId }, { $inc: { coins: amount } });

      // Create transaction record
      const transaction = new Transaction({
        type: 'discord_transfer',
        amount: parseInt(amount),
        from: sender._id,
        to: target._id,
        description: `Discord transfer from ${sender.username} to ${target.username}`
      });
      await transaction.save();

      message.reply(`Successfully transferred ${amount} coins to ${target.username}!`);
    } catch (error) {
      console.error('Transfer error:', error);
      message.reply('An error occurred during transfer.');
    }
  }
};

bot.commands.set('transfer', transferCommand);

bot.once(Events.ClientReady, () => {
  console.log('Discord bot is ready!');
});

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('/')) return;

  const [commandName, ...args] = message.content.slice(1).split(/ +/);
  const command = bot.commands.get(commandName);

  if (command) {
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.');
    }
  }
});

async function startServer() {
  await app.prepare();
  
  const server = express();
  server.use(express.json());

  // Connect to MongoDB
  await connectToDatabase();

  // Discord Bot Login
  await bot.login(process.env.DISCORD_BOT_TOKEN);

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
