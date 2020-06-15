const express= require('express');
const request = require('request');
const bodyParser = require('body-parser');
const moment = require('moment');
const mysql = require('mysql')


const app= express();
app.use(bodyParser.json())

//Routes
app.get('/',(req, res) =>{
    res.send("Hello world")
})

app.get('/access_token',access,(req, res) =>{
    res.status(200).json({access_token : req.access_token})
})

app.get('/register', access, (req, resp) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization" :auth
            },
            json: {
                "ShortCode": "600586",
                "ResponseType": "Complete",
                "ConfirmationURL": "http://67.205.145.74/confirmation",
                "ValidationURL": "http://67.205.145.74/validation_url"
            }
        },
        function(error, response,body){
            if(error){
                console.log(error)
            }
            resp.status(200).json(body)
        }
    )
})

app.post('/confirmation',(req,res) => {
    console.log('.............confirmation.........');
    console.log(req,body)
})

app.post('/validation', (req, resp) => {
    console.log('.............validation.........');
    console.log(req,body)
})

app.get('/simulate',access, (req,res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            }, 
            json: {
                "ShortCode":"600586",
                "CommandID":"CustomerPayBillOnline",
                "Amount":"1",
                "Msisdn":"254708374149",
                "BillRefNumber":"TestApi"
            }
            },
            function(error, response, body){
                if(error){
                    console.log(error)
                } else {
                    res.status(200).json(body)
                }
            }
        
    )
})

//Balance
app.get('/balance',access,(req,res) => {
    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: endpoint,
            mehtod: "POST",
            headers: {
                "Authorization" : auth
            },
            json:{
                "Initiator":"apitest342",
                "SecurityCredential":" ",
                "CommandID":"AccountBalance",
                "PartyA":"600586",
                "IdentifierType":"4",
                "Remarks":" ",
                "QueueTimeOutURL":"http://67.205.145.74/timeout_url",
                "ResultURL":"http://67.205.145.74/result_url"
            }
        },
        function(error, response, body){
            if(error) {
                console.log(error)
            } else{
                res.status(200).json(body)
            }
        }
    )
})

app.post('/timeout_url',(req, resp) => {
    console.log("---------Balance timeout response--------")
    console.log(req.body)
})

app.post('/result_url',(req, resp) => {
    console.log("---------Balance response--------")
    console.log(req.body.ResultParamaters)
})

//STK push
app.get('/stk',access,(req,res) => {
    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    let auth = "Bearer " + req.access_token

    // let datenow = new Date()
    // const timestamp = datenow.getFullYear() + "" + "" + datenow.getMonth() + "" + "" + datenow.getDate() + "" + "" + datenow.getHours() + "" + "" + datenow.getMinutes() + "" + "" + datenow.getSeconds()
    let timestamp = moment().format('YYYYMMDDHHmmss')

    const password =new Buffer.from("174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp).toString('base64')

    request(
        {
            url: endpoint,
            method: "POST",
            headers : {
                "Authorization" : auth
            },
            json: {
                "BusinessShortCode": "174379",
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": "254703911252",
                "PartyB": "174379",
                "PhoneNumber": "254703911252",
                "CallBackURL": "http://67.205.145.74/stk_callback",
                "AccountReference": "123Test",
                "TransactionDesc": "Process Activation"
            }
        },
        function(error, response, body){
            if(error){
                console.log(error)
            }
            res.status(200).json(body)
        }
    )
})

app.post('/stk_callback',(req, res) => {
    console.log('---------STK-------')
    console.log(req.body)
})
//Middleware
function access (req, res, next){
//access token
let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" 
let auth = new Buffer.from("G4ovEEQDtJ0csgk89Kx6Hieb9Vhcs0Oc:5ZWCG0AlVkfTjac0").toString('base64');
request(
    {
        url: url,
        headers: {
            "Authorization": "Basic " + auth
        }
    },
    (error, response, body) => {
        if(error){
            console.log(error)
        } else{
            //let resp=
            req.access_token = JSON.parse(body).access_token
            next()
        }
    }
)
}

//Listen
app.listen(8000);
// app.listen(3000,(err, live) => {
//     if(err){
//         console.error(err)
//     }

//     console.log("Sever running on port 3000")
// });