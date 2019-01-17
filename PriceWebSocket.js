import emitter, { Events } from 'clients/emitter';
import MessageUnmarshaller from 'utils/MessageUnmarshaller';
import fs from 'fs';

const PRICE_REALTIME_URL = 'ws://{server}/realtime/websocket';

class PriceWebSocket {
    constructor() {
        this.MESSAGES = {
            info: 'info',
            STOCK: 'STOCK',
            BA: 'BA',
            SP: 'SP',
            MARKETINFO: 'MARKETINFO',
            MI: 'MI',
            DERIVATIVE: 'DERIVATIVE',
            DERIVATIVE_OPT: 'DERIVATIVE_OPT',
            PLO: 'PLO'
        };

        this.SIGNALS = {
            PING: 'PING'
        };

        this.STATUSES = {
            CONNECTED: 'CONNECTED',
            DISCONNECTED: 'DISCONNECTED'
        };

        this.PING_INTERVAL = 20e3;

        this.registeredCode = {}
    }

    init(server) {
        let serverName = server.replace('https://', '');
        this.server = serverName;
        this.socketClient = new WebSocket(
            PRICE_REALTIME_URL.replace('{server}', this.server)
        );

        this.listenSocketEvents();
    }

    reconnect() {
        this.keepAliveInterval && clearInterval(this.keepAliveInterval);
        this.socketClient && delete this.socketClient;
        console.log(
            `%cReconnecting Price Service ...`,
            'color: #efc62f; font-weight: bold; font-family: Arial'
        );
        this.init(this.server);
    }

    keepConnectionAlive() {
        this.keepAliveInterval = setInterval(() => {
            this.ping();
        }, this.PING_INTERVAL);
    }

    listenSocketEvents() {
        this.socketClient.onopen = () => {
            emitter.emit(this.STATUSES.CONNECTED);
            this.keepConnectionAlive();

            console.info('PriceService Connected ', this.server);
            emitter.emit(Events.PRICE_SERVICE_CONNECTED);
            
        };

        this.socketClient.onmessage = message => {
            let parsedMessage = JSON.parse(message.data);
            let { type, data } = parsedMessage;
            if (!this.MESSAGES[type]) {
                return;
            }
            
            
        };

        this.socketClient.onerror = e => {
            switch (e.code) {
                case 'ECONNREFUSED':
                    this.reconnect();
                    break;
                default:
                    break;
            }
        };

        this.socketClient.onclose = e => {
            switch (e.code) {
                case 1000: // CLOSE_NORMAL
                    break;
                default:
                    // Abnormal closure
                    this.reconnect();
                    break;
            }
        };
    }

    consume(name, codes) {
        if (!this.registeredCode[name]) {
            this.registeredCode[name] = new Set();
        }
        codes.map(code => {
            if (!this.registeredCode[name].has(code)) {
                this.registeredCode[name].add(code);
            } 
        });

        if (
            this.registeredCode[name].size > 0 &&
            this.socketClient &&
            this.socketClient.readyState == 1
        ) {
            this.socketClient.send(
                JSON.stringify({
                    type: 'registConsumer',
                    data: {
                        params: {
                            name,
                            codes: Array.from(this.registeredCode[name])
                        }
                    }
                })
            );
        }
    }

    stopConsume(name, codes) {
        if (this.socketClient && this.socketClient.readyState == 1) {
            this.socketClient.send(
                JSON.stringify({
                    type: 'stopConsume',
                    data: {
                        params: {
                            name,
                            codes
                        }
                    }
                })
            );
        }
    }

    ping() {
        if (this.socketClient && this.socketClient.readyState == 1) {
            this.socketClient.send(this.SIGNALS.PING);
        }
    }
}

const priceWebSocket = new PriceWebSocket();

export default priceWebSocket;
