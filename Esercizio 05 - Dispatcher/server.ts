import * as _http from "http";
import HEADERS from "./headers.json";
import {Dispatcher} from "./Dispatcher";

const PORT :number = 1337;
let dispatcher = new Dispatcher();

const server = _http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
});

server.listen(PORT);
console.log(`Il server è in ascolto sulla porta ${PORT}`);