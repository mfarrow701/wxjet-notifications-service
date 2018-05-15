const app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    moment = require('moment'),
    uuid4 = require('uuid/v4');

io.set('origins', '*:*');
server.listen(3001);

const warnings = ['Rain', 'Wind', 'Visibility'], conditions = ['dry', 'damp', 'wet', 'flooded'],
    warningStates = ['#9932CC', '#FF0000', '#FF8C00', '#008000'], conditionStates = ['#ff1493', '#40e0d0', '#ff9800', '#607d8b'];

app.get('/', (req, res) => {
    res.send('<h1>WxJet Notifications Service</h1>')
});

app.get('/sse-notifications', (req, res) => {
    console.log('An application has subscribed to the SSE notifications service');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    setInterval(() => {
        generateSEENotification(req, res);
    }, 15000);
    generateSEENotification(req, res);
});

io.on('connection', function (socket) {
    console.log('Connection from ' + socket.handshake.headers.host + ' received at: ' + socket.handshake.time);

    socket.on('subscribeToNotifications', () => {
        console.log('An application has subscribed to the socket notifications service');
        setInterval(() => {
            socket.emit('notification', generateSocketNotification());
        }, 12000);
        socket.emit('notification', generateSocketNotification());
    });

    socket.on('disconnect', () => {
        console.log('An application has un-subscribed to the notifications service');
    })
});

const generateSEENotification = (req, res) => {
    const warningId = uuid4(),
        data = {
            message: 'Runway condition is ' + conditions[Math.floor(Math.random() * conditions.length)],
            colourState: conditionStates[Math.floor(Math.random() * conditionStates.length)]
        };
    res.write('id: ' + warningId + '\n');
    res.write('data: ' + JSON.stringify(data) + '\n\n');
};

const generateSocketNotification = () => {
    const warningId = uuid4(),
        dateTimeNow = moment().format('MMMM Do YYYY, h:mm:ss a'),
        notifications = [{
            warningId: warningId,
            date: dateTimeNow,
            colourState: warningStates[0],
            message: warnings[Math.floor(Math.random() * warnings.length)] + ' threshold limits exceeded'
        }, {
            warningId: warningId,
            date: dateTimeNow,
            colourState: warningStates[1],
            message: warnings[Math.floor(Math.random() * warnings.length)] + ' threshold limits reached'
        }, {
            warningId: warningId,
            date: dateTimeNow,
            colourState: warningStates[2],
            message: warnings[Math.floor(Math.random() * warnings.length)] + ' threshold limits marginal'
        }, {
            warningId: warningId,
            date: dateTimeNow,
            colourState: warningStates[3],
            message: warnings[Math.floor(Math.random() * warnings.length)] + ' threshold limits OK'
        }];
    return notifications[Math.floor(Math.random() * notifications.length)];
};
