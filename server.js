require('dotenv').config({path: '/home/pi/reverse-pomodoro/.env'})
const http = require('http')
const moment = require('moment');
const express = require("express")
const bodyParser = require('body-parser')
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse

// TODO: eventually authenticate to evernote
// waiting for developer token to work again, https://dev.evernote.com/doc/articles/dev_tokens.php

const app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))

const workLength = 25
const breakLength = 5
const pomLength = workLength + breakLength
var blockTimer, blockTimerTime, restartTimer, taskLog = "", running = false

app.post("/reverse-pomodoro/sms", function (req, res) {
  const msg = req.body.Body

  switch(msg.toLowerCase()){
    case 'on':
      startBlockTimer()
      running = true
      taskLog += `${moment().format("dddd, MMMM Do YYYY")}\n`;
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.end(successResponse("Reverse Pomodoro Running"))
      break
    case 'off':
      clearTimeout(blockTimer)
      clearTimeout(restartTimer)
      sendSMS(taskLog)
      running = false
      taskLog = ""
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.end(successResponse("Reverse Pomodoro Stopped"))
      break
    default:
      if(running) {
        const timeString = blockTimerTime.toISOString()
        const time =`${moment(timeString).format('HH:mm')}-${moment(timeString).add(pomLength, 'minutes').format('HH:mm')}`
        taskLog += `${time} - ${msg}\n`
        res.writeHead(200, {'Content-Type': 'text/xml'})
        res.end(successResponse("Pomodoro task logged"))
      } else {
        res.writeHead(200, {'Content-Type': 'text/xml'})
        res.end(successResponse("Pomodoro not running! Text ON to start."))
      }
  }
})

http.createServer(app).listen(8080, () => {
  console.log('Express server listening on port 8080');
});

function successResponse(resMsg) {
  const twiml = new MessagingResponse();
  twiml.message(resMsg)
  console.log(resMsg)

  return twiml.toString()
}

function startBlockTimer() {
  blockTimerTime = new Date()
  blockTimer = setTimeout(() => {
    sendSMS(`This time block is ending.\nRespond with completed tasks.\nTake a ${breakLength} minute break.`)
    restartBlockTimer()
  }, minutes(workLength))
}

function restartBlockTimer() {
  restartTimer = setTimeout(() => {
    sendSMS("Starting new time block")
    startBlockTimer()
  }, minutes(breakLength))
}

function sendSMS(msg) {
  twilio.messages.create({
    body: msg,
    to: process.env.TO_NUMBER,
    from: process.env.TWILIO_NUMBER
  })
}

function minutes(minutes) {
  return minutes * 60000
}