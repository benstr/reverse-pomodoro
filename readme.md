# Reverse Pomodoro Bot

## What is this?

I love the idea of the Pomodoro method to productivity. If you have no idea what that is, I will encourage you to find its Wikipedia (I'm too lazy to include the link here). 

The basic idea is to write a list of prioritized tasks. Start a 25-minute timer and start the top task. Try to stay focused on completing only on that task for the entire 25 minutes. After 25 minutes take a 5-minute break to catch up on the world. After the break start another timer and work on the next task exclusively. Repeat.

For me, the classical Pomodoro method does not work. I have a very dynamic job, with interruptions being part of it. To some success, I minimize interruptions but inevitably more than five interruptions/fires find their way into my day. That is where the classic Pomodoro method fails me. After the 3rd or 4th interruption, it's seemingly impossible for me to maintain my Pomodoros. They get abandoned and my day spins into chaos. 

With Reverse Pomodoro it acts more like an automatic diary where all I need to do is record what I do every 30 minutes. This helps me stay in the "Pomodoro" mindset even after an interruption. If one block of time goes by and I have nothing to record then I record "did nothing of value." That is usually enough to snap me out of chaos and save my day.

At the end of the day When I end the Reverse Pomodoro script, it returns an ordered list of all I accomplished that day. I can then check how I did and verify I worked on what I needed to.

## How to use this

I have a RaspberryPi hosting a web server exposed to the world. My interface is SMS powered by Twilio.

Each day I text `on` to the bot. This triggers the bot to send me a message every 25 minutes. It asks me to reply with the tasks I completed during the last 25 minutes then suggests a 5-minute break.

Each time I send a string describing my task it receives a timestamp and saved in the bot's memory. 

At the end of the day, I text `off` to the bot. This turns off the timers and returns a list of all the tasks I completed that day. Also, all bot memory is wiped and ready for the next day.

TODO: Eventually I'd like to integrate this with Evernote where each day a new note is created. Every time I record a task, it is appended to the note.

## How to install this

1. Git clone
2. npm install
1. Get a Twilio phone number
1. Update environment variables in `.env`  
1. Test it out locally with [ngrok](https://ngrok.com/) by running `npm start`
1. Set the Twilio inbound SMS webhook to your ngrok URL + `/reverse-pomodoro/sms`
1. Does it work? Great, move on.
1. Fire up a fresh Raspberry Pi on your local network
1. SSH into the Pi and install the latest NodeJS (see below)
1. FTP into the Pi and upload the Node app or git clone and update env on the device
1. From your router port-forward port 80 to your RaspberryPi's port 8080
1. Update the Twilio webhook URL with your networks public IP
1. Refer below for instructions to add a startup Service on the Pi

### Installing NodeJS on the Raspberry Pi

```
# Remove outdated Debian package (`node -v` ==> v4.8.2)
sudo apt-get remove nodejs nodejs-legacy nodered
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs

# Now the versions are:  nodejs: v9.3.0  npm: v5.5.1 --> npm need update
sudo npm install npm@latest -g

# Then install these useful tools: 
sudo npm install -g node-gyp
sudo npm install -g npm-check
sudo npm install -g npm-check-updates

# If needed, you can re-install node-red with:
sudo npm install -g --unsafe-perm node-red
```

### Setup a startup Service on the Pi

Check out the `pomodoro.service` file in this repo. This will be used to configure the Pi to run this app at startup.

Put that file into /etc/systemd/system/propanel.service. Make sure it is readable/writeable/executable by root:

```
$ sudo cp   pomodoro.service  /etc/systemd/system/
$ sudo chmod u+rwx /etc/systemd/system/pomodoro.service
```

Now enable the service with a systemd command and it will be run at boot time.

```
$ sudo systemctl enable  pomodoro
```

To run the app immediately run the following command:

```
$ sudo systemctl start  pomodoro
```

To ensure it is running or to see an error log run the status command.

```
$ sudo systemctl status  pomodoro
```

If everything is green then you should be able to interact with the bot from anywhere in the world. 

Enjoy :)