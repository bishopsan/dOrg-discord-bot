# What Is It
A discord bot to fetch some details from the dOrg DAO. Currently it has the ability to fetch details about the dao itself and individual users rep by address. Being a half day project I didnt add a large amount of functionality. 

Notice: This discord bot uses ! as the command initializer. 


# How To Use It

1. Clone the repo with $ git clone [PATH TO REPO]
2. Obtain discord auth token and added bot to server.
    
    1. Go to the Discord Developer Portal and click the “New Application” button.
        
        Portal: https://discordapp.com/developers/applications/


    2. Next you’ll be prompted to give your application (bot) a name.

    3. Add Your Discord Application Icon and Description if you want to.

    4. Retrieve Your Token
        
        1. On the left side of the screen and click “Bot”.

        2. Click the blue “Add Bot” button

        3. Click the “Yes, do it!” button

        4. You’ll see a blue link you can click called “Click to Reveal Token". 

        5. Paste your token in the token.json file. 

        6. Remember: Protect Your Token!


    5. Add Your Bot to a Discord Server
        1. Navigate back to the “OAuth2” tab.

        2. Scroll down to the “Oauth2 URL Generator” section. In the “Scopes” section, you’ll want to select the “bot” checkbox.

        3. You’ll notice that a URL appeared as soon as you clicked “bot” — this will be your URL for adding your bot to a server.

        4. Scroll down some more to the “Bot Permissions” section. This is where you choose what permissions to give your bot, and what it can and can’t do.

        5. Set permissions. (We dont need any for this demo bot)

        6. After you’ve selected your permissions, scroll up a little bit and look at the URL that was generated. Click the blue “Copy” button on the right side. This is the URL you’ll navigate to in order to add your bot to a server.

        7. Go to that URL. Here you’ll need to select the server you’re adding your bot to.

             Success! You Bot has been authorized and added to server.
3. Run `node index.js` to start the bot. 

# How To Use Commands 

## !ping
Use command `!ping` to test if the bot is online and its response time.

Example:    
![Example ping result](https://media.discordapp.net/attachments/479399481759236100/820889828915675186/unknown.png)

## !dao
Use command `!dao` to fetch details about the dao. 

It defaults to the dOrg DAO, but you can also use command `!dao [DAO ADDRESS]` to fetch details about a different dao.

Example:
![Example dao result](https://media.discordapp.net/attachments/479399481759236100/820889371749122058/unknown.png)


## !rep
Use command `!rep [ADDRESS]` to fetch the rep details about a user. 

Example:
![Example rep result](https://media.discordapp.net/attachments/479399481759236100/820889507363946526/unknown.png)
