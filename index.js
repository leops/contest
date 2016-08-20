const koa = require('koa');
const body = require('koa-body');

const twitter = require('./twitter');

const app = koa();

app.use(body());

app.use(function *() {
    if(this.request.method == 'GET') {
        this.body = `
            <!DOCTYPE html>
            <html lang="fr">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                    <title>Retweet Roulette</title>

                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.3/css/bootstrap.min.css" integrity="sha384-MIwDKRSSImVFAZCVLtU0LMDdON6KVCrZHyVQQj6e8wIEJkW4tvwqXrbMIya1vriY" crossorigin="anonymous">
                    <style>
                        h1 {
                            margin-top: 1em;
                        }

                        form {
                            display: flex;
                            flex-direction: column;
                        }

                        button {
                            align-self: center;
                        }

                        .container > *:not(:last-child) {
                            margin-bottom: 0.75em;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Retweet Roulette</h1>

                        <form>
                            <div class="form-group">
                                <input type="number" id="tweetID" class="form-control" placeholder="ID du Tweet" />
                            </div>
                            <div class="form-group">
                                <input type="number" id="userCount" class="form-control" placeholder="Nombre d'utilisateurs" />
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg">Go !</button>
                        </form>

                        <div class="list-group"></div>
                    </div>

                    <script>
                        const userList = document.querySelector('.list-group');

                        document.querySelector('form').addEventListener('submit', evt => {
                            evt.preventDefault();
                            userList.innerHTML = '';

                            fetch('/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: document.getElementById('tweetID').value,
                                    count: document.getElementById('userCount').value
                                })
                            }).then(res => {
                                if(res.ok) {
                                    return res.json();
                                }

                                throw new Error(res.statusText);
                            }).then(users => {
                                userList.innerHTML = users.map(id => \`<a href="http://twitter.com/intent/user?user_id=\${id}" class="list-group-item" target="_BLANK">\${id}</a>\`).join('');
                            }).catch(err => {
                                console.error(err);
                            });
                        }, false);
                    </script>
                </body>
            </html>
        `;
    } else {
        const users = yield new Promise(resolve => {
            twitter.fetchRTs(this.request.body.id, null, res => {
                const users = [];

                if(res.length <= this.request.body.count) {
                    return resolve(res);
                }

                while(users.length < this.request.body.count) {
                    const user = res[Math.floor(Math.random() * res.length)];
                    if(users.indexOf(user) === -1) {
                        users.push(user);
                    }
                }

                resolve(users);
            });
        });

        this.body = JSON.stringify(users);
    }
});

app.listen(3000);
